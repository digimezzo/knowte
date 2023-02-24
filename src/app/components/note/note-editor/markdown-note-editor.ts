import { nanoid } from 'nanoid';
import { Observable, Subject, Subscription } from 'rxjs';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { Desktop } from '../../../core/desktop';
import { Logger } from '../../../core/logger';
import { PathConverter } from '../../../core/path-converter';
import { Strings } from '../../../core/strings';
import { TasksCount } from '../../../core/tasks-count';
import { BoundaryGetter } from './boundary-getter';
import { INoteEditor } from './i-note-editor';
import { LineBoundary } from './line-boundary';
import { NoteImageSaver } from './note-image-saver';
import { WordBoundary } from './word-boundary';

export class MarkdownNoteEditor implements INoteEditor {
    private _content: string;
    private isFirstTimeSettingContent: boolean = true;
    private noteContentChanged: Subject<void> = new Subject<void>();
    private subscription: Subscription = new Subscription();

    public constructor(
        public noteId: string,
        private noteImageSaver: NoteImageSaver,
        private clipboard: ClipboardManager,
        private boundaryGetter: BoundaryGetter,
        private pathConverter: PathConverter,
        private desktop: Desktop,
        private settings: BaseSettings,
        private logger: Logger
    ) {
        this.subscription.add(
            this.noteImageSaver.imageSaved$.subscribe((imageId) => {
                this.insertImage(imageId);
            })
        );

        document.addEventListener('dblclick', (event: any) => this.openIfImage(event));
    }

    public isEditing: boolean;

    public noteContentChanged$: Observable<void> = this.noteContentChanged.asObservable();

    public get content(): string {
        return this._content;
    }

    public set content(v: string) {
        this._content = v;

        if (!this.isFirstTimeSettingContent) {
            this.noteContentChanged.next();
        }

        this.isFirstTimeSettingContent = false;
    }

    public get text(): string {
        return this._content;
    }

    public set text(v: string) {}

    public get html(): string {
        const markdownOutputElement: HTMLElement = this.getMarkdownInputElement();

        if (markdownOutputElement === null || markdownOutputElement === undefined) {
            return '';
        }

        return markdownOutputElement.innerHTML;
    }

    public async initializeAsync(): Promise<void> {
        this.applyZoomPercentageFromSettings();
    }

    public applyHeading(headingSize: number): void {
        if (headingSize === 1) {
            this.applyHeadingFormatting('# ');
        } else if (headingSize === 2) {
            this.applyHeadingFormatting('## ');
        } else if (headingSize === 3) {
            this.applyHeadingFormatting('### ');
        }
    }

    public hasSelectedText(): boolean {
        return false;
    }

    public performCut(): void {}

    public performCopy(): void {}

    public performPaste(): void {}

    public performDelete(): void {}

    public getTasksCount(): TasksCount {
        const openTasksCount: number = (this.content.match(/- \[ \]/g) || []).length;
        const closedTasksCount: number = (this.content.match(/- \[x\]/g) || []).length;

        return new TasksCount(openTasksCount, closedTasksCount);
    }

    public pasteImageFromClipboard(): void {
        try {
            const markdownInputElement: any = this.getMarkdownInputElement();

            if (markdownInputElement === null || markdownInputElement === undefined) {
                return;
            }

            this.saveImageFile(this.clipboard.readImage());
        } catch (error) {
            this.logger.error('Could not paste image from clipboard', 'MarkdownNoteEditor', 'pasteImageFromClipboard');
        }
    }

    private insertText(textToInsert: string): void {
        const markdownInputElement: any = this.getMarkdownInputElement();

        if (!this.isEditing) {
            return;
        }

        markdownInputElement.focus();
        document.execCommand('insertText', false, textToInsert);
    }

    private insertImage(imageId: string): void {
        // setTimeout required to ensure that the file exists before the link is pasted
        setTimeout(() => {
            this.insertText(`![${imageId}.png](./attachments/${imageId}.png)`);
        }, 50);
    }

    public focus(): void {
        // setTimeout required to ensure that markdown-input is visible before setting focus
        setTimeout(() => {
            let markdownInputElement: any = this.getMarkdownInputElement();
            markdownInputElement.focus();
            markdownInputElement.selectionStart = markdownInputElement.value.length;
        }, 50);
    }

