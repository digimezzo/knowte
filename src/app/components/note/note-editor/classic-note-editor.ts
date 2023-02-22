import * as Quill from 'quill';
import { Observable, Subject } from 'rxjs';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { Logger } from '../../../core/logger';
import { TasksCount } from '../../../core/tasks-count';
import { INoteEditor } from './i-note-editor';
import { QuillFactory } from './quill-factory';
import { QuillTweaker } from './quill-tweaker';

export class ClassicNoteEditor implements INoteEditor {
    private quill: Quill;
    private noteContentChanged: Subject<void> = new Subject<void>();

    public constructor(
        private quillFactory: QuillFactory,
        private quillTweaker: QuillTweaker,
        private clipboard: ClipboardManager,
        private settings: BaseSettings,
        private logger: Logger
    ) {}

    public isEditing: boolean;

    public get text(): string {
        return this.quill.getText();
    }

    public set text(v: string) {}

    public get content(): string {
        return JSON.stringify(this.quill.getContents());
    }

    public set content(v: string) {
        this.quill.setContents(JSON.parse(v), 'silent');
        this.quill.history.clear();
    }

    public get html(): string {
        return this.quill.root.innerHTML;
    }
    public set html(v: string) {}

    public noteContentChanged$: Observable<void> = this.noteContentChanged.asObservable();

    public async initializeAsync(): Promise<void> {
        await this.configureQuillEditorAsync();
        this.applyZoomPercentageFromSettings();
    }

    private async configureQuillEditorAsync(): Promise<void> {
        this.quill = await this.quillFactory.createAsync('#editor', this.performUndo.bind(this), this.performRedo.bind(this));
        await this.quillTweaker.setToolbarTooltipsAsync();
        this.quillTweaker.forcePasteOfUnformattedText(this.quill);
        this.quillTweaker.assignActionToControlKeyCombination(this.quill, 'Y', this.performRedo.bind(this));
        this.quillTweaker.assignActionToTextChange(this.quill, this.onNoteContentChange.bind(this));
    }

    private onNoteContentChange(): void {
        this.noteContentChanged.next();
    }

    public hasSelectedText(): boolean {
        const range: any = this.quill.getSelection();

        if (range && range.length > 0) {
            return true;
        }

        return false;
    }

    public performCut(): void {
        const range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        const text: string = this.quill.getText(range.index, range.length);
        this.clipboard.writeText(text);
        this.quill.deleteText(range.index, range.length);
    }

    public performCopy(): void {
        const range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        const text: string = this.quill.getText(range.index, range.length);
        this.clipboard.writeText(text);
    }

    public performPaste(): void {
        if (this.clipboard.containsImage()) {
            // Image found on clipboard. Try to paste as JPG.
            this.pasteImageFromClipboard();
        } else {
            // No image found on clipboard. Try to paste as text.
            this.pastTextFromClipboard();
        }
    }

    public performDelete(): void {
        const range: any = this.quill.getSelection();

        if (!range || range.length === 0) {
            return;
        }

        this.quill.deleteText(range.index, range.length);
    }

    private performUndo(): void {
        if (this.quill != undefined && this.quill.history != undefined) {
            try {
                this.quill.history.undo();
            } catch (error) {
                this.logger.error(`Could not perform undo. Cause: ${error}`, 'ClassicNoteEditor', 'performUndo');
            }
        }
    }

    private performRedo(): void {
        if (this.quill != undefined && this.quill.history != undefined) {
            try {
                this.quill.history.redo();
            } catch (error) {
                this.logger.error(`Could not perform redo. Cause: ${error}`, 'ClassicNoteEditor', 'performRedo');
            }
        }
    }

    public pasteImageFromClipboard(): void {
        try {
            this.insertImage(this.clipboard.readImage());
        } catch (error) {
            this.logger.error('Could not paste image from clipboard', 'ClassicNoteEditor', 'pasteImageFromClipboard');
        }
    }

    private insertImage(file: any): void {
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            const img: HTMLImageElement = document.createElement('img');
            img.src = e.target.result;

            const range: Range = window.getSelection().getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
        };

        reader.readAsDataURL(file);
    }

    private pastTextFromClipboard(): void {
        const range: any = this.quill.getSelection();

        if (!range) {
            return;
        }

        const clipboardText: string = this.clipboard.readText();

        if (clipboardText) {
            this.quill.insertText(range.index, clipboardText);
        }
    }

    public applyHeading(headingSize: number): void {
        const range: any = this.quill.getSelection();
        const format: any = this.quill.getFormat(range.index, range.length);
        const formatString: string = JSON.stringify(format);

        const selectionContainsHeader: boolean = !formatString.includes(`"header":${headingSize}`);

        if (selectionContainsHeader) {
            this.quill.format('header', headingSize);
        } else {
            this.quill.removeFormat(range.index, range.length);
        }
    }

    public getTasksCount(): TasksCount {
        const openTasksCount: number = (this.content.match(/"list":"unchecked"/g) || []).length;
        const closedTasksCount: number = (this.content.match(/"list":"checked"/g) || []).length;

        return new TasksCount(openTasksCount, closedTasksCount);
    }

    public focus(): void {
        this.quill.setSelection(0, 0);
    }

    public applyZoomPercentageFromSettings(): void {
        const pFontSize: number = (13 * this.settings.noteZoomPercentage) / 100;
        const h1FontSize: number = pFontSize * 2;
        const h2FontSize: number = pFontSize * 1.5;

        const element: HTMLElement = document.documentElement;

        element.style.setProperty('--editor-p-font-size', pFontSize + 'px');
        element.style.setProperty('--editor-h1-font-size', h1FontSize + 'px');
        element.style.setProperty('--editor-h2-font-size', h2FontSize + 'px');
    }

    public applyBold(): void {
        // Not used in ClassicNoteEditor
    }

    public applyItalic(): void {
        // Not used in ClassicNoteEditor
    }

    public applyStrikeThrough(): void {
        const range: any = this.quill.getSelection();
        const format: any = this.quill.getFormat(range.index, range.length);
        const formatString: string = JSON.stringify(format);

        const applyStrikeThrough: boolean = !formatString.includes('strike');
        this.quill.formatText(range.index, range.length, 'strike', applyStrikeThrough);
    }
}
