import { Observable } from 'rxjs';
import { TasksCount } from '../../../core/tasks-count';

export interface INoteEditor {
    content: string;
    noteTextChanged$: Observable<void>;
    initializeAsync(): Promise<void>;
    hasSelectedText(): boolean;
    strikeThrough(): void;
    applyHeading(headingSize: number): void;
    performCut(): void;
    performCopy(): void;
    performPaste(): void;
    performDelete(): void;
    getNoteText(): string;
    getNoteContent(): string;
    getNoteHtml(): string;
    getTasksCount(): TasksCount;
    setNoteContent(content: string): void;
    pasteImageFromClipboard(): void;
    focus(): void;
    applyZoomPercentageFromSettings(): void;
}
