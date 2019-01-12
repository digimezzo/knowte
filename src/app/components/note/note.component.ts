import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import log from 'electron-log';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
        log.info("Opening note");
    }

    public performAction(): void {

    }
}
