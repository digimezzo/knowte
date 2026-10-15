import { Subject } from 'rxjs';
import { Mock } from 'typemoq';
import { Logger } from '../../../common/logging/logger';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { BoundaryGetter } from './boundary-getter';
import { MarkdownNoteEditor } from './markdown-note-editor';
import { NoteImageSaver } from './note-image-saver';

jest.mock('@electron/remote', () => ({}));
jest.mock('nanoid', () => ({ nanoid: () => 'image-id' }));

describe('MarkdownNoteEditor highlighting', () => {
    let editor: MarkdownNoteEditor;
    let input: HTMLTextAreaElement;
    let insertText: jest.Mock;
    let logger: Logger;
    let snackBar: SnackBarService;
    let logError: jest.Mock;
    let notify: jest.Mock;
    const originalExecCommand = document.execCommand;

    function mock<T>(): T {
        return Mock.ofType<T>().object;
    }

    beforeEach(() => {
        const saver = Mock.ofType<NoteImageSaver>();
        saver.setup((x) => x.imageSaved$).returns(() => new Subject<string>());
        const loggerMock = Mock.ofType<Logger>();
        logError = jest.fn();
        loggerMock.setup((x) => x.error).returns(() => logError);
        logger = loggerMock.object;
        const snackBarMock = Mock.ofType<SnackBarService>();
        notify = jest.fn();
        snackBarMock.setup((x) => x.oopsAnErrorOccurredAsync).returns(() => notify);
        snackBar = snackBarMock.object;
        editor = new MarkdownNoteEditor(
            'note-id', mock(), snackBar, mock(), saver.object, mock(), new BoundaryGetter(),
            mock(), mock(), mock(), logger,
        );
        editor.isEditing = true;
        input = document.createElement('textarea');
        input.id = 'markdown-input';
        document.body.appendChild(input);
        insertText = jest.fn((_command: string, _showUI: boolean, text: string) => {
            input.setRangeText(text, input.selectionStart, input.selectionEnd, 'select');
            return true;
        });
        document.execCommand = insertText;
    });

    afterEach(() => {
        input.remove();
        document.execCommand = originalExecCommand;
    });

    it('wraps selected text and toggles the highlight off again', () => {
        input.value = 'before selected text after';
        input.setSelectionRange(7, 20);

        editor.applyHighlight();

        expect(input.value).toBe('before ==selected text== after');
        expect(insertText).toHaveBeenCalledWith('insertText', false, '==selected text==');

        input.setSelectionRange(7, 24);
        editor.applyHighlight();

        expect(input.value).toBe('before selected text after');
    });

    it('highlights the current word when no text is selected', () => {
        input.value = 'before word after';
        input.setSelectionRange(9, 9);

        editor.applyHighlight();

        expect(input.value).toBe('before ==word== after');
    });

    it('removes highlighting when only the text inside the markers is selected', () => {
        input.value = 'before ==selected text== after';
        input.setSelectionRange(9, 22);

        editor.applyHighlight();

        expect(input.value).toBe('before selected text after');
    });

    it('preserves other inline formatting', () => {
        input.value = '**bold**';
        input.select();

        editor.applyHighlight();

        expect(input.value).toBe('==**bold**==');
    });

    it('highlights a multiline selection', () => {
        input.value = 'first\nsecond';
        input.select();

        editor.applyHighlight();

        expect(input.value).toBe('==first\nsecond==');
    });

    it('does not modify notes in reading mode', () => {
        input.value = 'text';
        input.select();
        editor.isEditing = false;

        editor.applyHighlight();

        expect(input.value).toBe('text');
        expect(insertText).not.toHaveBeenCalled();
    });

    it('reports formatting failures', () => {
        insertText.mockImplementation(() => { throw new Error('Cannot insert'); });
        input.value = 'text';
        input.select();

        editor.applyHighlight();

        expect(logError).toHaveBeenCalledWith(
            'Could not apply highlight. Error: Cannot insert', 'MarkdownNoteEditor', 'applyHighlight',
        );
        expect(notify).toHaveBeenCalled();
    });
});
