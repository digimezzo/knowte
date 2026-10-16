import { Mock } from 'typemoq';
import { ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Operation } from '../../../common/enums/operation';
import { Logger } from '../../../common/logging/logger';
import { CollectionClient } from '../../../services/collection/collection.client';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { INoteEditor } from '../note-editor/i-note-editor';
import { MarkdownNoteComponent } from './markdown-note.component';

describe('MarkdownNoteComponent highlight shortcut', () => {
    it.each([true, false])('handles the shortcut with editing=%s', (isEditing) => {
        const component = new MarkdownNoteComponent(
            Mock.ofType<CollectionClient>().object,
            Mock.ofType<MatDialog>().object,
            Mock.ofType<SnackBarService>().object,
            Mock.ofType<Logger>().object,
        );
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

    describe('Markdown note links', () => {
        let component: MarkdownNoteComponent;
        let openLinkedNote: jest.Mock;
        let unavailable: jest.Mock;
        let showError: jest.Mock;
        let openDialog: jest.Mock;
        let getTargets: jest.Mock;
        let input: HTMLTextAreaElement;

        beforeEach(() => {
            openLinkedNote = jest.fn().mockResolvedValue(Operation.Success);
            unavailable = jest.fn();
            showError = jest.fn();
            openDialog = jest.fn();
            getTargets = jest.fn().mockResolvedValue({
                operation: Operation.Success,
                notes: [{ id: 'target', title: 'Target', notebookName: 'Notebook' }],
            });
            const client = Mock.ofType<CollectionClient>();
            client.setup((x) => x.openLinkedNoteAsync('target')).returns(openLinkedNote);
            client.setup((x) => x.getNoteLinkTargetsAsync()).returns(getTargets);
            const dialog = Mock.ofType<MatDialog>();
            dialog.setup((x) => x.open).returns(() => openDialog);
            const snackBar = Mock.ofType<SnackBarService>();
            snackBar.setup((x) => x.linkedNoteUnavailableAsync()).returns(unavailable);
            snackBar.setup((x) => x.oopsAnErrorOccurredAsync()).returns(showError);
            component = new MarkdownNoteComponent(client.object, dialog.object, snackBar.object, Mock.ofType<Logger>().object);
            const editor = Mock.ofType<INoteEditor>();
            editor.setup((x) => x.isEditing).returns(() => true);
            component.noteEditor = editor.object;
            input = document.createElement('textarea');
            input.value = 'Before selection after';
            input.setSelectionRange(7, 16);
            component.markdownInput = new ElementRef(input);
        });

        function click(href: string, type = 'click'): MouseEvent {
            const anchor = document.createElement('a');
            anchor.setAttribute('href', href);
            const child = document.createElement('strong');
            anchor.appendChild(child);
            const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: type === 'auxclick' ? 1 : 0 });
            child.dispatchEvent(event);
            return event;
        }

        it.each(['knowte://note/target', '#knowte-note/target'])('opens %s and prevents navigation', async (href) => {
            const event = click(href);
            await component.onPreviewClickAsync(event);
            expect(event.defaultPrevented).toBe(true);
            expect(openLinkedNote).toHaveBeenCalledTimes(1);
        });

        it('handles middle clicks without opening a browser window', async () => {
            const event = click('#knowte-note/target', 'auxclick');
            await component.onPreviewClickAsync(event);
            expect(event.defaultPrevented).toBe(true);
            expect(openLinkedNote).toHaveBeenCalledTimes(1);
        });

        it.each(['https://example.org', '#heading', 'mailto:hello@example.org'])('leaves %s alone', async (href) => {
            const event = click(href);
            await component.onPreviewClickAsync(event);
            expect(event.defaultPrevented).toBe(false);
            expect(openLinkedNote).not.toHaveBeenCalled();
        });

        it('reports invalid links without requesting a window', async () => {
            const event = click('#knowte-note/');
            await component.onPreviewClickAsync(event);
            expect(event.defaultPrevented).toBe(true);
            expect(unavailable).toHaveBeenCalled();
            expect(openLinkedNote).not.toHaveBeenCalled();
        });

        it('reports a missing or trashed target', async () => {
            openLinkedNote.mockResolvedValue(Operation.Blank);
            await component.onPreviewClickAsync(click('#knowte-note/target'));
            expect(unavailable).toHaveBeenCalled();
        });

        it.each([Operation.Error, Operation.Aborted])('reports opening failure %s', async (operation) => {
            openLinkedNote.mockResolvedValue(operation);
            await component.onPreviewClickAsync(click('#knowte-note/target'));
            expect(showError).toHaveBeenCalled();
        });

        it('inserts a picked link at the saved selection', async () => {
            openDialog.mockReturnValue({ afterClosed: () => of({ id: 'target', title: 'Target' }) });
            document.execCommand = jest.fn();
            await component.insertNoteLinkAsync();
            expect(openDialog).toHaveBeenCalled();
            expect(input.selectionStart).toBe(7);
            expect(input.selectionEnd).toBe(16);
            expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '[Target](knowte://note/target)');
        });

        it('does not insert anything when the picker is cancelled', async () => {
            openDialog.mockReturnValue({ afterClosed: () => of(undefined) });
            document.execCommand = jest.fn();
            await component.insertNoteLinkAsync();
            expect(document.execCommand).not.toHaveBeenCalled();
        });

        it('reports listing failures without showing an empty success-shaped picker', async () => {
            getTargets.mockResolvedValue({ operation: Operation.Error, notes: [] });
            await component.insertNoteLinkAsync();
            expect(showError).toHaveBeenCalled();
            expect(openDialog).not.toHaveBeenCalled();
        });
    });
});
