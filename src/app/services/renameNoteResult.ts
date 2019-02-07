import { CollectionOperation } from "./collectionOperation";

export class RenameNoteResult {
    constructor(operation: CollectionOperation) {
        this.operation = operation;
    }

    public noteId: string;
    public newNoteTitle: string;
    public operation: CollectionOperation;
}