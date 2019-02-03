import { Injectable } from '@angular/core';
import { Constants } from '../core/constants';
import * as path from 'path';
import * as fs from 'fs-extra';
import log from 'electron-log';
import * as Store from 'electron-store';
import { Subject } from 'rxjs';
import { CollectionOperation } from './collectionOperation';
import { Collection } from '../data/collection';
import { Utils } from '../core/utils';
import { Notebook } from '../data/notebook';
import { TranslateService } from '@ngx-translate/core';
import { NotebookOperation } from './notebookOperation';
import { remote } from 'electron';
import { Note } from '../data/note';
import { NoteOperation } from './noteOperation';
import { AddNoteResult } from './addNoteResult';
import * as moment from 'moment'
import { Moment, Duration } from 'moment';
import { NoteDateFormatResult } from './noteDateFormatResult';
import { NoteCountersArgument } from './noteCountersArgument';
import { NoteMarkChangedArgument } from './noteMarkChangedArgument';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private translateService: TranslateService) {
    log.info("CollectionService");
  }

  private dataStore = remote.getGlobal('dataStore');
  private settings: Store = new Store();

  private dataStoreInitialized = new Subject<boolean>();
  dataStoreInitialized$ = this.dataStoreInitialized.asObservable();

  private collectionsChanged = new Subject();
  collectionsChanged$ = this.collectionsChanged.asObservable();

  private collectionActivated = new Subject<string>();
  collectionActivated$ = this.collectionActivated.asObservable();

  private collectionAdded = new Subject<string>();
  collectionAdded$ = this.collectionAdded.asObservable();

  private collectionRenamed = new Subject<string>();
  collectionRenamed$ = this.collectionRenamed.asObservable();

  private collectionDeleted = new Subject<string>();
  collectionDeleted$ = this.collectionDeleted.asObservable();

  private notebookAdded = new Subject<string>();
  notebookAdded$ = this.notebookAdded.asObservable();

  private notebookRenamed = new Subject<string>();
  notebookRenamed$ = this.notebookRenamed.asObservable();

  private notebookDeleted = new Subject<string>();
  notebookDeleted$ = this.notebookDeleted.asObservable();

  private noteAdded = new Subject<string>();
  noteAdded$ = this.noteAdded.asObservable();

  private noteDeleted = new Subject<string>();
  noteDeleted$ = this.noteDeleted.asObservable();

  private noteMarkChanged = new Subject<NoteMarkChangedArgument>();
  noteMarkChanged$ = this.noteMarkChanged.asObservable();

  private noteCountersChanged = new Subject<NoteCountersArgument>();
  noteCountersChanged$ = this.noteCountersChanged.asObservable();

  public get hasDataStore(): boolean {
    return this.dataStore.isReady;
  }

  public get hasStorageDirectory(): boolean {
    // 1. Get the storage directory from the data store
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

    //await Utils.sleep(2000);

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

  public addCollection(collectionName: string): CollectionOperation {
    // Check if a collection name was provided
    if (!collectionName) {
      log.error("collectionName is null");
      return CollectionOperation.Error;
    }

    // Check if there is already a collection with that name
    if (this.collectionExists(collectionName)) {
      log.info(`Not adding collection '${collectionName}' to the data store because it already exists`);
      return CollectionOperation.Duplicate;
    }

    try {
      // Add the collection to the data store
      this.dataStore.addCollection(collectionName, false);
      log.info(`Added collection '${collectionName}' to the data store`);
    } catch (error) {
      log.error(`Could not add collection '${collectionName}'. Cause: ${error}`);

      return CollectionOperation.Error;
    }

    this.collectionAdded.next(collectionName);

    return CollectionOperation.Success;
  }

  public async renameCollectionAsync(collectionId: string, newCollectionName: string): Promise<CollectionOperation> {
    if (!collectionId || !newCollectionName) {
      log.error("renameCollectionAsync: collectionId or newCollectionName is null");
      return CollectionOperation.Error;
    }

    try {
      // 1. Check if there is already a collection with that name
      if (this.collectionExists(newCollectionName)) {
        return CollectionOperation.Duplicate;
      }

      // 2. Rename the collection
      this.dataStore.setCollectionName(collectionId, newCollectionName);
    } catch (error) {
      log.error(`Could not rename the collection with id='${collectionId}' to '${newCollectionName}'. Cause: ${error}`);
      return CollectionOperation.Error;
    }

    this.collectionRenamed.next(newCollectionName);

    return CollectionOperation.Success;
  }

  public getCollections(): Collection[] {
    let collections: Collection[];

    try {
      collections = this.dataStore.getAllCollections();
    } catch (error) {
      log.error(`Could not get collections. Cause: ${error}`);
      // This is a fatal error. Throw the error so the global error handler catches it.
      throw error;
    }

    return collections;
  }

  public getCollectionName(collectionId: string): string {
    return this.dataStore.getCollection(collectionId).name;
  }

  public activateCollection(collectionId: string): void {
    this.dataStore.activateCollection(collectionId);
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    this.collectionActivated.next(activeCollection.name);
  }

  public async deleteCollectionAsync(collectionId: string): Promise<CollectionOperation> {
    if (!collectionId) {
      log.error("deleteCollectionAsync: collectionId is null");
      return CollectionOperation.Error;
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
      return CollectionOperation.Error;
    }

    this.collectionDeleted.next(collectionName);
    return CollectionOperation.Success;
  }

  public async getNotebooksAsync(): Promise<Notebook[]> {
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
      let allNotesNotebook: Notebook = new Notebook(await this.translateService.get('MainPage.AllNotes').toPromise(), activeCollectionId);
      allNotesNotebook.id = Constants.allNotesNotebookId;
      allNotesNotebook.isDefault = true;

      let unfiledNotesNotebook: Notebook = new Notebook(await this.translateService.get('MainPage.UnfiledNotes').toPromise(), activeCollectionId);
      unfiledNotesNotebook.id = Constants.unfiledNotesNotebookId;
      unfiledNotesNotebook.isDefault = true;

      notebooks.push(allNotesNotebook);
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

  public addNotebook(notebookName: string): NotebookOperation {
    // Check if a notebook name was provided
    if (!notebookName) {
      log.error("notebookName is null");
      return NotebookOperation.Error;
    }

    // Check if there is already a notebook with that name
    if (this.notebookExists(notebookName)) {
      log.info(`Not adding notebook '${notebookName}' to the data store because it already exists`);
      return NotebookOperation.Duplicate;
    }

    try {
      // Add the notebook to the data store
      let activeCollection: Collection = this.dataStore.getActiveCollection();
      this.dataStore.addNotebook(activeCollection.id, notebookName);
      log.info(`Added notebook '${notebookName}' to the data store`);
    } catch (error) {
      log.error(`Could not add notebook '${notebookName}'. Cause: ${error}`);

      return NotebookOperation.Error;
    }

    this.notebookAdded.next(notebookName);

    return NotebookOperation.Success;
  }

  public async renameNotebookAsync(notebookId: string, newNotebookName: string): Promise<NotebookOperation> {
    if (!notebookId || !newNotebookName) {
      log.error("renameNotebookAsync: notebookId or newNotebookName is null");
      return NotebookOperation.Error;
    }

    try {
      // 1. Check if there is already a notebook with that name
      if (this.notebookExists(newNotebookName)) {
        return NotebookOperation.Duplicate;
      }

      // 2. Rename the notebook
      this.dataStore.setNotebookName(notebookId, newNotebookName);
    } catch (error) {
      log.error(`Could not rename the notebook with id='${notebookId}' to '${newNotebookName}'. Cause: ${error}`);
      return NotebookOperation.Error;
    }

    this.notebookRenamed.next(newNotebookName);

    return NotebookOperation.Success;
  }

  public getNotebookName(notebookId: string): string {
    return this.dataStore.getNotebook(notebookId).name;
  }

  public async deleteNotebookAsync(notebookId: string): Promise<NotebookOperation> {
    if (!notebookId) {
      log.error("deleteNotebookAsync: notebookId is null");
      return NotebookOperation.Error;
    }

    let notebookName: string = "";

    try {
      // 1. Get the name of the notebook
      notebookName = this.getNotebookName(notebookId);

      // 2. Delete notebook from data store
      this.dataStore.deleteNotebook(notebookId);
    } catch (error) {
      log.error(`Could not delete the notebook with id='${notebookId}'. Cause: ${error}`);
      return NotebookOperation.Error;
    }

    this.notebookDeleted.next(notebookName);
    return NotebookOperation.Success;
  }

  public async deleteNoteAsync(noteId: string): Promise<NoteOperation> {
    if (!noteId) {
      log.error("deleteNoteAsync: noteId is null");
      return NoteOperation.Error;
    }

    let noteTitle: string = "";

    try {
      let noteToDelete: Note = this.dataStore.getNote(noteId);

      if (noteToDelete.isOpen) {
        log.warn(`Blocked delete the note with id='${noteId}', because the note is open.`);
        // TODO: maybe add a custom event in order to notify the user why the delete was prevented.
        return NoteOperation.Blocked;
      }

      // 1. Get the title of the note
      noteTitle = noteToDelete.title;

      // 2. Delete note from data store
      this.dataStore.deleteNote(noteId);

      // 3. Delete all files from disk, which are related to the note.
      // TODO
    } catch (error) {
      log.error(`Could not delete the note with id='${noteId}'. Cause: ${error}`);
      return NoteOperation.Error;
    }

    this.noteDeleted.next(noteTitle);
    return NoteOperation.Success;
  }

  private async getNoteDateFormatResultAsync(millisecondsSinceEpoch: number, useFuzzyDates: boolean): Promise<NoteDateFormatResult> {
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

  public async getNotesAsync(notebookId: string, useFuzzyDates: boolean): Promise<Note[]> {
    let notes: Note[] = [];

    let arg: NoteCountersArgument = new NoteCountersArgument();

    try {
      // Get the notes from the data store
      let activeCollection: Collection = this.dataStore.getActiveCollection();

      if (notebookId === Constants.allNotesNotebookId) {
        notes = this.dataStore.getAllNotes(activeCollection.id);
      } else if (notebookId === Constants.unfiledNotesNotebookId) {
        notes = this.dataStore.getUnfiledNotes(activeCollection.id);
      } else {
        notes = this.dataStore.getNotes(notebookId);
      }

      // Fill in counters
      arg.allNotesCount = notes.length;
      arg.markedNotesCount = notes.filter(x => x.isMarked).length;

      // Fill in the display date
      for (let note of notes) {
        let result: NoteDateFormatResult = await this.getNoteDateFormatResultAsync(note.modificationDate, useFuzzyDates);

        // More counters
        if (result.isTodayNote) {
          arg.todayNotesCount++;
        }

        if (result.isYesterdayNote) {
          arg.yesterdayNotesCount++;
        }

        if (result.isThisWeekNote) {
          arg.thisWeekNotesCount++;
        }

        // Date text
        note.displayModificationDate = result.dateText;
      }

      this.noteCountersChanged.next(arg);
    } catch (error) {
      log.error(`Could not get notes. Cause: ${error}`);
    }

    return notes;
  }

  private getSimilarTitles(baseTitle: string): string[] {
    let notesWithIdenticalBaseTitle: Note[] = this.dataStore.getNotesWithIdenticalBaseTitle(baseTitle);
    return notesWithIdenticalBaseTitle.map(x => x.title);
  }

  private getUniqueNoteTitle(baseTitle: string): string {
    let similarTitles: string[] = [];
    let counter: number = 1;
    let uniqueTitle: string = `${baseTitle} ${counter}`;

    similarTitles = this.getSimilarTitles(baseTitle);

    while (similarTitles.includes(uniqueTitle)) {
      counter++;
      uniqueTitle = `${baseTitle} ${counter}`;
    }

    return uniqueTitle;
  }

  public addNote(baseTitle: string, notebookId: string): AddNoteResult {
    let uniqueTitle: string = "";
    let addNoteResult: AddNoteResult = new AddNoteResult();

    // If a default notebook was selected, make sure the note is added as unfiled.
    if (notebookId === Constants.allNotesNotebookId || notebookId === Constants.unfiledNotesNotebookId) {
      notebookId = "";
    }

    try {
      uniqueTitle = this.getUniqueNoteTitle(baseTitle);
      let activeCollection: Collection = this.dataStore.getActiveCollection();
      addNoteResult.noteId = this.dataStore.addNote(uniqueTitle, notebookId, activeCollection.id);
      addNoteResult.noteTitle = uniqueTitle;

      this.noteAdded.next(uniqueTitle);
    } catch (error) {
      log.error(`Could not add note '${uniqueTitle}'. Cause: ${error}`);
      addNoteResult.operation = NoteOperation.Error;
    }

    return addNoteResult;
  }

  public getNote(noteId: string): Note {
    return this.dataStore.getNote(noteId);
  }

  public canOpenNote(noteId: string) {
    let openNotes: Note[] = this.dataStore.getOpenNotes();

    if (openNotes.map(x => x.id).includes(noteId)) {
      return false;
    }

    return true;
  }

  public closeAllNotes(): void {
    this.dataStore.closeAllNotes();
  }

  public setNoteMark(noteId: string, isMarked: boolean): void {
    this.dataStore.setNoteMark(noteId, isMarked);
    let activeCollection: Collection = this.dataStore.getActiveCollection();
    let markedNotes: Note[] = this.dataStore.getMarkedNotes(activeCollection.id);
    let arg: NoteMarkChangedArgument = new NoteMarkChangedArgument(noteId, isMarked, markedNotes.length);
    this.noteMarkChanged.next(arg);
  }
}