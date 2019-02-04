import { Subject } from "rxjs";
import { NoteRenamedArgs } from "./noteRenamedArgs";

/**
 * Angular services cannot be configured as singletons across Electron windows. So we use this class, which we 
 * set as a global main process variable, and then use it as a app-wide singleton to send events across windows.
 */
export class NoteService {
    constructor() {

    }

    private openNoteIds: string[] = [];

    private noteRenamed = new Subject<NoteRenamedArgs>();
    noteRenamed$ = this.noteRenamed.asObservable();

    public openNote(noteId: string): void {
        if (!this.openNoteIds.includes(noteId)) {
            this.openNoteIds.push(noteId);
        }
    }

    public closeNote(noteId: string): void {
        if (this.openNoteIds.includes(noteId)) {
            this.openNoteIds.splice(this.openNoteIds.indexOf(noteId), 1);
        }
    }

    public noteIsOpen(noteId: string): boolean {
        return this.openNoteIds.includes(noteId);
    }
}