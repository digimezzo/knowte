import { remote } from 'electron';

export class SetNoteOpenEvent {
    private globalEvents: any = remote.getGlobal('globalEvents');

    private eventCode: string = "e147265a-9de3-4440-8672-d91322fc5b03";

    public send(noteId: string, isOpen: boolean) {
        this.globalEvents.emit(this.eventCode, noteId, isOpen);
    }

    public receive(callback: any) {
        this.globalEvents.on(this.eventCode, (noteId, isOpen) => callback(noteId, isOpen));
    }
}