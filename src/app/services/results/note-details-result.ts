export class NoteDetailsResult {
    constructor(
        public noteTitle: string,
        public notebookName: string,
        public isMarked: boolean,
        public isEncrypted: boolean,
        public secretKeyHash: string
    ) {}
}
