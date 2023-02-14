import { Observable, Subject } from 'rxjs';
import { TasksCount } from '../../../core/tasks-count';
import { INoteEditor } from './i-note-editor';
import { ImagePathConverter } from './image-path-replacer';

export class MarkdownNoteEditor implements INoteEditor {
    private _content: string;
    private noteContentChanged: Subject<void> = new Subject<void>();

    public constructor(private imagePathConverter: ImagePathConverter) {}

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
        const markdownElement: HTMLElement = document.getElementById('markdown');

        if (markdownElement === null || markdownElement === undefined) {
            return '';
        }

        return markdownElement.innerHTML;
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
        return new TasksCount(0, 0);
    }

    public setNoteContent(content: string): void {
        this._content = content;
    }

    public pasteImageFromClipboard(): void {}

    public focus(): void {}

    public applyZoomPercentageFromSettings(): void {}
}
