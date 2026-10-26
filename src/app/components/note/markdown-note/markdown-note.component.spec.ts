import { Mock } from 'typemoq';
import { ElementRef, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MarkedOptions, MarkdownModule, MarkdownService } from 'ngx-markdown';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Operation } from '../../../common/enums/operation';
import { Logger } from '../../../common/logging/logger';
import { CollectionClient } from '../../../services/collection/collection.client';
import { SnackBarService } from '../../../services/snack-bar/snack-bar.service';
import { INoteEditor } from '../note-editor/i-note-editor';
import { MarkdownNoteComponent } from './markdown-note.component';
import { MarkdownScrollMap } from './markdown-scroll-map';

@Pipe({ name: 'fixImagePaths' })
class FixImagePathsStubPipe implements PipeTransform {
    public transform(value: string): string {
        return value;
    }
}

describe('MarkdownNoteComponent synchronized scrolling', () => {
    let fixture: ComponentFixture<MarkdownNoteComponent>;
    let component: MarkdownNoteComponent;
    let input: HTMLTextAreaElement;
    let preview: HTMLElement;
    let highlight: HTMLPreElement;
    let isEditing: boolean;
    let layoutCallback: FrameRequestCallback | undefined;
    let resizeCallback: ResizeObserverCallback;
    let disconnect: jest.Mock;
    let content: string;
    let mappingPosition: jest.SpyInstance;
    const originalResizeObserver = window.ResizeObserver;

    beforeAll(() => {
        window.ResizeObserver = class implements ResizeObserver {
            public constructor(callback: ResizeObserverCallback) {
                resizeCallback = callback;
            }
            public observe = jest.fn();
            public unobserve = jest.fn();
            public disconnect = () => disconnect();
        };
    });

    afterAll(() => {
        window.ResizeObserver = originalResizeObserver;
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MarkdownNoteComponent, FixImagePathsStubPipe],
            imports: [FormsModule, TranslateModule.forRoot(), MarkdownModule.forRoot({
                markedOptions: { provide: MarkedOptions, useValue: { headerIds: false, mangle: false } },
            })],
            providers: [
                { provide: CollectionClient, useValue: Mock.ofType<CollectionClient>().object },
                { provide: MatDialog, useValue: Mock.ofType<MatDialog>().object },
                { provide: SnackBarService, useValue: { oopsAnErrorOccurredAsync: jest.fn().mockResolvedValue(undefined) } },
                { provide: Logger, useValue: { error: jest.fn() } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MarkdownNoteComponent);
        disconnect = jest.fn();
        layoutCallback = undefined;
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            layoutCallback = callback;
            return 1;
        });
        jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { layoutCallback = undefined; });
        // Component tests exercise event routing; layout accuracy is tested separately with measured anchors.
        mappingPosition = jest.spyOn(MarkdownScrollMap.prototype, 'position').mockImplementation(
            (position, fromEditor) => fromEditor ? position * 2 : position / 2,
        );
        component = fixture.componentInstance;
        const editor = Mock.ofType<INoteEditor>();
        isEditing = true;
        editor.setup((x) => x.isEditing).returns(() => isEditing);
        content = '# Note';
        editor.setup((x) => x.content).returns(() => content);
        component.noteEditor = editor.object;
        fixture.detectChanges();
        await fixture.whenStable();
        input = component.markdownInput.nativeElement;
        preview = component.markdownOutput.nativeElement;
        highlight = component.highlightedContent.nativeElement;
        setDimensions(input, 1100, 100);
        setDimensions(preview, 2100, 100);
        flushLayout();
    });

    afterEach(() => {
        fixture.destroy();
        jest.restoreAllMocks();
    });

    function flushLayout(): void {
        const callback = layoutCallback;
        layoutCallback = undefined;
        callback?.(0);
    }

    function setDimensions(element: HTMLElement, scrollHeight: number, clientHeight: number): void {
        Object.defineProperties(element, {
            scrollHeight: { configurable: true, value: scrollHeight },
            clientHeight: { configurable: true, value: clientHeight },
        });
    }

    function scroll(element: HTMLElement, top: number): void {
        element.scrollTop = top;
        element.dispatchEvent(new Event('scroll'));
    }

    function toggleButton(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('button[aria-pressed]');
    }

    it('starts disabled and toggles through an accessible button, aligning from the editor on enable', () => {
        expect(toggleButton().getAttribute('aria-pressed')).toBe('false');
        expect(toggleButton().getAttribute('aria-label')).toBe('Notes.SyncScrolling');
        expect(toggleButton().classList.contains('markdown-scroll-sync-button')).toBe(true);
        input.scrollTop = 250;

        toggleButton().click();
        flushLayout();
        fixture.detectChanges();

        expect(preview.scrollTop).toBe(500);
        expect(toggleButton().getAttribute('aria-pressed')).toBe('true');

        toggleButton().click();
        fixture.detectChanges();

        expect(toggleButton().getAttribute('aria-pressed')).toBe('false');
        scroll(input, 750);
        expect(preview.scrollTop).toBe(500);
        scroll(preview, 1200);
        expect(input.scrollTop).toBe(750);
    });

    it('keeps panes independent by default while still synchronizing syntax highlighting', () => {
        input.scrollLeft = 40;
        scroll(input, 250);
        expect(preview.scrollTop).toBe(0);
        expect(highlight.scrollTop).toBe(250);
        expect(highlight.scrollLeft).toBe(40);
        scroll(preview, 1000);
        expect(input.scrollTop).toBe(250);
    });

    it.each([0, 250, 500, 1000])('routes editor position %s through the source map', (position) => {
        component.toggleScrollSync();
        flushLayout();
        scroll(input, position);
        expect(preview.scrollTop).toBe(position * 2);
        expect(highlight.scrollTop).toBe(position);
    });

    it.each([0, 500, 1000, 2000])('routes preview position %s through the reverse source map', (position) => {
        component.toggleScrollSync();
        flushLayout();
        scroll(preview, position);
        expect(input.scrollTop).toBe(position / 2);
        expect(highlight.scrollTop).toBe(position / 2);
    });

    it('does not synchronize horizontal scrolling between panes', () => {
        component.toggleScrollSync();
        flushLayout();
        preview.scrollLeft = 12;
        input.scrollLeft = 40;
        scroll(input, 250);
        expect(preview.scrollLeft).toBe(12);
        scroll(preview, 1000);
        expect(input.scrollLeft).toBe(40);
        expect(highlight.scrollLeft).toBe(40);
    });

    it('ignores programmatic scroll feedback, including rounding, without blocking subsequent user scrolling', () => {
        component.toggleScrollSync();
        flushLayout();
        scroll(input, 333.3);
        scroll(preview, preview.scrollTop + 0.2);
        expect(input.scrollTop).toBe(333.3);
        scroll(preview, 1000);
        expect(input.scrollTop).toBe(500);
        input.dispatchEvent(new Event('scroll'));
        expect(preview.scrollTop).toBe(1000);
    });

    it.each([0, 100])('handles a non-scrollable editor with scrollHeight=%s', (height) => {
        setDimensions(input, height, 100);
        component.toggleScrollSync();
        flushLayout();
        scroll(input, 0);
        expect(preview.scrollTop).toBe(0);
        scroll(preview, 1000);
        expect(input.scrollTop).toBe(0);
    });

    it.each([0, 100])('handles a non-scrollable preview with scrollHeight=%s', (height) => {
        setDimensions(preview, height, 100);
        component.toggleScrollSync();
        flushLayout();
        scroll(input, 500);
        expect(preview.scrollTop).toBe(0);
        scroll(preview, 0);
        expect(input.scrollTop).toBe(500);
    });

    it('hides the button and leaves the hidden editor alone in preview-only mode', () => {
        component.toggleScrollSync();
        flushLayout();
        isEditing = false;
        fixture.detectChanges();
        expect(toggleButton()).toBeNull();
        scroll(preview, 1000);
        expect(input.scrollTop).toBe(0);
        isEditing = true;
        fixture.detectChanges();
        expect(toggleButton().getAttribute('aria-pressed')).toBe('true');
        scroll(preview, 1500);
        expect(input.scrollTop).toBe(750);
    });

    it('rebuilds source blocks after editing and realigns after images load', () => {
        const update = jest.spyOn(MarkdownScrollMap.prototype, 'update');
        component.toggleScrollSync();
        flushLayout();
        content = '# Changed\n\nParagraph';
        fixture.detectChanges();
        component.onPreviewReady();
        flushLayout();
        expect(update).toHaveBeenLastCalledWith(content);
        scroll(input, 250);
        mappingPosition.mockClear();
        preview.querySelector('p').dispatchEvent(new Event('load'));
        flushLayout();
        expect(mappingPosition).toHaveBeenCalledWith(250, true);
    });

    it('preserves the preview as the active pane when resizing or changing zoom', async () => {
        component.toggleScrollSync();
        flushLayout();
        scroll(preview, 1000);
        mappingPosition.mockClear();
        resizeCallback([], Mock.ofType<ResizeObserver>().object);
        flushLayout();
        expect(mappingPosition).toHaveBeenLastCalledWith(1000, false);
        mappingPosition.mockClear();
        input.style.fontSize = '20px';
        await Promise.resolve();
        flushLayout();
        expect(mappingPosition).toHaveBeenLastCalledWith(1000, false);
    });

    it('does not move either pane on layout changes while synchronization is disabled', () => {
        scroll(input, 250);
        resizeCallback([], Mock.ofType<ResizeObserver>().object);
        flushLayout();
        expect(preview.scrollTop).toBe(0);
        expect(mappingPosition).not.toHaveBeenCalled();
    });

    it('disables synchronization and reports mapping failures instead of scrolling to unrelated text', () => {
        jest.spyOn(MarkdownScrollMap.prototype, 'update').mockImplementation(() => {
            throw new Error('Mismatched preview');
        });
        component.toggleScrollSync();
        flushLayout();
        expect(component.isScrollSyncEnabled).toBe(false);
        expect(TestBed.inject(Logger).error).toHaveBeenCalledWith(
            expect.stringContaining('Mismatched preview'), 'MarkdownNoteComponent', 'synchronizeScroll',
        );
        expect(TestBed.inject(SnackBarService).oopsAnErrorOccurredAsync).toHaveBeenCalled();
        expect(mappingPosition).not.toHaveBeenCalled();
    });

    it('does not treat preview scroll adjustments during an edit as user-driven scrolling', () => {
        component.toggleScrollSync();
        flushLayout();
        scroll(preview, 1000);
        component.onEditorContentChange();
        scroll(preview, 900);
        mappingPosition.mockClear();
        component.onPreviewReady();
        flushLayout();
        expect(mappingPosition).toHaveBeenCalledWith(500, true);
    });

    it('disconnects layout observers and removes the measurement mirror on destruction', () => {
        expect(fixture.nativeElement.querySelector('.markdown-scroll-measurement')).not.toBeNull();
        component.ngOnDestroy();
        expect(disconnect).toHaveBeenCalled();
        expect(fixture.nativeElement.querySelector('.markdown-scroll-measurement')).toBeNull();
    });
});

describe('MarkdownNoteComponent highlight shortcut', () => {
    it.each([true, false])('handles the shortcut with editing=%s', (isEditing) => {
        const component = new MarkdownNoteComponent(
            Mock.ofType<CollectionClient>().object,
            Mock.ofType<MatDialog>().object,
            Mock.ofType<SnackBarService>().object,
            Mock.ofType<Logger>().object,
            Mock.ofType<MarkdownService>().object,
            Mock.ofType<DomSanitizer>().object,
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
            component = new MarkdownNoteComponent(client.object, dialog.object, snackBar.object, Mock.ofType<Logger>().object,
                Mock.ofType<MarkdownService>().object, Mock.ofType<DomSanitizer>().object);
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
