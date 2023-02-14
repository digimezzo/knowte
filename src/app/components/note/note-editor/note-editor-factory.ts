import { Injectable } from '@angular/core';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { Logger } from '../../../core/logger';
import { QuillTweaker } from '../quill-tweaker';
import { ClassicNoteEditor } from './classic-note-editor';
import { INoteEditor } from './i-note-editor';
import { MarkdownNoteEditor } from './markdown-note-editor';
import { QuillFactory } from './quill-factory';

@Injectable()
export class NoteEditorFactory {
    public constructor(
        private quillFactory: QuillFactory,
        private quillTweaker: QuillTweaker,
        private clipboard: ClipboardManager,
        private settings: BaseSettings,
        private logger: Logger
    ) {}

    public create(isMarkdownNote: boolean): INoteEditor {
        if (isMarkdownNote) {
            return new MarkdownNoteEditor();
        }

        return new ClassicNoteEditor(this.quillFactory, this.quillTweaker, this.clipboard, this.settings, this.logger);
    }
}
