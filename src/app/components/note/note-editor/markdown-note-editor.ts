import { nanoid } from 'nanoid';
import { Observable, Subject } from 'rxjs';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { Logger } from '../../../core/logger';
import { Strings } from '../../../core/strings';
import { TasksCount } from '../../../core/tasks-count';
import { CollectionFileAccess } from '../../../services/collection/collection-file-access';
import { INoteEditor } from './i-note-editor';

export class MarkdownNoteEditor implements INoteEditor {
    private _content: string;
    private isFirstTimeSettingContent: boolean = true;
    private noteContentChanged: Subject<void> = new Subject<void>();

    public constructor(
        private noteId: string,
        private collectionFileAccess: CollectionFileAccess,
        private clipboard: ClipboardManager,
        private settings: BaseSettings,
        private logger: Logger
    ) {}

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

    public strikeThrough(): void {}
    public applyHeading(headingSize: number): void {}

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

            const imageId: string = nanoid();
            this.insertImage(this.clipboard.readImage(), imageId);

            const imageAnchor: string = `![${imageId}.png](./attachments/${imageId}.png)`;

            const [start, end] = [markdownInputElement.selectionStart, markdownInputElement.selectionEnd];
            markdownInputElement.setRangeText(imageAnchor, start, end, 'select');

            this.content = markdownInputElement.value;
        } catch (error) {
            this.logger.error('Could not paste image from clipboard', 'MarkdownNoteEditor', 'pasteImageFromClipboard');
        }
    }

    public focus(): void {
        let markdownInputElement: any = document.getElementById('markdown-input');
        markdownInputElement.focus();
        markdownInputElement.selectionStart = markdownInputElement.value.length;
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

    private insertImage(file: any, imageId: string): void {
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            const imageBuffer: Buffer = Buffer.from(e.target.result);
            this.collectionFileAccess.createNoteImageFileAsync(this.noteId, this.settings.activeCollection, imageBuffer, imageId);
        };

        reader.readAsArrayBuffer(file);
    }

    public applyBold(): void {
        const markdownInputElement: any = document.getElementById('markdown-input');
        const selectionText: string = markdownInputElement.value.substring(
            markdownInputElement.selectionStart,
            markdownInputElement.selectionEnd
        );

        if (Strings.isNullOrWhiteSpace(selectionText)) {
            return;
        }

        const [start, end] = [markdownInputElement.selectionStart, markdownInputElement.selectionEnd];
        markdownInputElement.setRangeText('**' + selectionText + '**', start, end, 'select');
        this.content = markdownInputElement.value;
    }
}
