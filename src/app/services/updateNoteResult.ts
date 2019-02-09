import { CollectionOperation } from "./collectionOperation";

export class UpdateNoteResult {
    constructor(operation: CollectionOperation) {
        this.operation = operation;
    }

    public noteId: string;
    public noteTitle: string;
    public operation: CollectionOperation;
}