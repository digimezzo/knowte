import { Operation } from "../core/enums";

export class AddNoteResult {
    constructor(public operation: Operation) {
    }

    public noteId: string;
    public noteTitle: string;
}