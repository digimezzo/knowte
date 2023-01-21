import { Injectable } from '@angular/core';
import * as Quill from 'quill';
import { TranslatorService } from '../../services/translator/translator.service';

@Injectable()
export class QuillTweaker {
    public constructor(private translatorService: TranslatorService) {}

    /**
     * Forces paste of unformatted text
     * See: https://stackoverflow.com/questions/41237486/how-to-paste-plain-text-in-a-quill-based-editor
     * @param quill The Quill instance
     */
    public forcePasteOfUnformattedText(quill: Quill): void {
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
            const plaintext = node.innerText;
            const Delta = Quill.import('delta');
            return new Delta().insert(plaintext);
        });
    }

    /**
     * Assigns an action to a CTRL+key combination
     * @param quill The Quill instance
     * @param key The key that is press in combination with CTRL
     * @param action The action to perform when pressing the CTRL+key combination
     */
    public assignActionToControlKeyCombination(quill: Quill, key: string, action: () => void): void {
        quill.keyboard.addBinding({
            key: key,
            ctrlKey: true,
            handler: () => action(),
        });
    }

    /**
     * Assigns an action to the Quill text-change event
     * @param quill The Quill instance
     * @param action The action to perform on the Quill text-change event
     */
    public assignActionToTextChange(quill: Quill, action: () => void): void {
        quill.on('text-change', () => action());
    }

    /**
     * Sets Quill toolbar tooltips
     * See: https://github.com/quilljs/quill/issues/650
     * @param toolbarElement
     */
    public async setToolbarTooltipsAsync(): Promise<void> {
        const toolbarElement: Element = document.querySelector('.ql-toolbar');

        toolbarElement
            .querySelector('span.ql-background')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.Highlight'));
        toolbarElement.querySelector('button.ql-undo').setAttribute('title', await this.translatorService.getAsync('Tooltips.Undo'));
        toolbarElement.querySelector('button.ql-redo').setAttribute('title', await this.translatorService.getAsync('Tooltips.Redo'));
        toolbarElement.querySelector('button.ql-bold').setAttribute('title', await this.translatorService.getAsync('Tooltips.Bold'));
        toolbarElement.querySelector('button.ql-italic').setAttribute('title', await this.translatorService.getAsync('Tooltips.Italic'));
        toolbarElement
            .querySelector('button.ql-underline')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.Underline'));
        toolbarElement
            .querySelector('button.ql-strike')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.Strikethrough'));

        toolbarElement
            .querySelector('[class="ql-header"][value="1"]')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.Heading1'));
        toolbarElement
            .querySelector('[class="ql-header"][value="2"]')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.Heading2'));

        toolbarElement
            .querySelector('[class="ql-list"][value="ordered"]')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.NumberedList'));
        toolbarElement
            .querySelector('[class="ql-list"][value="bullet"]')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.BulletedList'));
        toolbarElement
            .querySelector('[class="ql-list"][value="check"]')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.TaskList'));

        toolbarElement.querySelector('button.ql-link').setAttribute('title', await this.translatorService.getAsync('Tooltips.Link'));
        toolbarElement.querySelector('button.ql-blockquote').setAttribute('title', await this.translatorService.getAsync('Tooltips.Quote'));
        toolbarElement.querySelector('button.ql-code-block').setAttribute('title', await this.translatorService.getAsync('Tooltips.Code'));
        toolbarElement.querySelector('button.ql-image').setAttribute('title', await this.translatorService.getAsync('Tooltips.Image'));

        toolbarElement
            .querySelector('button.ql-clean')
            .setAttribute('title', await this.translatorService.getAsync('Tooltips.ClearFormatting'));
    }
}
