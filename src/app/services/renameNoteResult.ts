import { Operation } from "../core/enums";

export class RenameNoteResult {
    constructor(operation: Operation) {
        this.operation = operation;
    }

    public noteId: string;
    public newNoteTitle: string;
    public operation: Operation;
}