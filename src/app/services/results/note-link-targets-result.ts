import { Operation } from '../../common/enums/operation';

export interface NoteLinkTarget {
    id: string;
    title: string;
    notebookName: string;
}

export interface NoteLinkTargetsResult {
    operation: Operation;
    notes: NoteLinkTarget[];
}
