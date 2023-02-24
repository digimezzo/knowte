import { nanoid } from 'nanoid';
import { Observable, Subject, Subscription } from 'rxjs';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { Desktop } from '../../../core/desktop';
import { Logger } from '../../../core/logger';
import { Strings } from '../../../core/strings';
import { TasksCount } from '../../../core/tasks-count';
import { INoteEditor } from './i-note-editor';
import { NoteImageSaver } from './note-image-saver';

export class MarkdownNoteEditor implements INoteEditor {
    private _content: string;
    private isFirstTimeSettingContent: boolean = true;
    private noteContentChanged: Subject<void> = new Subject<void>();
    private subscription: Subscription = new Subscription();

    public constructor(
        public noteId: string,
        private noteImageSaver: NoteImageSaver,
        private clipboard: ClipboardManager,
        private desktop: Desktop,
        private settings: BaseSettings,
        private logger: Logger
    ) {
        this.subscription.add(
            this.noteImageSaver.imageSaved$.subscribe((imageId) => {
                this.insertImage(imageId);
            })
        );

        document.addEventListener('dblclick', (event: any) => this.ignoreTargetImages(event));
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
        const markdownOutputElement: HTMLElement = document.getElementById('markdown-output');

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
            let markdownInputElement: any = document.getElementById('markdown-input');

            if (markdownInputElement === null || markdownInputElement === undefined) {
                return;
            }

            this.saveImageFile(this.clipboard.readImage());
        } catch (error) {
            this.logger.error('Could not paste image from clipboard', 'MarkdownNoteEditor', 'pasteImageFromClipboard');
        }
    }

    private insertText(textToInsert: string): void {
        const markdownInputElement: any = document.getElementById('markdown-input');

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
            let markdownInputElement: any = document.getElementById('markdown-input');
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

        const markdownInputElement: any = document.getElementById('markdown-input');

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
        this.applyFormatting('**');
    }

    public applyItalic(): void {
        this.applyFormatting('*');
    }

    public applyStrikeThrough(): void {
        this.applyFormatting('~~');
    }

    public insertLink(): void {
        this.insertText('[](https://)');
    }

    public applyQuote(): void {
        this.applyHeadingFormatting('> ');
    }

    public applyCode(): void {
        this.applyFormatting('```');
    }

    private applyFormatting(formatting: string): void {
        const markdownInputElement: any = document.getElementById('markdown-input');
        const selectionText: string = markdownInputElement.value.substring(
            markdownInputElement.selectionStart,
            markdownInputElement.selectionEnd
        );

        if (Strings.isNullOrWhiteSpace(selectionText)) {
            const pattern: RegExp = /\r?\n|\r|\s/;

            const originalCursorIndex: number = markdownInputElement.selectionStart;
            let wordStartIndex: number = 0;

            for (let index = 0; index < markdownInputElement.selectionStart; index++) {
                if (markdownInputElement.value.substr(index, 1).match(pattern)) {
                    wordStartIndex = index + 1;
                }
            }

            let wordEndIndex: number = markdownInputElement.selectionEnd;

            let foundEndOfWord: boolean = false;

            for (let index = markdownInputElement.selectionStart; index < markdownInputElement.selectionStart + 100; index++) {
                if (markdownInputElement.value.substr(index, 1).match(pattern)) {
                    if (!foundEndOfWord) {
                        foundEndOfWord = true;
                        wordEndIndex = index + 1;
                    }
                }
            }

            markdownInputElement.focus();

            markdownInputElement.setSelectionRange(wordStartIndex, wordStartIndex);
            this.insertText(formatting);

            const wordEndIndexAfterAddingStartFormatting: number = wordEndIndex + formatting.length - 1;
            markdownInputElement.setSelectionRange(wordEndIndexAfterAddingStartFormatting, wordEndIndexAfterAddingStartFormatting);
            this.insertText(formatting);

            const cursorIndexAfterAddingFormatting: number = originalCursorIndex + formatting.length;
            markdownInputElement.setSelectionRange(cursorIndexAfterAddingFormatting, cursorIndexAfterAddingFormatting);
        } else {
            this.insertText(`${formatting}${selectionText}${formatting}`);
        }
    }

    private applyHeadingFormatting(formatting: string): void {
        const markdownInputElement: any = document.getElementById('markdown-input');
        const pattern: RegExp = /\r?\n|\r/;

        const originalCursorIndex: number = markdownInputElement.selectionStart;
        let lineStartIndex: number = 0;

        for (let index = 0; index < markdownInputElement.selectionStart; index++) {
            if (markdownInputElement.value.substr(index, 1).match(pattern)) {
                lineStartIndex = index + 1;
            }
        }

        markdownInputElement.focus();
        markdownInputElement.setSelectionRange(lineStartIndex, lineStartIndex);

        this.insertText(formatting);

        const cursorIndexAfterAddingFormatting: number = originalCursorIndex + formatting.length;
        markdownInputElement.setSelectionRange(cursorIndexAfterAddingFormatting, cursorIndexAfterAddingFormatting);
    }

    private ignoreTargetImages(event: any): void {
        let imagePath: string = '';

        try {
            if (event.target.tagName === 'IMG') {
                imagePath = event.target.currentSrc;
                imagePath = Strings.replaceAll(imagePath, 'file://', '');
                imagePath = Strings.replaceAll(imagePath, '%20', ' ');

                if (imagePath.includes(':/')) {
                    imagePath = Strings.replaceAll(imagePath, '/', '\\');
                }

                this.desktop.openPath(imagePath);
            }
        } catch (error) {
            this.logger.error(`Could not open image '${imagePath}'`, 'MarkdownNoteEditor', 'ignoreTargetImages');
        }
    }
}
