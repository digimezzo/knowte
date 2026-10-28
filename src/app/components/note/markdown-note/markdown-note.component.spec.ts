import { Mock } from 'typemoq';
import { ElementRef, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { marked } from 'marked';
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
        // Load the same offline highlighter and language grammars as the application.
        const scripts: string[] = require('../../../../../angular.json').projects.knowte.architect.build.options.scripts;
        scripts.filter((script) => script.includes('/prismjs/')).forEach((script) => require(`../../../../../${script}`));

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
            imports: [FormsModule, MatMenuModule, NoopAnimationsModule, TranslateModule.forRoot(), MarkdownModule.forRoot({
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

    describe('code language picker', () => {
        let insertText: jest.Mock;
        const originalExecCommand = document.execCommand;

        beforeEach(() => {
            component.noteEditor = new Proxy(component.noteEditor, {
                set(target, property, value) {
                    if (property === 'content') {
                        content = value;
                        return true;
                    }
                    return Reflect.set(target, property, value);
                },
            });
            insertText = jest.fn((_command: string, _showUI: boolean, text: string) => {
                input.setRangeText(text, input.selectionStart, input.selectionEnd, 'end');
                input.dispatchEvent(new Event('input'));
                return true;
            });
            document.execCommand = insertText;
        });

        afterEach(() => {
            document.execCommand = originalExecCommand;
        });

        it('lists supported languages and inserts the chosen block from the menu', async () => {
            input.setSelectionRange(input.value.length, input.value.length);
            const button: HTMLButtonElement = fixture.nativeElement.querySelector('.markdown-code-language-button');
            expect(button.getAttribute('aria-label')).toBe('Notes.InsertCodeBlock');
            button.click();
            fixture.detectChanges();
            await fixture.whenStable();
            const items = Array.from(TestBed.inject(OverlayContainer).getContainerElement()
                .querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
            expect(items.map((item) => item.textContent.trim())).toEqual(
                component.codeLanguages.map((language) => `${language.name} (${language.code})`),
            );
            items.find((item) => item.textContent.includes('TypeScript')).click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(input.value).toBe('# Note\n\n```typescript\n\n```\n');
            expect(input.selectionStart).toBe('# Note\n\n```typescript\n'.length);
            expect(input.selectionEnd).toBe(input.selectionStart);
            expect(document.activeElement).toBe(input);
        });

        it.each([
            ['```', 0, 0, '```typescript'],
            ['```', 1, 1, '```typescript'],
            ['```', 3, 3, '```typescript'],
            ['```', 0, 3, '```typescript'],
            ['Before\n  ```  \nAfter', 12, 12, 'Before\n  ```typescript  \nAfter'],
            ['```\nconst answer = 42;\n```', 3, 3, '```typescript\nconst answer = 42;\n```'],
        ])('adds only the language on a bare fence line in %j', (source, start, end, expected) => {
            input.value = source;
            input.setSelectionRange(start, end);

            component.insertCodeBlock('typescript');

            expect(input.value).toBe(expected);
            expect(insertText).toHaveBeenCalledWith('insertText', false, 'typescript');
            expect(input.selectionStart).toBe(expected.indexOf('typescript') + 'typescript'.length);
            expect(input.selectionEnd).toBe(input.selectionStart);
            expect(document.activeElement).toBe(input);
        });

        it.each([
            ['', 0, 0, '```typescript\n\n```\n', ''],
            ['before after', 7, 7, 'before \n\n```typescript\n\n```\n\nafter', ''],
            ['const answer = 42;', 0, 18, '```typescript\nconst answer = 42;\n```\n', 'const answer = 42;'],
            ['first\nsecond\n', 0, 13, '```typescript\nfirst\nsecond\n```\n', 'first\nsecond\n'],
            ['```js\nhello\n```', 0, 15, '````typescript\n```js\nhello\n```\n````\n', '```js\nhello\n```'],
        ])('inserts a fenced block for %j and preserves its selection', (source, start, end, expected, selected) => {
            input.value = source;
            input.setSelectionRange(start, end);

            component.insertCodeBlock('typescript');

            expect(input.value).toBe(expected);
            expect(input.value.substring(input.selectionStart, input.selectionEnd)).toBe(selected);
            expect(insertText).toHaveBeenCalledWith('insertText', false, expect.any(String));
            expect(marked.lexer(expected).filter((token) => token.type === 'code')).toHaveLength(1);
        });

        it.each([
            'bash', 'batch', 'c', 'cpp', 'csharp', 'css', 'go', 'html', 'java', 'javascript',
            'json', 'markdown', 'python', 'rust', 'sql', 'typescript', 'vbnet', 'xml', 'yaml',
        ])('inserts highlightable %s code', async (language) => {
            input.value = '';
            input.setSelectionRange(0, 0);

            component.insertCodeBlock(language);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(input.value).toBe(`\`\`\`${language}\n\n\`\`\`\n`);
            expect(preview.querySelector(`pre code.language-${language}`)).not.toBeNull();
        });

        it('does not insert in reading mode', () => {
            isEditing = false;
            component.insertCodeBlock('typescript');
            expect(insertText).not.toHaveBeenCalled();
        });

        it.each(['unsupported', 'failed', 'throws'])('reports %s insertion errors', (failure) => {
            if (failure === 'failed') {
                insertText.mockReturnValue(false);
            } else if (failure === 'throws') {
                insertText.mockImplementation(() => { throw new Error('Insertion failed'); });
            }

            component.insertCodeBlock(failure === 'unsupported' ? 'unknown-language' : 'typescript');

            expect(TestBed.inject(Logger).error).toHaveBeenCalledWith(
                expect.stringContaining('Could not insert code block.'), 'MarkdownNoteComponent', 'insertCodeBlock',
            );
            expect(TestBed.inject(SnackBarService).oopsAnErrorOccurredAsync).toHaveBeenCalled();
        });
    });

    it.each([
        ['html', '<div class="note">Hello</div>'],
        ['xml', '<note>Hello</note>'],
        ['css', '.note { color: red; }'],
        ['javascript', 'const answer = 42;'],
        ['js', 'const answer = 42;'],
        ['typescript', 'const answer: number = 42;'],
        ['ts', 'const answer: number = 42;'],
        ['vbnet', '\' A VB.NET example\nDim answer As Integer = 42\nConsole.WriteLine("Hello")'],
        ['bash', 'echo "Hello"'],
        ['batch', '@echo off\nREM A Windows command script\nset NAME=Knowte\necho "Hello %NAME%"'],
        ['sh', 'echo "Hello"'],
        ['c', 'int answer = 42;'],
        ['cpp', 'int answer = 42;'],
        ['csharp', 'public class Note {}'],
        ['cs', 'public class Note {}'],
        ['go', 'package main'],
        ['java', 'public class Note {}'],
        ['json', '{"answer": 42}'],
        ['markdown', '# Title'],
        ['md', '# Title'],
        ['python', 'def answer(): return 42'],
        ['py', 'def answer(): return 42'],
        ['rust', 'let answer = 42;'],
        ['sql', 'SELECT * FROM notes;'],
        ['yaml', 'answer: 42'],
        ['yml', 'answer: 42'],
    ])('highlights %s fenced code in the preview without changing the source', async (language, code) => {
        content = `\`\`\`${language}\n${code}\n\`\`\``;
        fixture.detectChanges();
        await fixture.whenStable();
        flushLayout();

        const renderedCode = preview.querySelector('pre code');
        expect(renderedCode.querySelector('.token')).not.toBeNull();
        expect(renderedCode.textContent).toBe(code + '\n');
        expect(input.value).toBe(content);
        expect(TestBed.inject(Logger).error).not.toHaveBeenCalled();
    });

    it.each(['', 'text', 'unsupported-language'])('keeps %s code blocks readable without highlighting', async (language) => {
        const code = '<script>alert("test")</script> & const answer = 42;';
        content = `\`\`\`${language}\n${code}\n\`\`\``;
        fixture.detectChanges();
        await fixture.whenStable();
        flushLayout();

        const renderedCode = preview.querySelector('pre code');
        expect(renderedCode.textContent).toBe(code + '\n');
        expect(renderedCode.querySelector('.token')).toBeNull();
        expect(preview.querySelector('script')).toBeNull();
        expect(TestBed.inject(Logger).error).not.toHaveBeenCalled();
    });

    it('updates highlighting after editing and keeps inline code unhighlighted', async () => {
        content = '```js\nconst answer = 42;\n```\n\n`const plain = true;`';
        fixture.detectChanges();
        await fixture.whenStable();
        expect(preview.querySelector('pre code .token.keyword')?.textContent).toBe('const');
        expect(preview.querySelector('p code .token')).toBeNull();

        content = '```python\ndef answer(): return 42\n```';
        fixture.detectChanges();
        await fixture.whenStable();
        flushLayout();

        expect(preview.querySelector('pre code .token.keyword')?.textContent).toBe('def');
        expect(preview.querySelector('pre code').textContent).toBe('def answer(): return 42\n');
        expect(TestBed.inject(Logger).error).not.toHaveBeenCalled();
    });

    it('preserves escaped code and sanitization when highlighting', async () => {
        const code = '<img src=x onerror="alert(1)"><script>alert("test")</script>';
        content = `\`\`\`html\n${code}\n\`\`\`\n\n<img src=x onerror="alert(2)">`;
        fixture.detectChanges();
        await fixture.whenStable();

        expect(preview.querySelector('pre code .token.tag')).not.toBeNull();
        expect(preview.querySelector('pre code').textContent).toBe(code + '\n');
        expect(preview.querySelector('pre img, script, [onerror]')).toBeNull();
        expect(preview.querySelector('img')?.getAttribute('src')).toBe('x');
    });

    it('starts enabled and toggles through an accessible button, aligning from the editor on re-enable', () => {
        fixture.detectChanges();
        expect(toggleButton().getAttribute('aria-pressed')).toBe('true');
        expect(toggleButton().getAttribute('aria-label')).toBe('Notes.SyncScrolling');
        expect(toggleButton().classList.contains('markdown-scroll-sync-button')).toBe(true);
        scroll(input, 100);
        expect(preview.scrollTop).toBe(200);
        toggleButton().click();
        fixture.detectChanges();
        expect(toggleButton().getAttribute('aria-pressed')).toBe('false');
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

    it('keeps panes independent when disabled while still synchronizing syntax highlighting', () => {
        component.toggleScrollSync();
        input.scrollLeft = 40;
        scroll(input, 250);
        expect(preview.scrollTop).toBe(0);
        expect(highlight.scrollTop).toBe(250);
        expect(highlight.scrollLeft).toBe(40);
        scroll(preview, 1000);
        expect(input.scrollTop).toBe(250);
    });

    it.each([0, 250, 500, 1000])('routes editor position %s through the source map', (position) => {
        flushLayout();
        scroll(input, position);
        expect(preview.scrollTop).toBe(position * 2);
        expect(highlight.scrollTop).toBe(position);
    });

    it.each([0, 500, 1000, 2000])('routes preview position %s through the reverse source map', (position) => {
        flushLayout();
        scroll(preview, position);
        expect(input.scrollTop).toBe(position / 2);
        expect(highlight.scrollTop).toBe(position / 2);
    });

    it('does not synchronize horizontal scrolling between panes', () => {
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
        flushLayout();
        scroll(input, 0);
        expect(preview.scrollTop).toBe(0);
        scroll(preview, 1000);
        expect(input.scrollTop).toBe(0);
    });

    it.each([0, 100])('handles a non-scrollable preview with scrollHeight=%s', (height) => {
        setDimensions(preview, height, 100);
        flushLayout();
        scroll(input, 500);
        expect(preview.scrollTop).toBe(0);
        scroll(preview, 0);
        expect(input.scrollTop).toBe(500);
    });

    it('hides the button and leaves the hidden editor alone in preview-only mode', () => {
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
        component.toggleScrollSync();
        mappingPosition.mockClear();
        scroll(input, 250);
        resizeCallback([], Mock.ofType<ResizeObserver>().object);
        flushLayout();
        expect(preview.scrollTop).toBe(0);
        expect(mappingPosition).not.toHaveBeenCalled();
    });

    it('disables synchronization and reports mapping failures instead of scrolling to unrelated text', () => {
        mappingPosition.mockClear();
        jest.spyOn(MarkdownScrollMap.prototype, 'update').mockImplementation(() => {
            throw new Error('Mismatched preview');
        });
        component.onPreviewReady();
        flushLayout();
        expect(component.isScrollSyncEnabled).toBe(false);
        expect(TestBed.inject(Logger).error).toHaveBeenCalledWith(
            expect.stringContaining('Mismatched preview'), 'MarkdownNoteComponent', 'synchronizeScroll',
        );
        expect(TestBed.inject(SnackBarService).oopsAnErrorOccurredAsync).toHaveBeenCalled();
        expect(mappingPosition).not.toHaveBeenCalled();
    });

    it('does not treat preview scroll adjustments during an edit as user-driven scrolling', () => {
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
    describe('editor heading colors', () => {
        let component: MarkdownNoteComponent;

        beforeEach(() => {
            component = new MarkdownNoteComponent(
                Mock.ofType<CollectionClient>().object,
                Mock.ofType<MatDialog>().object,
                Mock.ofType<SnackBarService>().object,
                Mock.ofType<Logger>().object,
                Mock.ofType<MarkdownService>().object,
                Mock.ofType<DomSanitizer>().object,
            );
        });

        it.each([
            '```\n# Code title\n## Code subtitle\n### Code section\n```',
            '```markdown\n# Code title\n```',
            '~~~markdown\n# Code title\n~~~',
            '````\n```\n# Still code\n````',
            '```\n~~~\n# Still code\n```',
            '```\n``` not a closing fence\n# Still code\n```',
            '   ```\n# Code title\n   ```',
            '```\r\n# Code title\r\n```',
            '```\n# Unclosed code block',
            '    # Indented code\n\t## More indented code',
        ])('leaves headings inside code uncolored: %s', (source) => {
            expect(component.highlightMarkdown(source)).not.toContain('md-title-');
        });

        it('resumes heading colors after the closing fence and preserves all source text', () => {
            const source = '# Before\n\n```md\n## Code\n```\n\n### After\n';
            const highlighted = component.highlightMarkdown(source);
            expect(highlighted).toContain('<span class="md-title-1"># Before</span>');
            expect(highlighted).toContain('\n## Code\n');
            expect(highlighted).toContain('<span class="md-title-3">### After</span>');
            expect(highlighted.replace(/<\/?span[^>]*>/g, '')).toBe(source + ' ');
        });

        it('accepts longer closing fences', () => {
            expect(component.highlightMarkdown('~~~\n# Code\n~~~~\n# Title')).toContain(
                '<span class="md-title-1"># Title</span>',
            );
        });

        it('keeps escaping HTML in and outside code blocks', () => {
            const highlighted = component.highlightMarkdown('# <b>&</b>\n```\n<script>alert(1)</script>\n```');
            expect(highlighted).toContain('<span class="md-title-1"># &lt;b&gt;&amp;&lt;/b&gt;</span>');
            expect(highlighted).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
            expect(highlighted).not.toContain('<script>');
        });

        it('does not treat backticks in a backtick fence info string as a code block', () => {
            expect(component.highlightMarkdown('```invalid`info\n# Title')).toContain(
                '<span class="md-title-1"># Title</span>',
            );
        });
    });

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
            showError = jest.fn().mockResolvedValue(undefined);
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
