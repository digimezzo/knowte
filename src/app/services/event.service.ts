import { Injectable } from "@angular/core";
import { SetNoteOpenEvent } from "./Events/setNoteOpenEvent";
import { SendNoteDetailsEvent } from "./Events/sendNoteDetailsEvent";
import { ToggleNoteMarkEvent } from "./Events/toggleNoteMarkEvent";

@Injectable({
    providedIn: 'root',
})
export class EventService {
    constructor() {

    }

    public setNoteOpenEvent: SetNoteOpenEvent = new SetNoteOpenEvent();
    public sendNoteDetailsEvent: SendNoteDetailsEvent = new SendNoteDetailsEvent();
    public toggleNoteMarkEvent: ToggleNoteMarkEvent = new ToggleNoteMarkEvent();
}