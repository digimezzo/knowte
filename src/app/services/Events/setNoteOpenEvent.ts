import { GlobalEvent } from './globalEvent';

export class SetNoteOpenEvent extends GlobalEvent {
    public send(noteId: string, isOpen: boolean) {
        this.globalEmitter.emit(this.eventId, noteId, isOpen);
    }

    public receive(callback: any) {
        this.globalEmitter.on(this.eventId, (noteId, isOpen) => callback(noteId, isOpen));
    }
}