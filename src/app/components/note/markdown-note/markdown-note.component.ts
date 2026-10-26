import { AfterViewInit, Component, ElementRef, Input, OnDestroy, SecurityContext, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownService } from 'ngx-markdown';
import { INoteEditor } from '../note-editor/i-note-editor';
import { MatDialog } from '@angular/material/dialog';
import { Operation } from '../../../common/enums/operation';
import { createNoteLink, getLinkedNoteId, isNoteLink } from '../../../common/utils/note-link';
import { Logger } from '../../../common/logging/logger';
import { CollectionClient } from '../../../services/collection/collection.client';
import { NoteLinkTarget } from '../../../services/results/note-link-targets-result';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { NoteLinkDialogComponent } from '../../dialogs/note-link-dialog/note-link-dialog.component';
import { MarkdownScrollMap } from './markdown-scroll-map';

@Component({
    selector: 'app-markdown-note',
    templateUrl: './markdown-note.component.html',
    styleUrls: ['./markdown-note.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MarkdownNoteComponent implements AfterViewInit, OnDestroy {
    private isPickingNote: boolean = false;
    private synchronizedScrollPositions = new WeakMap<HTMLElement, number>();
    private scrollMap: MarkdownScrollMap;
    private resizeObserver: ResizeObserver;
    private mutationObserver: MutationObserver;
    private layoutFrame: number | undefined;
    private previewNeedsMapping: boolean = true;
    private lastScrollFromEditor: boolean = true;
    private destroyed: boolean = false;
    private onImageLayout = () => this.scheduleScrollLayout();

    public isScrollSyncEnabled: boolean = true;

    constructor(
        private collectionClient: CollectionClient,
        private dialog: MatDialog,
        private snackBar: SnackBarService,
        private logger: Logger,
        private markdownService: MarkdownService,
        private sanitizer: DomSanitizer,
    ) {}

    @ViewChild('highlightedContent') highlightedContent: ElementRef<HTMLPreElement>;
    @ViewChild('markdownInput') markdownInput: ElementRef<HTMLTextAreaElement>;
    @ViewChild('markdownOutput', { read: ElementRef }) markdownOutput: ElementRef<HTMLElement>;

    @Input()
    public noteEditor: INoteEditor;

    @Input()
    public attachmentsDirectoryPath: string;

    public ngAfterViewInit(): void {
        const input = this.markdownInput.nativeElement;
        const preview = this.markdownOutput.nativeElement;
        this.scrollMap = new MarkdownScrollMap(input, preview, this.markdownService.options,
            (html) => this.sanitizer.sanitize(SecurityContext.HTML, html) || '');
        this.resizeObserver = new ResizeObserver(() => this.scheduleScrollLayout());
        this.resizeObserver.observe(input);
        this.resizeObserver.observe(preview);
        this.mutationObserver = new MutationObserver(() => this.scheduleScrollLayout());
        this.mutationObserver.observe(input, { attributes: true, attributeFilter: ['style', 'class'] });
        this.mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
        preview.addEventListener('load', this.onImageLayout, true);
        preview.addEventListener('error', this.onImageLayout, true);
        document.fonts?.addEventListener('loadingdone', this.onImageLayout);
        this.scheduleScrollLayout();
    }

    public ngOnDestroy(): void {
        this.destroyed = true;
        this.resizeObserver?.disconnect();
        this.mutationObserver?.disconnect();
        this.markdownOutput?.nativeElement.removeEventListener('load', this.onImageLayout, true);
        this.markdownOutput?.nativeElement.removeEventListener('error', this.onImageLayout, true);
        document.fonts?.removeEventListener('loadingdone', this.onImageLayout);
        if (this.layoutFrame !== undefined) {
            cancelAnimationFrame(this.layoutFrame);
        }
        this.scrollMap?.destroy();
    }

    public onPreviewReady(): void {
        this.previewNeedsMapping = true;
        this.scheduleScrollLayout();
    }

    private scheduleScrollLayout(): void {
        if (this.destroyed || this.layoutFrame !== undefined) {
            return;
        }
        this.scrollMap?.invalidate();
        this.layoutFrame = requestAnimationFrame(() => {
            this.layoutFrame = undefined;
            if (!this.scrollMap || !this.isScrollSyncEnabled || !this.noteEditor.isEditing) {
                return;
            }
            if (this.previewNeedsMapping) {
                try {
                    this.scrollMap.update(this.noteEditor.content);
                    this.previewNeedsMapping = false;
                } catch (error) {
                    this.reportScrollMappingError(error);
                    return;
                }
            }
            this.synchronizedScrollPositions = new WeakMap<HTMLElement, number>();
            if (this.lastScrollFromEditor) {
                this.onEditorScroll();
            } else {
                this.onPreviewScroll();
            }
        });
    }

    public toggleScrollSync(): void {
        this.isScrollSyncEnabled = !this.isScrollSyncEnabled;
        this.synchronizedScrollPositions = new WeakMap<HTMLElement, number>();
        if (this.isScrollSyncEnabled) {
            this.lastScrollFromEditor = true;
            this.scheduleScrollLayout();
            this.onEditorScroll();
        }
    }

    public onEditorScroll(): void {
        this.onContentChange();
        this.synchronizeScroll(this.markdownInput.nativeElement, this.markdownOutput.nativeElement);
    }

    public onPreviewScroll(): void {
        this.synchronizeScroll(this.markdownOutput.nativeElement, this.markdownInput.nativeElement);
        this.onContentChange();
    }

    private synchronizeScroll(source: HTMLElement, target: HTMLElement): void {
        if (!this.isScrollSyncEnabled || !this.noteEditor.isEditing) {
            return;
        }

        const synchronizedPosition = this.synchronizedScrollPositions.get(source);
        this.synchronizedScrollPositions.delete(source);
        // Ignore scroll events caused by synchronizing the other pane, including pixel rounding.
        if (synchronizedPosition !== undefined && Math.abs(source.scrollTop - synchronizedPosition) < 1) {
            return;
        }
        if (this.previewNeedsMapping) {
            this.scheduleScrollLayout();
            return;
        }
        this.lastScrollFromEditor = source === this.markdownInput.nativeElement;

        const sourceRange = source.scrollHeight - source.clientHeight;
        const targetRange = Math.max(0, target.scrollHeight - target.clientHeight);
        if (sourceRange <= 0) {
            return;
        }

        let position: number;
        try {
            position = this.scrollMap.position(source.scrollTop, this.lastScrollFromEditor);
        } catch (error) {
            this.reportScrollMappingError(error);
            return;
        }
        target.scrollTop = Math.max(0, Math.min(targetRange, position));
        this.synchronizedScrollPositions.set(target, target.scrollTop);
    }

    private reportScrollMappingError(error: unknown): void {
        this.logger.error(`Could not map Markdown scrolling. Cause: ${error}`, 'MarkdownNoteComponent', 'synchronizeScroll');
        this.isScrollSyncEnabled = false;
        void this.snackBar.oopsAnErrorOccurredAsync();
    }

    public onContentChange() {
        const input = this.markdownInput.nativeElement;
        const pre = this.highlightedContent.nativeElement;

        // Ensure pre scrolls to match textarea after content change
        pre.scrollTop = input.scrollTop;
        pre.scrollLeft = input.scrollLeft;
    }

    public onEditorContentChange(): void {
        this.lastScrollFromEditor = true;
        this.previewNeedsMapping = true;
        this.onContentChange();
        this.scheduleScrollLayout();
    }

    public onTabKey(event: Event): void {
        event.preventDefault();
        const textarea = this.markdownInput.nativeElement;

        // Use execCommand to insert spaces so the action is undoable (Ctrl+Z)
        document.execCommand('insertText', false, '    ');
    }

    public onHighlightShortcut(event: Event): void {
        if (!this.noteEditor.isEditing) {
            return;
        }

        event.preventDefault();
        this.noteEditor.applyHighlight();
    }

    public toggleIsEditing(): void {
        this.noteEditor.isEditing = !this.noteEditor.isEditing;
        if (this.noteEditor.isEditing) {
            this.lastScrollFromEditor = false;
        }
        this.scheduleScrollLayout();
    }

    public async insertNoteLinkAsync(): Promise<void> {
        if (!this.noteEditor.isEditing || this.isPickingNote) {
            return;
        }
        const input = this.markdownInput.nativeElement;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        this.isPickingNote = true;
        try {
            const result = await this.collectionClient.getNoteLinkTargetsAsync();
            if (result.operation !== Operation.Success) {
                await this.snackBar.oopsAnErrorOccurredAsync();
                return;
            }
            const dialogRef = this.dialog.open<NoteLinkDialogComponent, NoteLinkTarget[], NoteLinkTarget>(NoteLinkDialogComponent, {
                width: '550px',
                data: result.notes,
            });
            const target = await dialogRef.afterClosed().toPromise();
            if (target && this.noteEditor.isEditing) {
                input.focus();
                input.setSelectionRange(start, end);
                document.execCommand('insertText', false, createNoteLink(target.id, target.title));
            }
        } catch (error) {
            this.logger.error(`Could not insert note link. Cause: ${error}`, 'MarkdownNoteComponent', 'insertNoteLinkAsync');
            await this.snackBar.oopsAnErrorOccurredAsync();
        } finally {
            this.isPickingNote = false;
        }
    }

    public async onPreviewClickAsync(event: MouseEvent): Promise<void> {
        if (event.button > 1) {
            return;
        }
        const anchor = event.target instanceof Element ? event.target.closest('a') : null;
        const href = anchor?.getAttribute('href') || '';
        if (!isNoteLink(href)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const noteId = getLinkedNoteId(href);
        if (!noteId) {
            await this.snackBar.linkedNoteUnavailableAsync();
            return;
        }
        try {
            const operation = await this.collectionClient.openLinkedNoteAsync(noteId);
            if (operation === Operation.Blank) {
                await this.snackBar.linkedNoteUnavailableAsync();
            } else if (operation !== Operation.Success) {
                await this.snackBar.oopsAnErrorOccurredAsync();
            }
        } catch (error) {
            this.logger.error(`Could not follow note link. Cause: ${error}`, 'MarkdownNoteComponent', 'onPreviewClickAsync');
            await this.snackBar.oopsAnErrorOccurredAsync();
        }
    }

    public highlightMarkdown(text: string): string {
        if (!text) {
            return '';
        }

        // Handle final newlines (See: https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/)
        if (text[text.length - 1] == '\n') {
            // If the last character is a newline character
            text += ' '; // Add a placeholder space character to the final line
        }

        const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const highlighted = escaped
            .replace(/^### (.*)$/gm, '<span class="md-title-3">### $1</span>')
            .replace(/^## (.*)$/gm, '<span class="md-title-2">## $1</span>')
            .replace(/^# (.*)$/gm, '<span class="md-title-1"># $1</span>');

        return highlighted;
    }
}
