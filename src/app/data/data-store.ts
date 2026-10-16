import { Injectable } from '@angular/core';
import { Note } from './entities/note';
import { Notebook } from './entities/notebook';

@Injectable()
export abstract class DataStore {
    public abstract initializeAsync(databaseFile: string): Promise<void>;
    public abstract saveAsync(): Promise<void>;

    public abstract getNotebooks(): Notebook[];
    public abstract getNotebookById(id: string): Notebook;
    public abstract getNotebookByName(name: string): Notebook;
    public abstract addNotebook(name: string): string;
    public abstract deleteNotebook(id: string): void;
    public abstract updateNotebook(notebook: Notebook, save?: boolean): void;

    public abstract getNotes(): Note[];
    public abstract getTrashedNotes(): Note[];
    public abstract getUnfiledNotes(): Note[];
    public abstract getMarkedNotes(): Note[];
    public abstract getNotebookNotes(notebookId: string): Note[];
    public abstract getNotesWithIdenticalBaseTitle(baseTitle: string): Note[];
    public abstract getNoteById(id: string): Note;
    public abstract getNoteByTitle(noteTitle: string): Note;
    public abstract addNote(title: string, notebookId: string, isMarkdownNote: boolean): string;
    public abstract deleteNote(id: string): void;
    public abstract trashNote(id: string): void;
    public abstract restoreNote(id: string): void;
    public abstract encryptNote(id: string, secretKeyHash: string): void;
    public abstract decryptNote(id: string): void;
    public abstract updateNote(note: Note): void;
    public abstract updateNoteWithoutDate(note: Note): void;
}
