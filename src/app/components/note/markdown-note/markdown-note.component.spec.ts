import { Mock } from 'typemoq';
import { INoteEditor } from '../note-editor/i-note-editor';
import { MarkdownNoteComponent } from './markdown-note.component';

describe('MarkdownNoteComponent highlight shortcut', () => {
    it.each([true, false])('handles the shortcut with editing=%s', (isEditing) => {
        const component = new MarkdownNoteComponent();
        const editor = Mock.ofType<INoteEditor>();
        const applyHighlight = jest.fn();
        editor.setup((x) => x.isEditing).returns(() => isEditing);
        editor.setup((x) => x.applyHighlight()).callback(applyHighlight);
        component.noteEditor = editor.object;
        const event = new KeyboardEvent('keydown', { key: 'h', ctrlKey: true, cancelable: true });

        component.onHighlightShortcut(event);

        expect(event.defaultPrevented).toBe(isEditing);
        expect(applyHighlight).toHaveBeenCalledTimes(isEditing ? 1 : 0);
    });
});
