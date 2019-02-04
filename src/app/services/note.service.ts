import { Subject } from "rxjs";
import { NoteRenamedArgs } from "./noteRenamedArgs";

/**
 * Angular services cannot be configured as singletons across Electron windows. So we use this class, which we 
 * set as a global main process variable, and then use it as a app-wide singleton to send events across windows.
 */
export class NoteService {
    constructor() {

    }

    private noteRenamed = new Subject<NoteRenamedArgs>();
    noteRenamed$ = this.noteRenamed.asObservable();
}