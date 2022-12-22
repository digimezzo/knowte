import { Injectable } from '@angular/core';
import * as Quill from 'quill';
import { CustomImageSpec } from './custom-image-spec';
import BlotFormatter from 'quill-blot-formatter';
import { TranslatorService } from '../../services/translator/translator.service';

@Injectable()
export class QuillFactory{
    public constructor(private translator: TranslatorService){}

    public async createAsync(editorId: string, undoAction: () => void, redoAction: () => void): Promise<Quill>{
        const noteTextPlaceHolder: string = await this.translator.getAsync('Notes.NotePlaceholder');

        // Adds undo and redo icons
        const icons: any = Quill.import('ui/icons');
        
        icons['undo'] = `<svg class="custom-undo" viewbox="0 0 18 18">
                            <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
                            <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
                        </svg>`;
        icons['redo'] = `<svg class="custom-redo" viewbox="0 0 18 18">
                            <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
                            <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
                        </svg>`;

        // Fixes double returns when copying text to a notepad
        // See: https://github.com/quilljs/quill/issues/861
        const block = Quill.import('blots/block');
        block.tagName = 'DIV';
        Quill.register(block, true);

        // Adds image resizing and repositioning support
        Quill.register('modules/blotFormatter', BlotFormatter);

        // Create and return new Quill instance
        return new Quill(editorId, {
            modules: {
                toolbar: {
                    container: [
                        ['bold', 'italic', 'underline', 'strike'],
                        ['undo', 'redo'],
                        [
                            { background: [] },
                            { header: 1 },
                            { header: 2 },
                            { list: 'ordered' },
                            { list: 'bullet' },
                            { list: 'check' },
                            'link',
                            'blockquote',
                            'code-block',
                            'image',
                            'clean',
                        ],
                    ],
                    handlers: {
                        undo: undoAction,
                        redo: redoAction,
                    },
                },
                blotFormatter: {
                    specs: [CustomImageSpec],
                },
            },
            placeholder: noteTextPlaceHolder,
            theme: 'snow',
        });
    }
}