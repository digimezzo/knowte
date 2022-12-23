import { Injectable } from '@angular/core';
import * as Quill from 'quill';

@Injectable()
export class QuillTweaker {
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
}
