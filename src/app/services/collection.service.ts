import { Injectable } from '@angular/core';
import { Constants } from '../core/constants';
import * as path from 'path';
import * as fs from 'fs-extra';
import log from 'electron-log';
import * as Store from 'electron-store';
import { Subject } from 'rxjs';
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
import * as sanitize from 'sanitize-filename';
import { DataStore } from '../data/dataStore';
import { NoteMarkResult } from './results/noteMarkResult';
import { NoteDetailsResult } from './results/noteDetailsResult';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  constructor(private translateService: TranslateService, private searchService: SearchService,
    private dataStore: DataStore) {
  }

  private isInitializing: boolean = false;
  private globalEmitter = remote.getGlobal('globalEmitter');
  private settings: Store = new Store();
  private openNoteIds: string[] = [];

  private collectionsChanged = new Subject();
  collectionsChanged$ = this.collectionsChanged.asObservable();

  private notebooksChanged = new Subject();
  notebooksChanged$ = this.notebooksChanged.asObservable();

  private notesChanged = new Subject();
  notesChanged$ = this.notesChanged.asObservable();

  private notesCountChanged = new Subject<NotesCountResult>();
  notesCountChanged$ = this.notesCountChanged.asObservable();

  private noteMarkChanged = new Subject<NoteMarkResult>();
  noteMarkChanged$ = this.noteMarkChanged.asObservable();

  private noteNotebookChanged = new Subject();
  noteNotebookChanged$ = this.noteNotebookChanged.asObservable();

  public get hasStorageDirectory(): boolean {
    // 1. Get the storage directory from the settings
    let storageDirectory: string = this.settings.get('storageDirectory');

    if (!storageDirectory) {
      // Storage directory is empty
      log.info("Storage directory setting is empty");
      return false;
    }

    // 2. If a storage directory was found in the settings, check if it exists on disk.
    if (!fs.existsSync(storageDirectory)) {
      // Storage directory is not found on disk
      log.info(`Storage directory '${storageDirectory}' is not found on disk`);
      return false;
    }

    // Storage directory is OK.
    log.info(`Storage directory '${storageDirectory}' is OK`);
    return true;
  }

  public async setStorageDirectoryAsync(parentDirectory: string): Promise<boolean> {
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

  private pathToCollection(collectionDirectoryPath: string): string {
    return path.dirname(collectionDirectoryPath).split(path.sep).pop();
  }

  private collectionToPath(collection: string): string {
    let storageDirectory: string = this.settings.get('storageDirectory');

    return path.join(storageDirectory, collection);
  }

  public async getCollectionsAsync() {
    let storageDirectory: string = this.settings.get('storageDirectory');
    let fileNames: string[] = await fs.readdir(storageDirectory);
    let collections: string[] = [];

    for (let fileName of fileNames) {
      let absoluteFilePath: string = path.join(storageDirectory, fileName);
      let stat: any = await fs.stat(absoluteFilePath);

      if (stat.isDirectory()) {
        collections.push(fileName);
      }
    }

    return collections;
  }

  public async initializeAsync(): Promise<void> {
    // Prevents initializing multiple times. To prevent calling 
    // functions before initialization is complete, force a wait.
    if (this.isInitializing) {
      while (this.isInitializing) {
        await Utils.sleep(100);
      }

      return;
    }

    this.isInitializing = true;

    // Get the active collection from the settings
    let storageDirectory: string = this.settings.get('storageDirectory');
    let activeCollection: string = this.settings.get('activeCollection');
    let activeCollectionDirectory: string = "";

    if (activeCollection && this.collectionToPath(activeCollection).includes(storageDirectory) &&
      this.collectionToPath(activeCollection) !== storageDirectory && await fs.exists(this.collectionToPath(activeCollection))) {
      // There is an active collection and the collection directory exists
      activeCollectionDirectory = this.collectionToPath(activeCollection);
    } else {
      // There is no active collection or no collection directory
      // Get all collection directories in the storage directory
      let collections: string[] = await this.getCollectionsAsync();

      if (collections && collections.length > 0) {
        // If there are collection directories, take the first one.
        activeCollectionDirectory = collections[0];
        this.settings.set('activeCollection', this.pathToCollection(activeCollectionDirectory));
      } else {
        // If there are no collection directories, we must create a default collection.
        activeCollectionDirectory = this.collectionToPath(Constants.defaultCollection);
        await fs.mkdir(activeCollectionDirectory);
        this.settings.set('activeCollection', Constants.defaultCollection);
      }
    }

    let databaseFile: string = path.join(activeCollectionDirectory, `${activeCollection}.db`);

    log.info(`${databaseFile}`);

    // Now initialize the data store.
    await this.dataStore.initializeAsync(databaseFile);

    //await Utils.sleep(2000);

    // Only an initialized collectionService can process global requests
    this.listenToNoteEvents();

    this.isInitializing = false;
  }

  private listenToNoteEvents(): void {
    this.globalEmitter.on(Constants.setNoteOpenEvent, this.setNoteOpenAsync.bind(this));
    this.globalEmitter.on(Constants.setNoteMarkEvent, this.setNoteMark.bind(this));
    this.globalEmitter.on(Constants.setNotebookEvent, this.setNotebook.bind(this));
    this.globalEmitter.on(Constants.getNoteDetailsEvent, this.getNoteDetailsEventHandler.bind(this));
    this.globalEmitter.on(Constants.getNotebooksEvent, this.getNotebooksEventHandler.bind(this));
    this.globalEmitter.on(Constants.setNoteTitleEvent, this.setNoteTitleEventHandler.bind(this));
    this.globalEmitter.on(Constants.setNoteTextEvent, this.setNoteTextEventHandler.bind(this));
    this.globalEmitter.on(Constants.setNoteAllEvent, this.setNoteAllEventHandler.bind(this));
  }

  private async collectionExistsAsync(collection: string): Promise<boolean> {
    let collections: string[] = await this.getCollectionsAsync();
    let existingCollections: string[] = collections.filter(x => x.toLocaleLowerCase() === collection.toLocaleLowerCase());

    return existingCollections && existingCollections.length > 0;
  }

  public async addCollectionAsync(possiblyDirtyCollection: string): Promise<Operation> {
    // Check if a collection name was provided
    if (!possiblyDirtyCollection) {
      return Operation.Error;
    }

    let sanitizedCollection: string = sanitize(possiblyDirtyCollection);

    // Check if there is already a collection with that name
    if (await this.collectionExistsAsync(sanitizedCollection)) {
      log.info(`Not adding collection '${sanitizedCollection}' because it already exists`);
      return Operation.Duplicate;
    }

    try {
      // Add the collection
      let storageDirectory: string = this.settings.get('storageDirectory');
      await fs.mkdir(this.collectionToPath(`${sanitizedCollection}`));

      log.info(`Added collection '${sanitizedCollection}'`);

      // Activate the added collection
      this.settings.set('activeCollection', sanitizedCollection);
    } catch (error) {
      log.error(`Could not add collection '${sanitizedCollection}'. Cause: ${error}`);

      return Operation.Error;
    }

    this.collectionsChanged.next();

    return Operation.Success;
  }

  public async renameCollectionAsync(oldCollection: string, newCollection: string): Promise<Operation> {
    if (!oldCollection || !newCollection) {
      log.error("renameCollectionAsync: oldCollection or newCollection is null");
      return Operation.Error;
    }

    try {
      await fs.move(this.collectionToPath(oldCollection), this.collectionToPath(newCollection));
      this.settings.set('activeCollection', newCollection);
    } catch (error) {
      log.error(`Could not rename the collection '${oldCollection}' to '${newCollection}'. Cause: ${error}`);
      return Operation.Error;
    }

    this.collectionsChanged.next();

    return Operation.Success;
  }

  public async deleteCollectionAsync(collection: string): Promise<Operation> {
    if (!collection) {
      log.error("deleteCollectionAsync: collection is null");
      return Operation.Error;
    }

    try {
      await fs.remove(this.collectionToPath(collection));
      let collections: string[] = await this.getCollectionsAsync();

      if (collections && collections.length > 0) {
        this.settings.set('activeCollection', collections[0]);
      } else {
        this.settings.set('activeCollection', "");
      }
    } catch (error) {
      log.error(`Could not delete the collection '${collection}'. Cause: ${error}`);
    }

    this.collectionsChanged.next();

    return Operation.Success;
  }

  public activateCollection(collection: string): void {
    this.settings.set('activeCollection', collection);
    this.collectionsChanged.next();
  }

  public getActiveCollection(): string {
    return this.settings.get('activeCollection');
  }

  private async getNoteDetailsEventHandler(noteId: string, callback: any): Promise<void> {
    let note: Note = this.dataStore.getNoteById(noteId);
    let notebookName: string = await this.translateService.get('MainPage.UnfiledNotes').toPromise();

    if (note.notebookId) {
      let notebook: Notebook = this.dataStore.getNotebookById(note.notebookId);
      notebookName = notebook.name;
    }

    callback(new NoteDetailsResult(note.title, notebookName, note.isMarked));
  }

  private async sendNotebookNameAsync(noteId: string) {
    let note: Note = this.dataStore.getNoteById(noteId);
    let notebookName: string = await this.translateService.get('MainPage.UnfiledNotes').toPromise();

    if (note.notebookId) {
      let notebook: Notebook = this.dataStore.getNotebookById(note.notebookId);
      notebookName = notebook.name;
    }

    this.globalEmitter.emit(Constants.notebookChangedEvent, noteId, notebookName);
  }

  private async getNotebooksEventHandler(callback: any): Promise<void> {
    let notebooks: Notebook[] = await this.getNotebooksAsync(false);
    callback(notebooks);
  }

  private async setNoteOpenAsync(noteId: string, test: string, isOpen: boolean): Promise<void> {
    if (isOpen) {
      if (!this.openNoteIds.includes(noteId)) {
        this.openNoteIds.push(noteId);
      }
    } else {
      if (this.openNoteIds.includes(noteId)) {
        this.openNoteIds.splice(this.openNoteIds.indexOf(noteId), 1);
      }
    }
  }

  public noteIsOpen(noteId: string): boolean {
    if (this.openNoteIds.includes(noteId)) {
      return true;
    }

    return false;
  }

  public hasOpenNotes(): boolean {
    return this.openNoteIds.length > 0;
  }

  private noteExists(noteTitle: string): boolean {
    let note: Note = this.dataStore.getNoteByTitle(noteTitle);

    return note != null;
  }

  public async getNotebooksAsync(includeAllNotes: boolean): Promise<Notebook[]> {
    let notebooks: Notebook[] = [];

    try {
      // Add the default notebooks
      if (includeAllNotes) {
        let allNotesNotebook: Notebook = new Notebook(await this.translateService.get('MainPage.AllNotes').toPromise());
        allNotesNotebook.id = Constants.allNotesNotebookId;
        allNotesNotebook.isDefault = true;
        notebooks.push(allNotesNotebook);
      }

      let unfiledNotesNotebook: Notebook = new Notebook(await this.translateService.get('MainPage.UnfiledNotes').toPromise());
      unfiledNotesNotebook.id = Constants.unfiledNotesNotebookId;
      unfiledNotesNotebook.isDefault = true;
      notebooks.push(unfiledNotesNotebook);

      // 4. Get the user defined notebooks
      let userNotebooks: Notebook[] = this.dataStore.getNotebooks();

      // 5. Add the user defined notebooks to the notebooks
      notebooks.push.apply(notebooks, userNotebooks);
    } catch (error) {
      log.error(`Could not get notebooks. Cause: ${error}`);
    }

    return notebooks;
  }

  private notebookExists(notebookName: string): boolean {
    let notebook: Notebook = this.dataStore.getNotebookByName(notebookName);

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
      this.dataStore.addNotebook(notebookName);
      log.info(`Added notebook '${notebookName}' to the data store`);
    } catch (error) {
      log.error(`Could not add notebook '${notebookName}'. Cause: ${error}`);

      return Operation.Error;
    }

    this.notebooksChanged.next();

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

    this.notebooksChanged.next();

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

    this.notebooksChanged.next();
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
      let activeCollection: string = this.settings.get('activeCollection');
      fs.unlinkSync(path.join(this.collectionToPath(activeCollection), `${noteId}${Constants.noteExtension}`), '');

      // 2. Delete note from data store
      this.dataStore.deleteNote(noteId);
    } catch (error) {
      log.error(`Could not delete the note with id='${noteId}'. Cause: ${error}`);
      return Operation.Error;
    }

    this.notesChanged.next();
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

      if (notebookId === Constants.allNotesNotebookId) {
        uncategorizedNotes = this.dataStore.getNotes();
      } else if (notebookId === Constants.unfiledNotesNotebookId) {
        uncategorizedNotes = this.dataStore.getUnfiledNotes();
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

  private getUniqueNoteNoteTitle(baseTitle: string): string {
    let counter: number = 0;
    let uniqueTitle: string = baseTitle;

    let notesWithIdenticalBaseTitle: Note[] = this.dataStore.getNotesWithIdenticalBaseTitle(baseTitle);
    let similarTitles: string[] = notesWithIdenticalBaseTitle.map(x => x.title);

    while (similarTitles.includes(uniqueTitle)) {
      counter++;
      uniqueTitle = `${baseTitle} (${counter})`;
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
      result.noteId = this.dataStore.addNote(uniqueTitle, notebookId);

      // 2. Create note file
      let activeCollection: string = this.settings.get('activeCollection');
      fs.writeFileSync(path.join(this.collectionToPath(activeCollection), `${result.noteId}${Constants.noteExtension}`), '');

      this.notesChanged.next();
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
      notebook = new Notebook(await this.translateService.get('MainPage.UnfiledNotes').toPromise());
    }

    return notebook;
  }

  public setNoteMark(noteId: string, isMarked: boolean): void {
    let note: Note = this.dataStore.getNoteById(noteId);
    note.isMarked = isMarked;
    this.dataStore.updateNote(note);

    let markedNotes: Note[] = this.dataStore.getMarkedNotes();
    let result: NoteMarkResult = new NoteMarkResult(noteId, note.isMarked, markedNotes.length);

    this.noteMarkChanged.next(result);
    this.globalEmitter.emit(Constants.noteMarkChangedEvent, note.id, note.isMarked);
  }

  public setNotebook(noteId: string, notebookId: string): Operation {
    if (!noteId) {
      log.error("setNotebook: noteId is null");
      return Operation.Error;
    }

    if (!notebookId) {
      log.error("setNotebook: notebookId is null");
      return Operation.Error;
    }

    try {
      let note: Note = this.dataStore.getNoteById(noteId);

      if (notebookId === Constants.unfiledNotesNotebookId) {
        notebookId = "";
      }

      note.notebookId = notebookId;
      this.dataStore.updateNote(note);
    } catch (error) {
      log.error(`Could not set the notebook for the note with id='${noteId}' to notebook with id='${notebookId}'. Cause: ${error}`);
      return Operation.Error;
    }

    this.noteNotebookChanged.next();
    this.sendNotebookNameAsync(noteId);

    return Operation.Success;
  }

  public setNoteTitleEventHandler(noteId: string, initialNoteTitle: string, finalNoteTitle: string, callback: any) {
    if (!noteId || !initialNoteTitle) {
      log.error("renameNote: noteId or initialNoteTitle is null");
      callback(new NoteOperationResult(Operation.Error));
      return;
    }

    let uniqueNoteTitle: string = finalNoteTitle.trim();

    if (uniqueNoteTitle.length === 0) {
      callback(new NoteOperationResult(Operation.Blank));
      return;
    }

    if (initialNoteTitle === uniqueNoteTitle) {
      log.error("Final title is the same as initial title. No rename required.");
      callback(new NoteOperationResult(Operation.Aborted));
      return;
    }

    try {
      // 1. Make sure the final title is unique
      uniqueNoteTitle = this.getUniqueNoteNoteTitle(finalNoteTitle);

      // 2. Rename the note
      let note: Note = this.dataStore.getNoteById(noteId);
      note.title = uniqueNoteTitle;
      this.dataStore.updateNote(note);

      log.info(`Renamed note with id=${noteId} from ${initialNoteTitle} to ${uniqueNoteTitle}.`);
    } catch (error) {
      log.error(`Could not rename the note with id='${noteId}' to '${uniqueNoteTitle}'. Cause: ${error}`);
      callback(new NoteOperationResult(Operation.Error));
      return;
    }

    let result: NoteOperationResult = new NoteOperationResult(Operation.Success);
    result.noteId = noteId;
    result.noteTitle = uniqueNoteTitle;

    this.notesChanged.next();
    callback(result);
  }

  public setNoteTextEventHandler(noteId: string, noteText: string, callback: any) {
    try {
      let note: Note = this.dataStore.getNoteById(noteId);
      note.text = noteText;
      this.dataStore.updateNote(note);
    } catch (error) {
      log.error(`Could not set text for the note with id='${noteId}' in the data store. Cause: ${error}`);
      callback(Operation.Error);
      return;
    }

    callback(Operation.Success);
    return;
  }

  public setNoteAllEventHandler(noteId: string, noteTitle: string, noteText: string, callback: any): void {
    try {
      let note: Note = this.dataStore.getNoteById(noteId);
      note.title = noteTitle;
      note.text = noteText;
      this.dataStore.updateNote(note);
    } catch (error) {
      log.error(`Could not update the note with id='${noteId}'. Cause: ${error}`);
    }

    this.notesChanged.next();
    callback();
  }
}