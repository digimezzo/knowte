import { Pipe, PipeTransform } from '@angular/core';
import DOMPurify from 'dompurify';

@Pipe({
    name: 'sanitizeMarkdown',
})
export class SanitizeMarkdownPipe implements PipeTransform {
    public constructor() {}

    public transform(value: string): string {
        return DOMPurify.sanitize(value, {
            ALLOWED_TAGS: [
                'p',
                'ul',
                'ol',
                'li',
                'strong',
                'em',
                'code',
                'pre',
                'blockquote',
                'a',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'input',
            ],
            ALLOWED_ATTR: ['href', 'title', 'type', 'checked', 'disabled'],
        });
    }
}
