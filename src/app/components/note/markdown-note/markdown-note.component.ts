import { Component, Input, ViewEncapsulation } from '@angular/core';
import { INoteEditor } from '../note-editor/i-note-editor';

@Component({
    selector: 'app-markdown-note',
    templateUrl: './markdown-note.component.html',
    styleUrls: ['./markdown-note.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MarkdownNoteComponent {
    @Input()
    public noteEditor: INoteEditor;

    public toggleIsEditing(): void {
        this.noteEditor.isEditing = !this.noteEditor.isEditing;
    }

    highlightMarkdown(text: string): string {
        if(!text) {
            return '';
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
