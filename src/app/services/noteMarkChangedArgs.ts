export class NoteMarkChangedArgs {
    constructor(public noteId: string, public isMarked: boolean, public markedNotesCount: number) {
    }
}