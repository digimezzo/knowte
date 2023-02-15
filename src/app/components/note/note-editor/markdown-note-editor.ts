import { nanoid } from 'nanoid';
import { Observable, Subject } from 'rxjs';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { FileAccess } from '../../../core/file-access';
import { Logger } from '../../../core/logger';
import { TasksCount } from '../../../core/tasks-count';
import { CollectionFileAccess } from '../../../services/collection/collection-file-access';
import { INoteEditor } from './i-note-editor';

export class MarkdownNoteEditor implements INoteEditor {
    private _content: string;
    private noteContentChanged: Subject<void> = new Subject<void>();

    public constructor(
        private noteId: string,
        private collectionFileAccess: CollectionFileAccess,
        private clipboard: ClipboardManager,
        private fileAccess: FileAccess,
        private settings: BaseSettings,
        private logger: Logger
    ) {}

    public noteContentChanged$: Observable<void> = this.noteContentChanged.asObservable();

    public get content(): string {
        return this._content;
    }

    public set content(v: string) {
        this._content = v;
        this.noteContentChanged.next();
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

    public async initializeAsync(): Promise<void> {}

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

    public setNoteContent(content: string): void {
        this._content = content;
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

    public focus(): void {}

    public applyZoomPercentageFromSettings(): void {}

    private insertImage(file: any, imageId: string): void {
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            const imageBuffer: Buffer = Buffer.from(e.target.result);
            this.collectionFileAccess.createNoteImageFileAsync(this.noteId, this.settings.activeCollection, imageBuffer, imageId);
        };

        reader.readAsArrayBuffer(file);
    }
}
