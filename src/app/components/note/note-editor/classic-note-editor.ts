import * as Quill from 'quill';
import { Observable, Subject } from 'rxjs';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { Logger } from '../../../core/logger';
import { TasksCount } from '../../../core/tasks-count';
import { QuillFactory } from '../quill-factory';
import { QuillTweaker } from '../quill-tweaker';
import { INoteEditor } from './i-note-editor';

export class ClassicNoteEditor implements INoteEditor {
    private quill: Quill;
    private noteTextChanged: Subject<void> = new Subject<void>();

    public constructor(
        private quillFactory: QuillFactory,
        private quillTweaker: QuillTweaker,
        private clipboard: ClipboardManager,
        private settings: BaseSettings,
        private logger: Logger
    ) {}

    public content: string;

    public noteTextChanged$: Observable<void> = this.noteTextChanged.asObservable();

    public async initializeAsync(): Promise<void> {
        await this.configureQuillEditorAsync();
        this.applyZoomPercentageFromSettings();
    }

    private async configureQuillEditorAsync(): Promise<void> {
        this.quill = await this.quillFactory.createAsync('#editor', this.performUndo.bind(this), this.performRedo.bind(this));
        await this.quillTweaker.setToolbarTooltipsAsync();
        this.quillTweaker.forcePasteOfUnformattedText(this.quill);
        this.quillTweaker.assignActionToControlKeyCombination(this.quill, 'Y', this.performRedo.bind(this));
        this.quillTweaker.assignActionToTextChange(this.quill, this.onNoteTextChange.bind(this));
    }

    private onNoteTextChange(): void {
        this.noteTextChanged.next();
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
                this.logger.error(`Could not perform undo. Cause: ${error}`, 'NoteComponent', 'performUndo');
            }
        }
    }

    private performRedo(): void {
        if (this.quill != undefined && this.quill.history != undefined) {
            try {
                this.quill.history.redo();
            } catch (error) {
                this.logger.error(`Could not perform redo. Cause: ${error}`, 'NoteComponent', 'performRedo');
            }
        }
    }

    public pasteImageFromClipboard(): void {
        try {
            this.insertImage(this.clipboard.readImage());
        } catch (error) {
            this.logger.error('Could not paste as image', 'NoteComponent', 'performPaste');
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

    public strikeThrough(): void {
        const range: any = this.quill.getSelection();
        const format: any = this.quill.getFormat(range.index, range.length);
        const formatString: string = JSON.stringify(format);

        const applyStrikeThrough: boolean = !formatString.includes('strike');
        this.quill.formatText(range.index, range.length, 'strike', applyStrikeThrough);
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

    public getNoteText(): string {
        return this.quill.getText();
    }

    public getNoteContent(): string {
        return JSON.stringify(this.quill.getContents());
    }

    public getNoteHtml(): string {
        return this.quill.root.innerHTML;
    }

    public getTasksCount(): TasksCount {
        const noteContent: string = this.getNoteContent();
        const openTasksCount: number = (noteContent.match(/"list":"unchecked"/g) || []).length;
        const closedTasksCount: number = (noteContent.match(/"list":"checked"/g) || []).length;

        return new TasksCount(openTasksCount, closedTasksCount);
    }

    public setNoteContent(content: string): void {
        this.quill.setContents(JSON.parse(content), 'silent');
        this.quill.history.clear();
    }

    public focus(): void {
        this.quill.setSelection(0, 0);
    }

    public applyZoomPercentageFromSettings(): void {
        const pFontSize: number = (13 * this.settings.noteZoomPercentage) / 100;
        const h1FontSize: number = pFontSize * 1.7;
        const h2FontSize: number = pFontSize * 1.5;

        const element: HTMLElement = document.documentElement;

        element.style.setProperty('--editor-p-font-size', pFontSize + 'px');
        element.style.setProperty('--editor-h1-font-size', h1FontSize + 'px');
        element.style.setProperty('--editor-h2-font-size', h2FontSize + 'px');
    }
}