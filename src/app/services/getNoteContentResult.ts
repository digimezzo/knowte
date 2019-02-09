import { CollectionOperation } from "./collectionOperation";

export class GetNoteContentResult {
    constructor(public operation: CollectionOperation) {
    }

    public noteId: string;
    public noteContent: string;
}