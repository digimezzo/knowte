import { remote } from 'electron';

export class SetNoteOpenEvent {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private eventId: string = "7bf65931-d78e-4ea0-9c61-bd26e22ac49d";
    
    public send(noteId: string, isOpen: boolean) {
        this.globalEmitter.emit(this.eventId, noteId, isOpen);
    }

    public receive(callback: any) {
        this.globalEmitter.on(this.eventId, (noteId, isOpen) => callback(noteId, isOpen));
    }
}