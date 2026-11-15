import { TestBed } from '@angular/core/testing';
import { MARKED_OPTIONS, MarkdownModule, MarkdownService } from 'ngx-markdown';
import { MarkedOptionsFactory } from './markdown-options';

describe('Markdown preview options', () => {
    let service: MarkdownService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                MarkdownModule.forRoot({
                    markedOptions: { provide: MARKED_OPTIONS, useFactory: MarkedOptionsFactory },
                }),
            ],
        });
        service = TestBed.inject(MarkdownService);
    });

    async function render(source: string): Promise<HTMLElement> {
        const container = document.createElement('div');
        container.innerHTML = await service.parse(source, { disableSanitizer: true });
        return container;
    }

    it('renders formatted internal and external links on repeated parses', async () => {
        for (let i = 0; i < 2; i++) {
            const html = await render('[**Note**](knowte://note/AbC_123) and [==web==](https://example.org)');
            const links = html.querySelectorAll('a');
            expect(links[0].getAttribute('href')).toBe('#knowte-note/AbC_123');
            expect(links[0].querySelector('strong').textContent).toBe('Note');
            expect(links[1].getAttribute('href')).toBe('https://example.org');
            expect(links[1].querySelector('mark').textContent).toBe('web');
        }
    });

    it('renders nested and task lists with formatted content', async () => {
        const html = await render('- [x] **done**\n- [ ] pending\n  - [link](https://example.org)');
        const items = html.querySelectorAll('li');
        expect(items).toHaveLength(3);
        expect(items[0].querySelector('.task-list-checkbox-checked')).not.toBeNull();
        expect(items[0].querySelector('strong').textContent).toBe('done');
        expect(items[1].querySelector('.task-list-checkbox')).not.toBeNull();
        expect(items[2].querySelector('a').getAttribute('href')).toBe('https://example.org');
        expect(html.querySelector('input')).toBeNull();
    });

    it('renders links and task lists through the default sanitized preview', async () => {
        const container = document.createElement('div');
        container.innerHTML = await service.parse('- [x] [**Note**](knowte://note/AbC_123)');
        expect(container.querySelector('a').getAttribute('href')).toBe('#knowte-note/AbC_123');
        expect(container.querySelector('strong').textContent).toBe('Note');
        expect(container.querySelector('.task-list-checkbox-checked')).not.toBeNull();
    });

    it('preserves ordinary code and escapes Mermaid source', async () => {
        const html = await render('```js\nconst a = 1;\n```\n\n```mermaid\na-->b & <c>\n```');
        expect(html.querySelector('pre code').className).toBe('language-js');
        expect(html.querySelector('pre code').textContent).toContain('const a = 1;');
        expect(html.querySelector('pre.mermaid').textContent).toBe('a-->b & <c>');
        expect(html.querySelector('pre.mermaid').querySelector('c')).toBeNull();
    });
});
