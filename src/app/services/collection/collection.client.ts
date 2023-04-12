import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { Observable, Subject } from 'rxjs';
import { Operation } from '../../common/enums/operation';
import { Scheduler } from '../../common/scheduling/scheduler';
import { TasksCount } from '../../common/ui/tasks-count';
import { Notebook } from '../../data/entities/notebook';
import { NoteDetailsResult } from '../results/note-details-result';
import { NoteMarkResult } from '../results/note-mark-result';
import { NoteOperationResult } from '../results/note-operation-result';
import { NotePinResult } from '../results/note-pin-result';
import { NotebookChangedResult } from '../results/notebook-changed-result';
import { CollectionEvents } from './collection-events';

/**
 * CollectionService should never be initialized from the note window. There should
 * only be 1 instance of CollectionService and it should be in the main window.
 * This class ensures that the note window can request data from the CollectionService
 * instance that exists in the main window.
 */
@Injectable()
export class CollectionClient {
    private globalEmitter: any = remote.getGlobal('globalEmitter');

    public constructor(private scheduler: Scheduler) {
        this.globalEmitter.on(CollectionEvents.closeNoteEvent, (noteId: string) => this.closeNote.next(noteId));
        this.globalEmitter.on(CollectionEvents.focusNoteEvent, (noteId: string) => this.focusNote.next(noteId));
        this.globalEmitter.on(CollectionEvents.noteMarkChangedEvent, (result: NoteMarkResult) => this.noteMarkChanged.next(result));
        this.globalEmitter.on(CollectionEvents.notePinChangedEvent, (result: NotePinResult) => this.notePinChanged.next(result));
        this.globalEmitter.on(CollectionEvents.noteZoomPercentageChangedEvent, () => this.noteZoomPercentageChanged.next());
        this.globalEmitter.on(CollectionEvents.notebookChangedEvent, (result: NotebookChangedResult) => this.notebookChanged.next(result));
        this.globalEmitter.on(CollectionEvents.closeAllNotesEvent, () => this.closeAllNotes.next());
    }

    private closeAllNotes: Subject<void> = new Subject();
    public closeAllNotes$: Observable<void> = this.closeAllNotes.asObservable();

    private closeNote: Subject<string> = new Subject();
    public closeNote$: Observable<string> = this.closeNote.asObservable();

    private focusNote: Subject<string> = new Subject();
    public focusNote$: Observable<string> = this.focusNote.asObservable();

    private noteMarkChanged: Subject<NoteMarkResult> = new Subject();
    public noteMarkChanged$: Observable<NoteMarkResult> = this.noteMarkChanged.asObservable();

    private notePinChanged: Subject<NotePinResult> = new Subject();
    public notePinChanged$: Observable<NotePinResult> = this.notePinChanged.asObservable();

    private notebookChanged: Subject<NotebookChangedResult> = new Subject();
    public notebookChanged$: Observable<NotebookChangedResult> = this.notebookChanged.asObservable();

    private noteZoomPercentageChanged: Subject<void> = new Subject();
    public noteZoomPercentageChanged$: Observable<void> = this.noteZoomPercentageChanged.asObservable();

    public async getNoteDetailsAsync(noteId: string): Promise<NoteDetailsResult> {
        await this.waitForInitializedAsync();

        let noteDetailsResult: NoteDetailsResult;

        this.globalEmitter.emit(
            CollectionEvents.getNoteDetailsEvent,
            noteId,
            (receivedNoteDetailsResult: NoteDetailsResult) => (noteDetailsResult = receivedNoteDetailsResult)
        );

        while (noteDetailsResult === null || noteDetailsResult === undefined) {
            await this.scheduler.sleepAsync(50);
        }

        return noteDetailsResult;
    }

    public async saveNoteTitleAsync(noteId: string, initialNoteTitle: string, finalNoteTitle: string): Promise<NoteOperationResult> {
        let noteOperationResult: NoteOperationResult;

        this.globalEmitter.emit(
            CollectionEvents.saveNoteTitleEvent,
            noteId,
            initialNoteTitle,
            finalNoteTitle,
            (receivedNoteOperationResult: NoteOperationResult) => (noteOperationResult = receivedNoteOperationResult)
        );

        while (noteOperationResult === null || noteOperationResult === undefined) {
            await this.scheduler.sleepAsync(50);
        }

        return noteOperationResult;
    }

    public async saveNoteTextAsync(
        noteId: string,
        noteText: string,
        isEncrypted: boolean,
        secretKey: string,
        tasksCount: TasksCount
    ): Promise<Operation> {
        let operation: Operation;

        this.globalEmitter.emit(
            CollectionEvents.saveNoteTextEvent,
            noteId,
            noteText,
            isEncrypted,
            secretKey,
            tasksCount,
            (receivedOperation: Operation) => (operation = receivedOperation)
        );

        while (operation === null || operation === undefined) {
            await this.scheduler.sleepAsync(50);
        }

        return operation;
    }

    public deleteNote(noteId: string): void {
        this.globalEmitter.emit(CollectionEvents.deleteNoteEvent, noteId);
    }

    public encryptNote(noteId: string, secretKey: string): void {
        this.globalEmitter.emit(CollectionEvents.encryptNoteEvent, noteId, secretKey);
    }

    public decryptNote(noteId: string): void {
        this.globalEmitter.emit(CollectionEvents.decryptNoteEvent, noteId);
    }

    public setNoteOpen(noteId: string, isOpen: boolean): void {
        this.globalEmitter.emit(CollectionEvents.setNoteOpenEvent, noteId, isOpen);
    }

    public setNoteMark(noteId: string, isMarked: boolean): void {
        this.globalEmitter.emit(CollectionEvents.setNoteMarkEvent, noteId, isMarked);
    }

    public setNotePin(noteId: string, isPinned: boolean): void {
        this.globalEmitter.emit(CollectionEvents.setNotePinEvent, noteId, isPinned);
    }

    public setNotebook(notebookId: string, noteIds: string[]): void {
        this.globalEmitter.emit(CollectionEvents.setNotebookEvent, notebookId, noteIds);
    }

    public async getNotebooksAsync(): Promise<Notebook[]> {
        let notebooks: Notebook[] = undefined;

        this.globalEmitter.emit(CollectionEvents.getNotebooksEvent, (receivedNotebooks: Notebook[]) => (notebooks = receivedNotebooks));

        while (notebooks === undefined) {
            await this.scheduler.sleepAsync(50);
        }

        return notebooks;
    }

    public onNoteZoomPercentageChanged(): void {
        this.globalEmitter.emit(CollectionEvents.noteZoomPercentageChangedEvent);
    }

    /**
     * This is a workaround for hot-reload where it can happen that a note sends a
     * command via CollectionClient when CollectionService is not yet initialized.
     * Use this function in commands where this can happen.
     */
    private async waitForInitializedAsync(): Promise<void> {
        let isInitialized: boolean = false;

        while (!isInitialized) {
            this.globalEmitter.emit(
                CollectionEvents.getIsInitializedEvent,
                (receivedIsInitialized: boolean) => (isInitialized = receivedIsInitialized)
            );

            await this.scheduler.sleepAsync(50);
        }
    }
}
