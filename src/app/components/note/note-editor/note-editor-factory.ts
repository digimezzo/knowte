import { Injectable } from '@angular/core';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { Desktop } from '../../../core/desktop';
import { Logger } from '../../../core/logger';
import { ClassicNoteEditor } from './classic-note-editor';
import { INoteEditor } from './i-note-editor';
import { MarkdownNoteEditor } from './markdown-note-editor';
import { NoteImageSaver } from './note-image-saver';
import { QuillFactory } from './quill-factory';
import { QuillTweaker } from './quill-tweaker';

@Injectable()
export class NoteEditorFactory {
    public constructor(
        private noteImageSaver: NoteImageSaver,
        private quillFactory: QuillFactory,
        private quillTweaker: QuillTweaker,
        private clipboard: ClipboardManager,
        private desktop: Desktop,
        private settings: BaseSettings,
        private logger: Logger
    ) {}

    public create(noteId: string, isMarkdownNote: boolean): INoteEditor {
        if (isMarkdownNote) {
            return new MarkdownNoteEditor(noteId, this.noteImageSaver, this.clipboard, this.desktop, this.settings, this.logger);
        }

        return new ClassicNoteEditor(noteId, this.quillFactory, this.quillTweaker, this.clipboard, this.settings, this.logger);
    }
}
