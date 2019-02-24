import { Injectable } from "@angular/core";
import { remote } from 'electron';

@Injectable({
    providedIn: 'root',
})
export class EventService {
    constructor() {

    }

    private globalEvents = remote.getGlobal('globalEvents');
}