import { Observable } from 'rxjs';
import { TasksCount } from '../../../core/tasks-count';

export interface INoteEditor {
    isEditing: boolean;
    text: string;
    content: string;
    readonly html: string;
    noteContentChanged$: Observable<void>;
    initializeAsync(): Promise<void>;
    hasSelectedText(): boolean;
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
    applyItalic(): void;
    applyStrikeThrough(): void;
    insertLink(): void;
    applyQuote(): void;
    applyCode(): void;
}
