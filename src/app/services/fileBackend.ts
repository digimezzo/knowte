import { Backend } from './backend';

export class FileBackend implements Backend {
    constructor() {
    }

    hasCollections(): boolean {
        throw new Error("Method not implemented.");
    }
}