    public applyZoomPercentageFromSettings(): void {
        const pFontSize: number = (13 * this.settings.noteZoomPercentage) / 100;
        const h1FontSize: number = pFontSize * 2;
        const h2FontSize: number = pFontSize * 1.5;
        const h3FontSize: number = pFontSize * 1.25;
        const h4FontSize: number = pFontSize * 1;
        const h5FontSize: number = pFontSize * 0.875;
        const h6FontSize: number = pFontSize * 0.85;

        const markdownInputElement: any = this.getMarkdownInputElement();

        if (markdownInputElement !== null && markdownInputElement !== undefined) {
            markdownInputElement.style.fontSize = pFontSize + 'px';
        }

        const element: HTMLElement = document.documentElement;

        element.style.setProperty('--editor-p-font-size', pFontSize + 'px');
        element.style.setProperty('--editor-input-size', pFontSize + 'px');

        element.style.setProperty('--editor-h1-font-size', h1FontSize + 'px');
        element.style.setProperty('--editor-h2-font-size', h2FontSize + 'px');
        element.style.setProperty('--editor-h3-font-size', h3FontSize + 'px');
        element.style.setProperty('--editor-h4-font-size', h4FontSize + 'px');
        element.style.setProperty('--editor-h5-font-size', h5FontSize + 'px');
        element.style.setProperty('--editor-h6-font-size', h6FontSize + 'px');
    }

    private saveImageFile(file: any): void {
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            const imageBuffer: Buffer = Buffer.from(e.target.result);
            const imageId: string = nanoid();
            this.noteImageSaver.saveImageAsync(this.noteId, this.settings.activeCollection, imageBuffer, imageId);
        };

        reader.readAsArrayBuffer(file);
    }

    public applyBold(): void {
        this.applyFormatting('**', false);
    }

    public applyItalic(): void {
        this.applyFormatting('*', false);
    }

    public applyStrikeThrough(): void {
        this.applyFormatting('~~', false);
    }

    public insertLink(): void {
        this.insertText('[](https://)');
    }

    public insertTable(): void {
        this.insertText('| | | |\n|-|-|-|\n| | | |\n| | | |');
    }

    public applyQuote(): void {
        this.applyHeadingFormatting('> ');
    }

    public applyCode(): void {
        if (this.areMultipleLinesSelected()) {
            this.applyFormatting('```', true);
        } else {
            this.applyFormatting('`', false);
        }
    }

    private getSelectedText(element: any): string {
        const selectedText: string = element.value.substring(element.selectionStart, element.selectionEnd);

        return selectedText;
    }

    private areMultipleLinesSelected(): boolean {
        const markdownInputElement: any = this.getMarkdownInputElement();
        const selectedText: string = this.getSelectedText(markdownInputElement);

        return selectedText.includes('\n') || selectedText.includes('\r');
    }

    private applyFormatting(formatting: string, addNewLines: boolean): void {
        const markdownInputElement: any = this.getMarkdownInputElement();
        const selectedText: string = this.getSelectedText(markdownInputElement);

        if (Strings.isNullOrWhiteSpace(selectedText)) {
            const originalCursorIndex: number = markdownInputElement.selectionStart;
            const wordBoundary: WordBoundary = this.boundaryGetter.getWordBoundary(markdownInputElement);

            markdownInputElement.focus();

            markdownInputElement.setSelectionRange(wordBoundary.start, wordBoundary.end);

            this.insertText(formatting);

            const wordEndIndexAfterAddingStartFormatting: number = wordBoundary.end + formatting.length - 1;
            markdownInputElement.setSelectionRange(wordEndIndexAfterAddingStartFormatting, wordEndIndexAfterAddingStartFormatting);

            this.insertText(formatting);

            const cursorIndexAfterAddingFormatting: number = originalCursorIndex + formatting.length;
            markdownInputElement.setSelectionRange(cursorIndexAfterAddingFormatting, cursorIndexAfterAddingFormatting);
        } else {
            if (addNewLines) {
                this.insertText(`${formatting}\n${selectedText}\n${formatting}`);
            } else {
                this.insertText(`${formatting}${selectedText}${formatting}`);
            }
        }
    }

    private applyHeadingFormatting(formatting: string): void {
        const markdownInputElement: any = this.getMarkdownInputElement();

        const originalCursorIndex: number = markdownInputElement.selectionStart;
        const lineBoundary: LineBoundary = this.boundaryGetter.getLineBoundary(markdownInputElement);

        markdownInputElement.focus();
        markdownInputElement.setSelectionRange(lineBoundary.start, lineBoundary.start);

        this.insertText(formatting);

        const cursorIndexAfterAddingFormatting: number = originalCursorIndex + formatting.length;
        markdownInputElement.setSelectionRange(cursorIndexAfterAddingFormatting, cursorIndexAfterAddingFormatting);
    }

    private openIfImage(event: any): void {
        let imagePath: string = '';

        try {
            if (event.target.tagName.toUpperCase() === 'IMG') {
                imagePath = this.pathConverter.fileUriToOperatingSystemPath(event.target.currentSrc);
                this.desktop.openPath(imagePath);
            }
        } catch (error) {
            this.logger.error(`Could not open image '${imagePath}'. Error: ${error.message}`, 'MarkdownNoteEditor', 'openIfImage');
        }
    }

    private getMarkdownInputElement(): any {
        return document.getElementById('markdown-input');
    }
}
