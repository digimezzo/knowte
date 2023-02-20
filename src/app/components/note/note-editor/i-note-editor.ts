import { Observable } from 'rxjs';
import { TasksCount } from '../../../core/tasks-count';

export interface INoteEditor {
    text: string;
    content: string;
    readonly html: string;
    noteContentChanged$: Observable<void>;
    initializeAsync(): Promise<void>;
    hasSelectedText(): boolean;
    strikeThrough(): void;
    applyHeading(headingSize: number): void;
    performCut(): void;
    performCopy(): void;
    performPaste(): void;
    performDelete(): void;
    getTasksCount(): TasksCount;
    pasteImageFromClipboard(): void;
    focus(): void;
    applyZoomPercentageFromSettings(): void;
    applyBold(): void;
}
