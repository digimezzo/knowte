import { remote } from 'electron';
import { NoteDetailsResult } from '../results/noteDetailsResult';

export class SendNoteDetailsEvent {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private eventId: string = "e829f70c-506d-4b50-b7cd-6752483e37fa";

    public send(noteId: string, noteTitle: string, notebookName: string, noteIsMarked: boolean) {
        this.globalEmitter.emit(`${this.eventId}-${noteId}`, new NoteDetailsResult(noteTitle, notebookName, noteIsMarked));
        
    }

    public receive(noteId: string, callback: any) {
        this.globalEmitter.on(`${this.eventId}-${noteId}`, (noteDetailsResult) => callback(noteDetailsResult));
    }
}