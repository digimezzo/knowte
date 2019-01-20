import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import log from 'electron-log';
import { CollectionService } from '../../services/collection.service';
import * as Quill from 'quill';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit {
    constructor(private collectionService: CollectionService) {
    }

    ngOnInit() {
        log.info("Note");
        this.collectionService.initializeDataStoreAsync();

        var quill = new Quill('#editor', {
            theme: 'snow'
        });
    }

    public performAction(): void {

    }
}
