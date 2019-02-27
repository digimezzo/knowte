import { remote } from 'electron';
import { Notebook } from '../../data/entities/notebook';

export class SendNotebooksEvent {
    private globalEmitter: any = remote.getGlobal('globalEmitter');

    public send(requestId: string, notebooks: Notebook[]) {
        this.globalEmitter.emit(requestId, notebooks);

    }

    public receive(requestId, callback: any) {
        this.globalEmitter.on(requestId, (notebooks) => callback(notebooks));
    }
}