import { Operation } from "../core/enums";

export class UpdateNoteResult {
    constructor(operation: Operation) {
        this.operation = operation;
    }

    public noteId: string;
    public noteTitle: string;
    public operation: Operation;
}