import {AfterViewInit, Component, ElementRef, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import { INoteEditor } from '../note-editor/i-note-editor';

@Component({
    selector: 'app-markdown-note',
    templateUrl: './markdown-note.component.html',
    styleUrls: ['./markdown-note.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MarkdownNoteComponent implements AfterViewInit {
    @ViewChild('highlightedContent') highlightedContent: ElementRef<HTMLPreElement>;
    @ViewChild('markdownInput') markdownInput: ElementRef<HTMLTextAreaElement>;
    
    @Input()
    public noteEditor: INoteEditor;

    public ngAfterViewInit() {
        const input = this.markdownInput.nativeElement;
        const pre = this.highlightedContent.nativeElement;

        input.addEventListener('scroll', () => {
            pre.scrollTop = input.scrollTop;
            pre.scrollLeft = input.scrollLeft;
        });
    }

    public onContentChange() {
        const input = this.markdownInput.nativeElement;
        const pre = this.highlightedContent.nativeElement;

        // Ensure pre scrolls to match textarea after content change
        pre.scrollTop = input.scrollTop;
        pre.scrollLeft = input.scrollLeft;
    }

    public toggleIsEditing(): void {
        this.noteEditor.isEditing = !this.noteEditor.isEditing;
    }

    public highlightMarkdown(text: string): string {
        if(!text) {
            return '';
        }

        // Handle final newlines (See: https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/)
        if(text[text.length-1] == "\n") { // If the last character is a newline character
            text += " "; // Add a placeholder space character to the final line 
        }
        
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const highlighted = escaped
            .replace(/^### (.*)$/gm, '<span class="md-title-3">### $1</span>')
            .replace(/^## (.*)$/gm, '<span class="md-title-2">## $1</span>')
            .replace(/^# (.*)$/gm, '<span class="md-title-1"># $1</span>');

        return highlighted;
    }
}
