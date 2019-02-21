import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit, OnDestroy {
    constructor() {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    public toggleNoteMark(): void {

    }

    public onNotetitleChange(newNoteTitle: string) {
     
    }
}
