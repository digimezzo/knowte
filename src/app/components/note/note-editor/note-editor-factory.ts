import { Injectable } from '@angular/core';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { Logger } from '../../../core/logger';
import { ClassicNoteEditor } from './classic-note-editor';
import { INoteEditor } from './i-note-editor';
import { ImagePathConverter } from './image-path-replacer';
import { MarkdownNoteEditor } from './markdown-note-editor';
import { QuillFactory } from './quill-factory';
import { QuillTweaker } from './quill-tweaker';

@Injectable()
export class NoteEditorFactory {
    public constructor(
        private imagePathConverter: ImagePathConverter,
        private quillFactory: QuillFactory,
        private quillTweaker: QuillTweaker,
        private clipboard: ClipboardManager,
        private settings: BaseSettings,
        private logger: Logger
    ) {}

    public create(isMarkdownNote: boolean): INoteEditor {
        if (isMarkdownNote) {
            return new MarkdownNoteEditor(this.imagePathConverter);
        }

        return new ClassicNoteEditor(this.quillFactory, this.quillTweaker, this.clipboard, this.settings, this.logger);
    }
}
