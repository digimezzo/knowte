import { remote } from 'electron';
import * as generate from 'nanoid/async/generate'

export class GlobalEvent {
    protected globalEvents: any = remote.getGlobal('globalEvents');
    protected eventId: string = generate('1234567890abcdefghijklmnopqrstuvwxyz', 10);
}