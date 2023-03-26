import { Injectable } from '@angular/core';
import { BaseSettings } from '../../../core/base-settings';
import { ClipboardManager } from '../../../core/clipboard-manager';
import { ImageProcessor } from '../../../core/image-processor';
import { Desktop } from '../../../core/io/desktop';
import { Logger } from '../../../core/logger';
import { PathConverter } from '../../../core/path-converter';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../../services/translator/translator.service';
import { BoundaryGetter } from './boundary-getter';
import { ClassicNoteEditor } from './classic-note-editor';
import { INoteEditor } from './i-note-editor';
import { MarkdownNoteEditor } from './markdown-note-editor';
import { NoteImageSaver } from './note-image-saver';
import { QuillFactory } from './quill-factory';
import { QuillTweaker } from './quill-tweaker';

@Injectable()
export class NoteEditorFactory {
    public constructor(
        private translatorService: TranslatorService,
        private snackBarService: SnackBarService,
        private imageProcessor: ImageProcessor,
        private noteImageSaver: NoteImageSaver,
        private quillFactory: QuillFactory,
        private quillTweaker: QuillTweaker,
        private clipboard: ClipboardManager,
        private boundaryGetter: BoundaryGetter,
        private pathConverter: PathConverter,
        private desktop: Desktop,
        private settings: BaseSettings,
        private logger: Logger
    ) {}

    public create(noteId: string, isMarkdownNote: boolean): INoteEditor {
        if (isMarkdownNote) {
            return new MarkdownNoteEditor(
                noteId,
                this.translatorService,
                this.snackBarService,
                this.imageProcessor,
                this.noteImageSaver,
                this.clipboard,
                this.boundaryGetter,
                this.pathConverter,
                this.desktop,
                this.settings,
                this.logger
            );
        }

        return new ClassicNoteEditor(
            noteId,
            this.snackBarService,
            this.quillFactory,
            this.quillTweaker,
            this.clipboard,
            this.settings,
            this.logger
        );
    }
}
