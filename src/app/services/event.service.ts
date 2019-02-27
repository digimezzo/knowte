import { Injectable } from "@angular/core";
import { SetNoteOpenEvent } from "./Events/setNoteOpenEvent";
import { SendNoteDetailsEvent } from "./Events/sendNoteDetailsEvent";
import { ToggleNoteMarkEvent } from "./Events/toggleNoteMarkEvent";
import { RequestNotebooksEvent } from "./Events/requestNotebooksEvent";
import { SendNotebooksEvent } from "./Events/sendNotebooksEvent";

@Injectable({
    providedIn: 'root',
})
export class EventService {
    constructor() {

    }

    public setNoteOpenEvent: SetNoteOpenEvent = new SetNoteOpenEvent();
    public sendNoteDetailsEvent: SendNoteDetailsEvent = new SendNoteDetailsEvent();
    public toggleNoteMarkEvent: ToggleNoteMarkEvent = new ToggleNoteMarkEvent();
    public requestNotebooksEvent: RequestNotebooksEvent = new RequestNotebooksEvent();
    public sendNotebooksEvent: SendNotebooksEvent = new SendNotebooksEvent();
}