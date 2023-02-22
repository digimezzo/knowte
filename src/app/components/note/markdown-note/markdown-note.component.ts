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
}
