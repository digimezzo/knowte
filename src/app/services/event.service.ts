import { Injectable } from "@angular/core";
import { remote } from 'electron';
import { NoteDetailsResult } from "./results/noteDetailsResult";

@Injectable({
    providedIn: 'root',
})
export class EventService {
    constructor() {

    }

    private setNoteOpenEvent: string = "e147265a-9de3-4440-8672-d91322fc5b03";
    private sendNoteDetailsEvent: string = "3a2a25c2-c67c-4eb8-9bd3-db3a68d81369";
    private toggleNoteMarkEvent: string = "16700e61-70ac-4b67-8b54-1376f7c1b875";

    private globalEvents = remote.getGlobal('globalEvents');

    // setNoteOpen
    public emitSetNoteOpen(noteId: string, isOpen: boolean) {
        this.globalEvents.emit(this.setNoteOpenEvent, noteId, isOpen);
    }

    public onSetNoteOpen(callback: any) {
        this.globalEvents.on(this.setNoteOpenEvent, (noteId, isOpen) => callback(noteId, isOpen));
    }

    // sendNoteDetails
    public emitSendNoteDetails(noteId: string, noteTitle: string, notebookName: string, noteIsMarked: boolean) {
        this.globalEvents.emit(`${this.sendNoteDetailsEvent}-${noteId}`, new NoteDetailsResult(noteTitle, notebookName, noteIsMarked));
    }

    public onSendNoteDetails(noteId: string, callback: any) {
        this.globalEvents.on(`${this.sendNoteDetailsEvent}-${noteId}`, (result) => callback(result));
    }
}