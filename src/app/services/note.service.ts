import { Subject } from "rxjs";
import { NoteRenamedArgs } from "./noteRenamedArgs";
import { NoteOperation } from "./noteOperation";
import log from 'electron-log';
import { Collection } from "../data/collection";
import { Note } from "../data/note";
import { NoteMarkChangedArgs } from "./noteMarkChangedArgs";

/**
 * Angular services cannot be configured as singletons across Electron windows. So we use this class, which we 
 * set as a global main process variable, and then use it as a app-wide singleton to send events across windows.
 */
export class NoteService {
  constructor() {

  }

  private openNoteIds: string[] = [];

  private globalAny: any = global;
  private dataStore = this.globalAny.dataStore;

  private noteRenamed = new Subject<NoteRenamedArgs>();
  noteRenamed$ = this.noteRenamed.asObservable();

  private noteMarkChanged = new Subject<NoteMarkChangedArgs>();
  noteMarkChanged$ = this.noteMarkChanged.asObservable();

  public openNote(noteId: string): void {
    if (!this.openNoteIds.includes(noteId)) {
      this.openNoteIds.push(noteId);
    }
  }

  public closeNote(noteId: string): void {
    if (this.openNoteIds.includes(noteId)) {
      this.openNoteIds.splice(this.openNoteIds.indexOf(noteId), 1);
    }
  }

  public noteIsOpen(noteId: string): boolean {
    return this.openNoteIds.includes(noteId);
  }

  private noteExists(noteTitle: string): boolean {
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    let note: Note = this.dataStore.getNoteByTitle(activeCollection.id, noteTitle);

    return note != null;
  }

  public renameNote(noteId: string, newNoteTitle: string): NoteOperation {
    if (!noteId || !newNoteTitle) {
      log.error("renameNote: noteId or newNoteTitle is null");
      return NoteOperation.Error;
    }

    try {
      // 1. Check if there is already a note with that title
      if (this.noteExists(newNoteTitle)) {
        return NoteOperation.Duplicate;
      }

      // 2. Rename the note
      this.dataStore.setNoteTitle(noteId, newNoteTitle);
    } catch (error) {
      log.error(`Could not rename the note with id='${noteId}' to '${newNoteTitle}'. Cause: ${error}`);
      return NoteOperation.Error;
    }

    let args: NoteRenamedArgs = new NoteRenamedArgs(noteId, newNoteTitle);
    this.noteRenamed.next(args);

    return NoteOperation.Success;
  }

  public updateNote(note: Note): NoteOperation {
    try {
      this.dataStore.updateNote(note);
    } catch (error) {
      log.error(`Could not update the note with id='${note.id}' to '${note.title}'. Cause: ${error}`);
      return NoteOperation.Error;
    }

    return NoteOperation.Success;
  }

  public setNoteMark(noteId: string, isMarked: boolean): void {
    this.dataStore.setNoteMark(noteId, isMarked);
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    let markedNotes: Note[] = this.dataStore.getMarkedNotes(activeCollection.id);
    let arg: NoteMarkChangedArgs = new NoteMarkChangedArgs(noteId, isMarked, markedNotes.length);
    this.noteMarkChanged.next(arg);
  }
}