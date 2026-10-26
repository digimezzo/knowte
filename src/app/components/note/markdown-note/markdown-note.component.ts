import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { INoteEditor } from '../note-editor/i-note-editor';
import { MatDialog } from '@angular/material/dialog';
import { Operation } from '../../../common/enums/operation';
import { createNoteLink, getLinkedNoteId, isNoteLink } from '../../../common/utils/note-link';
import { Logger } from '../../../common/logging/logger';
import { CollectionClient } from '../../../services/collection/collection.client';
import { NoteLinkTarget } from '../../../services/results/note-link-targets-result';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { NoteLinkDialogComponent } from '../../dialogs/note-link-dialog/note-link-dialog.component';

@Component({
    selector: 'app-markdown-note',
    templateUrl: './markdown-note.component.html',
    styleUrls: ['./markdown-note.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MarkdownNoteComponent {
    private isPickingNote: boolean = false;
    private synchronizedScrollPositions = new WeakMap<HTMLElement, number>();

    public isScrollSyncEnabled: boolean = false;

    constructor(
        private collectionClient: CollectionClient,
        private dialog: MatDialog,
        private snackBar: SnackBarService,
        private logger: Logger,
    ) {}

    @ViewChild('highlightedContent') highlightedContent: ElementRef<HTMLPreElement>;
    @ViewChild('markdownInput') markdownInput: ElementRef<HTMLTextAreaElement>;
    @ViewChild('markdownOutput', { read: ElementRef }) markdownOutput: ElementRef<HTMLElement>;

    @Input()
    public noteEditor: INoteEditor;

    @Input()
    public attachmentsDirectoryPath: string;

    public toggleScrollSync(): void {
        this.isScrollSyncEnabled = !this.isScrollSyncEnabled;
        this.synchronizedScrollPositions = new WeakMap<HTMLElement, number>();
        if (this.isScrollSyncEnabled) {
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

        const sourceRange = source.scrollHeight - source.clientHeight;
        const targetRange = Math.max(0, target.scrollHeight - target.clientHeight);
        if (sourceRange <= 0) {
            return;
        }

        const progress = Math.max(0, Math.min(1, source.scrollTop / sourceRange));
        target.scrollTop = progress * targetRange;
        this.synchronizedScrollPositions.set(target, target.scrollTop);
    }

    public onContentChange() {
        const input = this.markdownInput.nativeElement;
        const pre = this.highlightedContent.nativeElement;

        // Ensure pre scrolls to match textarea after content change
        pre.scrollTop = input.scrollTop;
        pre.scrollLeft = input.scrollLeft;
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
