import { NoteOperation } from "./noteOperation";

export class AddNoteResult {
    constructor() {
        this.operation = NoteOperation.Success;
    }

    public noteId: string;
    public noteTitle: string;
    public operation: NoteOperation;
}