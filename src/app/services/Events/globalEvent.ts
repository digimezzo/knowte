import { remote } from 'electron';
import * as generate from 'nanoid/async/generate'

export class GlobalEvent {
    protected globalEmitter: any = remote.getGlobal('globalEmitter');
    protected eventId: string = generate('1234567890abcdefghijklmnopqrstuvwxyz', 10);
}