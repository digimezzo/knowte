import { Observable, Subject } from 'rxjs';
import { TasksCount } from '../../../core/tasks-count';
import { INoteEditor } from './i-note-editor';

export class MarkdownNoteEditor implements INoteEditor {
    private _content: string;
    private noteTextChanged: Subject<void> = new Subject<void>();

    public noteTextChanged$: Observable<void> = this.noteTextChanged.asObservable();

    public get content(): string {
        return this._content;
    }
    public set content(v: string) {
        this._content = v;
        this.noteTextChanged.next();
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

    public getNoteText(): string {
        return this.content;
    }

    public getNoteContent(): string {
        return this.content;
    }

    public getNoteHtml(): string {
        return '';
    }

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
