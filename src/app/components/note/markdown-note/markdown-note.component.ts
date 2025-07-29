import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {INoteEditor} from '../note-editor/i-note-editor';

@Component({
    selector: 'app-markdown-note',
    templateUrl: './markdown-note.component.html',
    styleUrls: ['./markdown-note.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MarkdownNoteComponent implements OnInit {
    private inputEl: HTMLTextAreaElement;
    private highlightEl: HTMLElement;
    private outputEl: HTMLElement;
    
    @Input()
    public noteEditor: INoteEditor;

    public ngOnInit(): void {
        this.inputEl = document.querySelector('[data-el="input"]') as HTMLTextAreaElement;
        this.highlightEl = document.querySelector('[data-el="highlight"]') as HTMLElement;
        this.outputEl = document.querySelector('[data-el="output"]') as HTMLElement;

        document.addEventListener("DOMContentLoaded", this.init.bind(this));
    }
    
    public toggleIsEditing(): void {
        this.noteEditor.isEditing = !this.noteEditor.isEditing;
    }

    public highlightMarkdown(text: string): string {
        if (!text) {
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

    private resizeTextarea(textArea: HTMLTextAreaElement): void {
        if (!textArea) {
            return;
        }

        window.requestAnimationFrame(() => {
            textArea.style.height = '0';
            if (textArea.scrollHeight > 0) {
                textArea.style.height = `${textArea.scrollHeight + 2}px`;
            }
        });
    }

    private highlight(): void {
        window.requestAnimationFrame(() => {
            const highlighted = this.highlightMarkdown(this.inputEl.value);
            this.highlightEl.innerHTML = highlighted;
        });
    }

    // private updateReadonly(): void {
    //     window.requestAnimationFrame(() => {
    //         const htmlContent = this.converter.makeHtml(this.inputEl.value);
    //         this.outputEl.innerHTML = htmlContent;
    //     });
    // }

    private init(): void {
        this.inputEl.addEventListener("input", () => {
            this.resizeTextarea(this.inputEl);
            this.highlight();
            // this.updateReadonly();
        });

        this.inputEl.setAttribute('data-initialized', 'true');
        this.resizeTextarea(this.inputEl);
        this.highlight();
        // this.updateReadonly();
    }
}
