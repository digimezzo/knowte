import { CollectionOperation } from "./collectionOperation";

export class AddNoteResult {
    constructor(public operation: CollectionOperation) {
    }

    public noteId: string;
    public noteTitle: string;
}