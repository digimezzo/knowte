import { remote } from 'electron';

export class RequestNotebooksEvent {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private eventId: string = "c8f52d96-ab25-4418-8071-fd6901ef488e";

    public send(requestId: string) {
        this.globalEmitter.emit(this.eventId, requestId);
        
    }

    public receive(callback: any) {
        this.globalEmitter.on(this.eventId, (requestId) => callback(requestId));
    }
}