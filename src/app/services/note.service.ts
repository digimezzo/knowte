import { Subject } from "rxjs";
import log from 'electron-log';
import { Collection } from "../data/collection";
import { Note } from "../data/note";
import { NoteMarkChangedArgs } from "./noteMarkChangedArgs";
import { RenameNoteResult } from "./renameNoteResult";
import { CollectionOperation } from "./collectionOperation";

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

  private noteRenamed = new Subject<RenameNoteResult>();
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

  private getSimilarTitles(baseTitle: string): string[] {
    let notesWithIdenticalBaseTitle: Note[] = this.dataStore.getNotesWithIdenticalBaseTitle(baseTitle);
    return notesWithIdenticalBaseTitle.map(x => x.title);
  }

  private getUniqueNoteNoteTitle(baseTitle: string): string {
    let similarTitles: string[] = [];
    let counter: number = 0;
    let uniqueTitle: string = baseTitle;

    similarTitles = this.getSimilarTitles(baseTitle);

    while (similarTitles.includes(uniqueTitle)) {
      counter++;
      uniqueTitle = `${baseTitle} (${counter})`;
    }

    return uniqueTitle;
  }

  public renameNote(noteId: string, originalNoteTitle: string, newNoteTitle: string): RenameNoteResult {
    if (!noteId || !originalNoteTitle) {
      log.error("renameNote: noteId or originalNoteTitle is null");
      return new RenameNoteResult(CollectionOperation.Error);
    }

    let uniqueNoteTitle: string = newNoteTitle.trim();

    if(uniqueNoteTitle.length === 0){
      return new RenameNoteResult(CollectionOperation.Blank);
    }

    if(originalNoteTitle === uniqueNoteTitle){
      log.error("New title is the same as old title. No rename required.");
      return new RenameNoteResult(CollectionOperation.Aborted);
    }

    try {
      // 1. Make sure the new title is unique
      uniqueNoteTitle = this.getUniqueNoteNoteTitle(newNoteTitle);

      // 2. Rename the note
      this.dataStore.setNoteTitle(noteId, uniqueNoteTitle);
    } catch (error) {
      log.error(`Could not rename the note with id='${noteId}' to '${uniqueNoteTitle}'. Cause: ${error}`);
      return new RenameNoteResult(CollectionOperation.Error);
    }

    let renameNoteResult: RenameNoteResult = new RenameNoteResult(CollectionOperation.Success);
    renameNoteResult.noteId = noteId;
    renameNoteResult.newNoteTitle = uniqueNoteTitle;

    this.noteRenamed.next(renameNoteResult);

    return renameNoteResult;
  }

  // public updateNote(note: Note): CollectionOperation {
  //   try {
  //     this.dataStore.updateNote(note);
  //   } catch (error) {
  //     log.error(`Could not update the note with id='${note.id}' to '${note.title}'. Cause: ${error}`);
  //     return CollectionOperation.Error;
  //   }

  //   return CollectionOperation.Success;
  // }

  public setNoteMark(noteId: string, isMarked: boolean): void {
    this.dataStore.setNoteMark(noteId, isMarked);
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    let markedNotes: Note[] = this.dataStore.getMarkedNotes(activeCollection.id);
    let args: NoteMarkChangedArgs = new NoteMarkChangedArgs(noteId, isMarked, markedNotes.length);
    this.noteMarkChanged.next(args);
  }
}