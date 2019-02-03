export class NoteMarkChangedArgument {
    constructor(public noteId: string, public isMarked: boolean, public markedNotesCount: number) {
    }
}