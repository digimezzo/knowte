import { Injectable } from '@angular/core';
import { Constants } from '../core/constants';
import * as path from 'path';
import * as fs from 'fs-extra';
import log from 'electron-log';
import * as Store from 'electron-store';
import { Subject } from 'rxjs';
import { Collection } from '../data/entities/collection';
import { Utils } from '../core/utils';
import { Notebook } from '../data/entities/notebook';
import { TranslateService } from '@ngx-translate/core';
import { remote } from 'electron';
import { Note } from '../data/entities/note';
import * as moment from 'moment'
import { Moment, Duration } from 'moment';
import { NoteDateFormatResult } from './results/noteDateFormatResult';
import { Operation } from '../core/enums';
import { NoteOperationResult } from './results/noteOperationResult';
import { NotesCountResult } from './results/notesCountResult';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private translateService: TranslateService, private searchService: SearchService) {
  }

  private dataStore = remote.getGlobal('dataStore');
  private settings: Store = new Store();

  private dataStoreInitialized = new Subject<boolean>();
  dataStoreInitialized$ = this.dataStoreInitialized.asObservable();

  private collectionActivated = new Subject<string>();
  collectionActivated$ = this.collectionActivated.asObservable();

  private collectionAdded = new Subject<string>();
  collectionAdded$ = this.collectionAdded.asObservable();

  private collectionRenamed = new Subject<string>();
  collectionRenamed$ = this.collectionRenamed.asObservable();

  private collectionDeleted = new Subject<string>();
  collectionDeleted$ = this.collectionDeleted.asObservable();

  private notebookAdded = new Subject();
  notebookAdded$ = this.notebookAdded.asObservable();

  private notebookRenamed = new Subject();
  notebookRenamed$ = this.notebookRenamed.asObservable();

  private notebookDeleted = new Subject();
  notebookDeleted$ = this.notebookDeleted.asObservable();

  private noteAdded = new Subject();
  noteAdded$ = this.noteAdded.asObservable();

  private noteDeleted = new Subject();
  noteDeleted$ = this.noteDeleted.asObservable();

  private notesCountChanged = new Subject<NotesCountResult>();
  notesCountChanged$ = this.notesCountChanged.asObservable();

  public get hasDataStore(): boolean {
    return this.dataStore.isReady;
  }

  public get hasStorageDirectory(): boolean {
    // 1. Get the storage directory from the settings
    let storageDirectory: string = this.settings.get('storageDirectory');

    if (!storageDirectory) {
      // Storage directory is empty
      log.info("Storage directory setting is empty");
      return false;
    }

    // 2. If a storage directory was found in the data store, check if it exists on disk.
    if (!fs.existsSync(storageDirectory)) {
      // Storage directory is not found on disk
      log.info(`Storage directory '${storageDirectory}' is not found on disk`);
      return false;
    }

    // Storage directory is OK.
    log.info(`Storage directory '${storageDirectory}' is OK`);
    return true;
  }

  public setNoteIsOpen(noteId: string, noteIsOpen: boolean): void {
    let note: Note = this.dataStore.getNoteById(noteId);
    note.isOpen = noteIsOpen;
    this.dataStore.updateNote(note);
  }

  public getNoteIsOpen(noteId: string): boolean {
    let openNotes: Note[] = this.dataStore.getOpenNotes();

    if (openNotes.map(x => x.id).includes(noteId)) {
      return true;
    }

    return false;
  }

  public hasOpenNotes(): boolean {
    let openNotes: Note[] = this.dataStore.getOpenNotes();

    if (openNotes && openNotes.length > 0) {
      return true;
    }

    return false;
  }

  public closeAllNotes(): void {
    this.dataStore.closeAllNotes();
  }

  private noteExists(noteTitle: string): boolean {
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    let note: Note = this.dataStore.getNoteByTitle(activeCollection.id, noteTitle);

    return note != null;
  }

  public updateNoteContent(noteId: string, textContent: string, jsonContent: string): Operation {
    if (!noteId) {
      log.error("updateNoteContent: noteId is null");
      return Operation.Error;
    }

    try {
      // Update the note file on disk
      let storageDirectory: string = this.settings.get('storageDirectory');
      fs.writeFileSync(path.join(storageDirectory, `${noteId}${Constants.noteExtension}`), jsonContent);

      // Update the note in the data store
      let note: Note = this.dataStore.getNoteById(noteId);
      note.text = textContent;
      this.dataStore.updateNote(note);

      log.info(`Updated content for note with id=${noteId}.`);
    } catch (error) {
      log.error(`Could not update the content for the note with id='${noteId}'. Cause: ${error}`);
      return Operation.Error;
    }

    return Operation.Success;
  }

  public getNoteContent(noteId: string): NoteOperationResult {
    if (!noteId) {
      log.error("getNoteContent: noteId is null");
      return new NoteOperationResult(Operation.Error);
    }

    let noteContent: string = "";

    try {
      let storageDirectory: string = this.settings.get('storageDirectory');
      noteContent = fs.readFileSync(path.join(storageDirectory, `${noteId}${Constants.noteExtension}`), 'utf8');
    } catch (error) {
      log.error(`Could not get the content for the note with id='${noteId}'. Cause: ${error}`);
      return new NoteOperationResult(Operation.Error);
    }

    let result: NoteOperationResult = new NoteOperationResult(Operation.Success);
    result.noteId = noteId;
    result.noteContent = noteContent;

    return result;
  }

  public async initializeStorageDirectoryAsync(parentDirectory: string): Promise<boolean> {
    try {
      // Generate storage directory path based on parent directory
      let storageDirectory: string = path.join(parentDirectory, Constants.collectionsDirectory);

      // Create storage directory if it doesn't exist
      if (!await fs.exists(storageDirectory)) {
        await fs.mkdir(storageDirectory);
        log.info(`Created storageDirectory '${storageDirectory}' on disk`);
      } else {
        log.info(`StorageDirectory '${storageDirectory}' already exists on disk. No need to create it.`);
      }

      // Save storage directory in the settings store
      this.settings.set('storageDirectory', storageDirectory);
      log.info(`Saved storage directory '${storageDirectory}' in settings store`);
    } catch (error) {
      log.error(`Could not create storage directory on disk. Cause: ${error}`);

      return false;
    }

    return true;
  }

  public async initializeDataStoreAsync(): Promise<void> {
    // First we get the storage directory from the settings.
    let storageDirectory: string = this.settings.get('storageDirectory');

    // We can only initialize the data store if a storage directory was
    // found in the settings, AND the storage directory exists on disk.
    if (!storageDirectory || !fs.existsSync(storageDirectory)) {
      return;
    }

    // We found all we need: we can now initialize the data store.
    if (!this.dataStore.isReady) {
      this.dataStore.initialize(storageDirectory);

      while (!this.dataStore.isReady) {
        await Utils.sleep(100);
      }
    }

    //await Utils.sleep(2000);
    this.dataStoreInitialized.next();
  }

  private collectionExists(collectionName: string): boolean {
    let collection: Collection = this.dataStore.getCollectionByName(collectionName);

    return collection != null;
  }

  public addCollection(collectionName: string): Operation {
    // Check if a collection name was provided
    if (!collectionName) {
      log.error("collectionName is null");
      return Operation.Error;
    }

    // Check if there is already a collection with that name
    if (this.collectionExists(collectionName)) {
      log.info(`Not adding collection '${collectionName}' to the data store because it already exists`);
      return Operation.Duplicate;
    }

    try {
      // Add the collection to the data store
      this.dataStore.addCollection(collectionName, false);
      log.info(`Added collection '${collectionName}' to the data store`);
    } catch (error) {
      log.error(`Could not add collection '${collectionName}'. Cause: ${error}`);

      return Operation.Error;
    }

    this.collectionAdded.next(collectionName);

    return Operation.Success;
  }

  public async renameCollectionAsync(collectionId: string, newCollectionName: string): Promise<Operation> {
    if (!collectionId || !newCollectionName) {
      log.error("renameCollectionAsync: collectionId or newCollectionName is null");
      return Operation.Error;
    }

    try {
      // 1. Check if there is already a collection with that name
      if (this.collectionExists(newCollectionName)) {
        return Operation.Duplicate;
      }

      // 2. Rename the collection
      let collection: Collection = this.dataStore.getCollectionById(collectionId);
      collection.name = newCollectionName;
      this.dataStore.updateCollection(collection);
    } catch (error) {
      log.error(`Could not rename the collection with id='${collectionId}' to '${newCollectionName}'. Cause: ${error}`);
      return Operation.Error;
    }

    this.collectionRenamed.next(newCollectionName);

    return Operation.Success;
  }

  public getCollections(): Collection[] {
    let collections: Collection[];

    try {
      collections = this.dataStore.getCollections();
    } catch (error) {
      log.error(`Could not get collections. Cause: ${error}`);
      // This is a fatal error. Throw the error so the global error handler catches it.
      throw error;
    }

    return collections;
  }

  public getCollectionName(collectionId: string): string {
    return this.dataStore.getCollectionById(collectionId).name;
  }

  public activateCollection(collectionId: string): void {
    this.dataStore.activateCollection(collectionId);
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    this.collectionActivated.next(activeCollection.name);
  }

  public async deleteCollectionAsync(collectionId: string): Promise<Operation> {
    if (!collectionId) {
      log.error("deleteCollectionAsync: collectionId is null");
      return Operation.Error;
    }

    let collectionName: string = "";

    try {
      // 1. Get the name of the collection
      collectionName = this.getCollectionName(collectionId);

      // 2. Delete collection from data store (including its notebooks and notes)
      this.dataStore.deleteCollection(collectionId);

      // 2. Delete the note files from disk
      // TODO
    } catch (error) {
      log.error(`Could not delete the collection with id='${collectionId}'. Cause: ${error}`);
      return Operation.Error;
    }

    this.collectionDeleted.next(collectionName);
    return Operation.Success;
  }

  public async getNotebooksAsync(includeAllNotes: boolean): Promise<Notebook[]> {
    let notebooks: Notebook[] = [];

    try {
      // 1. Get the active collection. If none is found, return an empty array.
      let activeCollection: Collection = this.dataStore.getActiveCollection();

      if (!activeCollection) {
        return notebooks;
      }

      // 2. Get the id of the active collection
      let activeCollectionId: string = activeCollection.id;

      // 3. Add the default notebooks
      if (includeAllNotes) {
        let allNotesNotebook: Notebook = new Notebook(await this.translateService.get('MainPage.AllNotes').toPromise(), activeCollectionId);
        allNotesNotebook.id = Constants.allNotesNotebookId;
        allNotesNotebook.isDefault = true;
        notebooks.push(allNotesNotebook);
      }

      let unfiledNotesNotebook: Notebook = new Notebook(await this.translateService.get('MainPage.UnfiledNotes').toPromise(), activeCollectionId);
      unfiledNotesNotebook.id = Constants.unfiledNotesNotebookId;
      unfiledNotesNotebook.isDefault = true;
      notebooks.push(unfiledNotesNotebook);

      // 4. Get the user defined notebooks
      let userNotebooks: Notebook[] = this.dataStore.getNotebooks(activeCollectionId);

      // 5. Add the user defined notebooks to the notebooks
      notebooks.push.apply(notebooks, userNotebooks);
    } catch (error) {
      log.error(`Could not get notebooks. Cause: ${error}`);
    }

    return notebooks;
  }

  private notebookExists(notebookName: string): boolean {
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    let notebook: Notebook = this.dataStore.getNotebookByName(activeCollection.id, notebookName);

    return notebook != null;
  }

  public addNotebook(notebookName: string): Operation {
    // Check if a notebook name was provided
    if (!notebookName) {
      log.error("notebookName is null");
      return Operation.Error;
    }

    // Check if there is already a notebook with that name
    if (this.notebookExists(notebookName)) {
      log.info(`Not adding notebook '${notebookName}' to the data store because it already exists`);
      return Operation.Duplicate;
    }

    try {
      // Add the notebook to the data store
      let activeCollection: Collection = this.dataStore.getActiveCollection();
      this.dataStore.addNotebook(activeCollection.id, notebookName);
      log.info(`Added notebook '${notebookName}' to the data store`);
    } catch (error) {
      log.error(`Could not add notebook '${notebookName}'. Cause: ${error}`);

      return Operation.Error;
    }

    this.notebookAdded.next();

    return Operation.Success;
  }

  public async renameNotebookAsync(notebookId: string, newNotebookName: string): Promise<Operation> {
    if (!notebookId || !newNotebookName) {
      log.error("renameNotebookAsync: notebookId or newNotebookName is null");
      return Operation.Error;
    }

    try {
      // 1. Check if there is already a notebook with that name
      if (this.notebookExists(newNotebookName)) {
        return Operation.Duplicate;
      }

      // 2. Rename the notebook
      let notebook: Notebook = this.dataStore.getNotebookById(notebookId);
      notebook.name = newNotebookName;
      this.dataStore.updateNotebook(notebook);
    } catch (error) {
      log.error(`Could not rename the notebook with id='${notebookId}' to '${newNotebookName}'. Cause: ${error}`);
      return Operation.Error;
    }

    this.notebookRenamed.next();

    return Operation.Success;
  }

  public getNotebookName(notebookId: string): string {
    return this.dataStore.getNotebookById(notebookId).name;
  }

  public async deleteNotebookAsync(notebookId: string): Promise<Operation> {
    if (!notebookId) {
      log.error("deleteNotebookAsync: notebookId is null");
      return Operation.Error;
    }

    try {
      this.dataStore.deleteNotebook(notebookId);
    } catch (error) {
      log.error(`Could not delete the notebook with id='${notebookId}'. Cause: ${error}`);
      return Operation.Error;
    }

    this.notebookDeleted.next();
    return Operation.Success;
  }

  public async deleteNoteAsync(noteId: string): Promise<Operation> {
    if (!noteId) {
      log.error("deleteNoteAsync: noteId is null");
      return Operation.Error;
    }

    let noteTitle: string = "";

    try {
      let noteToDelete: Note = this.dataStore.getNoteById(noteId);

      // 1. Delete all files from disk, which are related to the note.
      let storageDirectory: string = this.settings.get('storageDirectory');
      fs.unlinkSync(path.join(storageDirectory, `${noteId}${Constants.noteExtension}`), '');

      // 2. Delete note from data store
      this.dataStore.deleteNote(noteId);
    } catch (error) {
      log.error(`Could not delete the note with id='${noteId}'. Cause: ${error}`);
      return Operation.Error;
    }

    this.noteDeleted.next();
    return Operation.Success;
  }

  private async getNoteDateFormatAsync(millisecondsSinceEpoch: number, useFuzzyDates: boolean): Promise<NoteDateFormatResult> {
    let result: NoteDateFormatResult = new NoteDateFormatResult();
    let nowDateonly: Moment = moment().startOf('day');
    let modificationDateOnly: Moment = moment(millisecondsSinceEpoch).startOf('day');
    let duration: Duration = moment.duration(nowDateonly.diff(modificationDateOnly));

    if (duration.asMonths() >= 12) {
      result.dateText = await this.translateService.get('NoteDates.LongAgo').toPromise();
    } else if (duration.asMonths() >= 11) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 11 }).toPromise();
    } else if (duration.asMonths() >= 10) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 10 }).toPromise();
    } else if (duration.asMonths() >= 9) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 9 }).toPromise();
    } else if (duration.asMonths() >= 8) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 8 }).toPromise();
    } else if (duration.asMonths() >= 7) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 7 }).toPromise();
    } else if (duration.asMonths() >= 6) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 6 }).toPromise();
    } else if (duration.asMonths() >= 5) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 5 }).toPromise();
    } else if (duration.asMonths() >= 4) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 4 }).toPromise();
    } else if (duration.asMonths() >= 3) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 3 }).toPromise();
    } else if (duration.asMonths() >= 2) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 2 }).toPromise();
    } else if (duration.asMonths() >= 1) {
      result.dateText = await this.translateService.get('NoteDates.MonthsAgo', { count: 1 }).toPromise();
    } else if (duration.asDays() >= 21) {
      result.dateText = await this.translateService.get('NoteDates.WeeksAgo', { count: 3 }).toPromise();
    } else if (duration.asDays() >= 14) {
      result.dateText = await this.translateService.get('NoteDates.WeeksAgo', { count: 2 }).toPromise();
    } else if (duration.asDays() >= 8) {
      result.dateText = await this.translateService.get('NoteDates.LastWeek').toPromise();
    } else if (duration.asDays() >= 7) {
      result.dateText = await this.translateService.get('NoteDates.DaysAgo', { count: 7 }).toPromise();
      result.isThisWeekNote = true;
    } else if (duration.asDays() >= 6) {
      result.dateText = await this.translateService.get('NoteDates.DaysAgo', { count: 6 }).toPromise();
      result.isThisWeekNote = true;
    } else if (duration.asDays() >= 5) {
      result.dateText = await this.translateService.get('NoteDates.DaysAgo', { count: 5 }).toPromise();
      result.isThisWeekNote = true;
    } else if (duration.asDays() >= 4) {
      result.dateText = await this.translateService.get('NoteDates.DaysAgo', { count: 4 }).toPromise();
      result.isThisWeekNote = true;
    } else if (duration.asDays() >= 3) {
      result.dateText = await this.translateService.get('NoteDates.DaysAgo', { count: 3 }).toPromise();
      result.isThisWeekNote = true;
    } else if (duration.asDays() >= 2) {
      result.dateText = await this.translateService.get('NoteDates.DaysAgo', { count: 2 }).toPromise();
      result.isThisWeekNote = true;
    } else if (duration.asDays() >= 1) {
      result.dateText = await this.translateService.get('NoteDates.Yesterday').toPromise();
      result.isYesterdayNote = true;
      result.isThisWeekNote = true;
    } else if (duration.asDays() >= 0) {
      result.dateText = await this.translateService.get('NoteDates.Today').toPromise();
      result.isTodayNote = true;
      result.isThisWeekNote = true;
    }

    if (!useFuzzyDates) {
      let m: Moment = moment(millisecondsSinceEpoch);
      let dateText: string = m.format("MMMM D, YYYY HH:mm");
      result.dateText = dateText;
    }

    return result;
  }

  private containsAny(text: string, items: string[]) {
    for (let i: number = 0; i < items.length; i++) {
      let item: string = items[i].toLowerCase();

      if (text.toLowerCase().indexOf(item) > -1) {
        return true;
      }
    }

    return false;
  }

  private containsAll(text: string, items: string[]) {
    for (let i: number = 0; i < items.length; i++) {
      let item: string = items[i].toLowerCase();

      if (text.toLowerCase().indexOf(item) < 0) {
        return false;
      }
    }

    return true;
  }

  private getFilteredNotes(unfilteredNotes: Note[], filter: string): Note[] {
    // When there is no filter, return the original collection.
    if (!filter || filter.trim().length === 0) {
      return unfilteredNotes;
    }

    let pieces: string[] = filter.trim().split(" ");

    return unfilteredNotes.filter((x) => this.containsAll(`${x.title} ${x.text}`, pieces));
  }

  public async getNotesAsync(notebookId: string, category: string, useFuzzyDates: boolean): Promise<Note[]> {
    let notesCountResult: NotesCountResult = new NotesCountResult();

    let notes: Note[] = [];

    try {
      // Get the notes from the data store
      let uncategorizedNotes: Note[] = [];
      let activeCollection: Collection = this.dataStore.getActiveCollection();

      if (notebookId === Constants.allNotesNotebookId) {
        uncategorizedNotes = this.dataStore.getNotes(activeCollection.id);
      } else if (notebookId === Constants.unfiledNotesNotebookId) {
        uncategorizedNotes = this.dataStore.getUnfiledNotes(activeCollection.id);
      } else {
        uncategorizedNotes = this.dataStore.getNotebookNotes(notebookId);
      }

      // TODO: filter uncategorizedNotes by search text
      uncategorizedNotes = this.getFilteredNotes(uncategorizedNotes, this.searchService.searchText);

      // Fill in count
      notesCountResult.allNotesCount = uncategorizedNotes.length;

      let markedNotes: Note[] = uncategorizedNotes.filter(x => x.isMarked);
      notesCountResult.markedNotesCount = markedNotes.length;

      if (category === Constants.markedCategory) {
        notes = markedNotes;
      }

      // Fill in the display date & notes array
      for (let note of uncategorizedNotes) {
        if (category === Constants.allCategory) {
          notes.push(note);
        }

        let result: NoteDateFormatResult = await this.getNoteDateFormatAsync(note.modificationDate, useFuzzyDates);

        // More counts
        if (result.isTodayNote) {
          if (category === Constants.todayCategory) {
            notes.push(note);
          }

          notesCountResult.todayNotesCount++;
        }

        if (result.isYesterdayNote) {
          if (category === Constants.yesterdayCategory) {
            notes.push(note);
          }

          notesCountResult.yesterdayNotesCount++;
        }

        if (result.isThisWeekNote) {
          if (category === Constants.thisWeekCategory) {
            notes.push(note);
          }

          notesCountResult.thisWeekNotesCount++;
        }

        // Date text
        note.displayModificationDate = result.dateText;
      }

      this.notesCountChanged.next(notesCountResult);
    } catch (error) {
      log.error(`Could not get notes. Cause: ${error}`);
    }

    return notes;
  }

  private getUniqueNewNoteNoteTitle(baseTitle: string): string {
    let counter: number = 1;
    let uniqueTitle: string = `${baseTitle} ${counter}`;

    let notesWithIdenticalBaseTitle: Note[] = this.dataStore.getNotesWithIdenticalBaseTitle(baseTitle);
    let similarTitles: string[] = notesWithIdenticalBaseTitle.map(x => x.title);

    while (similarTitles.includes(uniqueTitle)) {
      counter++;
      uniqueTitle = `${baseTitle} ${counter}`;
    }

    return uniqueTitle;
  }

  public addNote(baseTitle: string, notebookId: string): NoteOperationResult {
    let uniqueTitle: string = "";
    let result: NoteOperationResult = new NoteOperationResult(Operation.Success);

    // If a default notebook was selected, make sure the note is added as unfiled.
    if (notebookId === Constants.allNotesNotebookId || notebookId === Constants.unfiledNotesNotebookId) {
      notebookId = "";
    }

    try {
      // 1. Add note to data store
      uniqueTitle = this.getUniqueNewNoteNoteTitle(baseTitle);
      let activeCollection: Collection = this.dataStore.getActiveCollection();
      result.noteId = this.dataStore.addNote(uniqueTitle, notebookId, activeCollection.id);

      // 2. Create note file
      let storageDirectory: string = this.settings.get('storageDirectory');
      fs.writeFileSync(path.join(storageDirectory, `${result.noteId}${Constants.noteExtension}`), '');

      this.noteAdded.next();
    } catch (error) {
      log.error(`Could not add note '${uniqueTitle}'. Cause: ${error}`);
      result.operation = Operation.Error;
    }

    return result;
  }

  public getNote(noteId: string): Note {
    return this.dataStore.getNoteById(noteId);
  }

  public async getNotebookAsync(noteId: string): Promise<Notebook> {
    let note: Note = this.dataStore.getNoteById(noteId);
    let notebook: Notebook = this.dataStore.getNotebookById(note.notebookId);

    if (!note.notebookId || !notebook) {
      let activeCollection: Collection = this.dataStore.getActiveCollection();
      notebook = new Notebook(await this.translateService.get('MainPage.UnfiledNotes').toPromise(), activeCollection.id);
    }

    return notebook;
  }
}