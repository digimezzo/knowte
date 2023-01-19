import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { Observable, Subject } from 'rxjs';
import { Operation } from '../../core/enums';
import { TasksCount } from '../../core/tasks-count';
import { Utils } from '../../core/utils';
import { Notebook } from '../../data/entities/notebook';
import { NoteDetailsResult } from '../results/note-details-result';
import { NoteMarkResult } from '../results/note-mark-result';
import { NoteOperationResult } from '../results/note-operation-result';
import { CollectionEvents } from './collection-events';

/**
 * CollectionService should never be initialized from the note window. There should
 * only be 1 instance of CollectionService and it should be in the main window.
 * This class ensures that the note window can request data from the CollectionService
 * instance that exists in the main window.
 */
@Injectable()
export class CollectionClient {
    public constructor() {
        this.globalEmitter.on(CollectionEvents.closeNoteEvent, (noteId: string) => this.closeNote.next(noteId));
        this.globalEmitter.on(CollectionEvents.focusNoteEvent, (noteId: string) => this.focusNote.next(noteId));
        this.globalEmitter.on(CollectionEvents.noteMarkChangedEvent, (result: NoteMarkResult) => this.noteMarkChanged.next(result));
        this.globalEmitter.on(CollectionEvents.noteZoomPercentageChangedEvent, () => this.noteZoomPercentageChanged.next());
    }

    private globalEmitter: any = remote.getGlobal('globalEmitter');

    private closeNote: Subject<string> = new Subject();
    public closeNote$: Observable<string> = this.closeNote.asObservable();

    private focusNote: Subject<string> = new Subject();
    public focusNote$: Observable<string> = this.focusNote.asObservable();

    private noteMarkChanged: Subject<NoteMarkResult> = new Subject();
    public noteMarkChanged$: Observable<NoteMarkResult> = this.noteMarkChanged.asObservable();

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
            await Utils.sleep(50);
        }

        return noteDetailsResult;
    }

    public async seNoteTitleAsync(noteId: string, initialNoteTitle: string, finalNoteTitle: string): Promise<NoteOperationResult> {
        await this.waitForInitializedAsync();

        let noteOperationResult: NoteOperationResult;

        this.globalEmitter.emit(
            CollectionEvents.setNoteTitleEvent,
            noteId,
            initialNoteTitle,
            finalNoteTitle,
            (receivedNoteOperationResult: NoteOperationResult) => (noteOperationResult = receivedNoteOperationResult)
        );

        while (noteOperationResult === null || noteOperationResult === undefined) {
            await Utils.sleep(50);
        }

        return noteOperationResult;
    }

    public async setNoteTextAsync(
        noteId: string,
        noteText: string,
        isEncrypted: boolean,
        secretKey: string,
        tasksCount: TasksCount
    ): Promise<Operation> {
        await this.waitForInitializedAsync();

        let operation: Operation;

        this.globalEmitter.emit(
            CollectionEvents.setNoteTextEvent,
            noteId,
            noteText,
            isEncrypted,
            secretKey,
            tasksCount,
            (receivedOperation: Operation) => (operation = receivedOperation)
        );

        while (operation === null || operation === undefined) {
            await Utils.sleep(50);
        }

        return operation;
    }

    public async deleteNoteAsync(noteId: string): Promise<void> {
        await this.waitForInitializedAsync();

        this.globalEmitter.emit(CollectionEvents.deleteNoteEvent, noteId);
    }

    public async encryptNoteAsync(noteId: string, secretKey: string): Promise<void> {
        await this.waitForInitializedAsync();

        this.globalEmitter.emit(CollectionEvents.encryptNoteEvent, noteId, secretKey);
    }

    public async decryptNoteAsync(noteId: string): Promise<void> {
        await this.waitForInitializedAsync();

        this.globalEmitter.emit(CollectionEvents.decryptNoteEvent, noteId);
    }

    public async setNoteOpenAsync(noteId: string, isOpen: boolean): Promise<void> {
        await this.waitForInitializedAsync();

        this.globalEmitter.emit(CollectionEvents.setNoteOpenEvent, noteId, isOpen);
    }

    public async setNoteMarkAsync(noteId: string, isMarked: boolean): Promise<void> {
        await this.waitForInitializedAsync();

        this.globalEmitter.emit(CollectionEvents.setNoteMarkEvent, noteId, isMarked);
    }

    public async setNotebookAsync(notebookId: string, noteIds: string[]): Promise<void> {
        await this.waitForInitializedAsync();

        this.globalEmitter.emit(CollectionEvents.setNotebookEvent, notebookId, noteIds);
    }

    public async getNotebooksAsync(): Promise<Notebook[]> {
        await this.waitForInitializedAsync();

        let notebooks: Notebook[] = [];

        this.globalEmitter.emit(CollectionEvents.getNotebooksEvent, (receivedNotebooks: Notebook[]) => (notebooks = receivedNotebooks));

        return notebooks;
    }

    private async waitForInitializedAsync(): Promise<void> {
        let isInitialized: boolean = false;

        while (!isInitialized) {
            this.globalEmitter.emit(
                CollectionEvents.getIsInitializedEvent,
                (receivedIsInitialized: boolean) => (isInitialized = receivedIsInitialized)
            );

            await Utils.sleep(50);
        }
    }
}
