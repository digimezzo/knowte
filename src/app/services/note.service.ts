import { Subject } from "rxjs";
import log from 'electron-log';
import { Collection } from "../data/collection";
import { Note } from "../data/note";
import { NoteMarkChangedArgs } from "./noteMarkChangedArgs";
import { RenameNoteResult } from "./renameNoteResult";
import { CollectionOperation } from "./collectionOperation";
import * as Store from 'electron-store';
import * as fs from 'fs-extra';
import { Constants } from "../core/constants";
import * as path from 'path';
import { GetNoteContentResult } from "./getNoteContentResult";

/**
 * Angular services cannot be configured as singletons across Electron windows. So we use this class, which we 
 * set as a global main process variable, and then use it as a app-wide singleton to send events across windows.
 */
export class NoteService {
  constructor() {

  }

  private settings: Store = new Store();
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
    // Update note in the data store
    let note: Note = this.dataStore.getNote(noteId);
    note.isMarked = isMarked;
    this.dataStore.updateNote(note);

    // Update counters
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    let markedNotes: Note[] = this.dataStore.getMarkedNotes(activeCollection.id);
    let args: NoteMarkChangedArgs = new NoteMarkChangedArgs(noteId, isMarked, markedNotes.length);
    this.noteMarkChanged.next(args);
  }

  public renameNote(noteId: string, originalNoteTitle: string, newNoteTitle: string): RenameNoteResult {
    if (!noteId || !originalNoteTitle) {
      log.error("renameNote: noteId or originalNoteTitle is null");
      return new RenameNoteResult(CollectionOperation.Error);
    }

    let uniqueNoteTitle: string = newNoteTitle.trim();

    if (uniqueNoteTitle.length === 0) {
      return new RenameNoteResult(CollectionOperation.Blank);
    }

    if (originalNoteTitle === uniqueNoteTitle) {
      log.error("New title is the same as old title. No rename required.");
      return new RenameNoteResult(CollectionOperation.Aborted);
    }

    try {
      // 1. Make sure the new title is unique
      uniqueNoteTitle = this.getUniqueNoteNoteTitle(newNoteTitle);

      // 2. Rename the note
      let note: Note = this.dataStore.getNote(noteId);
      note.title = uniqueNoteTitle;
      this.dataStore.updateNote(note);

      log.info(`Renamed note with id=${noteId} from ${originalNoteTitle} to ${uniqueNoteTitle}.`);
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

  public updateNoteContent(noteId: string, textContent: string, jsonContent: string): CollectionOperation {
    if (!noteId) {
      log.error("updateNoteContent: noteId is null");
      return CollectionOperation.Error;
    }

    try {
      // Update the note file on disk
      let storageDirectory: string = this.settings.get('storageDirectory');
      fs.writeFileSync(path.join(storageDirectory, `${noteId}${Constants.noteExtension}`), jsonContent);

      // Update the note in the data store
      let note: Note = this.dataStore.getNote(noteId);
      note.text = textContent;
      this.dataStore.updateNote(note);

      log.info(`Updated content for note with id=${noteId}.`);
    } catch (error) {
      log.error(`Could not update the content for the note with id='${noteId}'. Cause: ${error}`);
      return CollectionOperation.Error;
    }

    return CollectionOperation.Success;
  }

  public getNoteContent(noteId: string): GetNoteContentResult {
    if (!noteId) {
      log.error("getNoteContent: noteId is null");
      return new GetNoteContentResult(CollectionOperation.Error);
    }

    let noteContent: string = "";

    try {
      let storageDirectory: string = this.settings.get('storageDirectory');
      noteContent = fs.readFileSync(path.join(storageDirectory, `${noteId}${Constants.noteExtension}`), 'utf8');
    } catch (error) {
      log.error(`Could not get the content for the note with id='${noteId}'. Cause: ${error}`);
      return new GetNoteContentResult(CollectionOperation.Error);
    }

    let getNoteContentResult: GetNoteContentResult = new GetNoteContentResult(CollectionOperation.Success);
    getNoteContentResult.noteId = noteId;
    getNoteContentResult.noteContent = noteContent;

    return getNoteContentResult;
  }
}