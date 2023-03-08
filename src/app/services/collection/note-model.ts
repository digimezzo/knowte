import { BaseSettings } from '../../core/base-settings';
import { Note } from '../../data/entities/note';
import { CollectionFileAccess } from './collection-file-access';

export class NoteModel {
    private _content: string;
    private _attachmentsDirectoryPath: string;

    public constructor(private note: Note, private settings: BaseSettings, private collectionFileAccess: CollectionFileAccess) {
        this._content = this.collectionFileAccess.getNoteContentByNoteId(note.id, this.settings.activeCollection, note.isMarkdownNote);
        this._attachmentsDirectoryPath = this.collectionFileAccess.getNoteAttachmentsDirectoryPath(note.id, this.settings.activeCollection);
    }

    public get id(): string {
        return this.note.id;
    }

    public get title(): string {
        return this.note.title;
    }

    public get text(): string {
        return this.note.text;
    }

    public get isMarkdownNote(): boolean {
        return this.note.isMarkdownNote;
    }

    public get content(): string {
        return this._content;
    }

    public get attachmentsDirectoryPath(): string {
        return this._attachmentsDirectoryPath;
    }
}
