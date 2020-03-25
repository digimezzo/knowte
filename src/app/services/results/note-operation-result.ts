import { Operation } from '../../core/enums';

export class NoteOperationResult {
    constructor(public operation: Operation) {
        this.operation = operation;
    }

    public noteId: string;
    public noteTitle: string;
    public noteContent: string;
}
