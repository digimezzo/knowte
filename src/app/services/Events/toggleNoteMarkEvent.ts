import { remote } from 'electron';

export class ToggleNoteMarkEvent {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private eventId: string = "55b3df88-d32b-4ee7-9205-b21d1858102a";

    public send(noteId: string) {
        this.globalEmitter.emit(this.eventId, noteId);
    }

    public receive(callback: any) {
        this.globalEmitter.on(this.eventId, (noteId) => callback(noteId));
    }
}