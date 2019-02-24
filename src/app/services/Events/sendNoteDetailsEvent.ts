import { remote } from 'electron';
import { NoteDetailsResult } from '../results/noteDetailsResult';

export class SendNoteDetailsEvent {
    private globalEvents: any = remote.getGlobal('globalEvents');

    private eventCode: string = "3a2a25c2-c67c-4eb8-9bd3-db3a68d81369";

    public send(noteId: string, noteTitle: string, notebookName: string, noteIsMarked: boolean) {
        this.globalEvents.emit(`${this.eventCode}-${noteId}`, new NoteDetailsResult(noteTitle, notebookName, noteIsMarked));
    }

    public receive(noteId: string, callback: any) {
        this.globalEvents.on(`${this.eventCode}-${noteId}`, (noteDetailsResult) => callback(noteDetailsResult));
    }
}