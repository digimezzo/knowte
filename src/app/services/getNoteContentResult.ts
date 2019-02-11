import { Operation } from "../core/enums";

export class GetNoteContentResult {
    constructor(public operation: Operation) {
    }

    public noteId: string;
    public noteContent: string;
}