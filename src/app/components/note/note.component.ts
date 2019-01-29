import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import log from 'electron-log';
import { CollectionService } from '../../services/collection.service';
import * as Quill from 'quill';
import { ActivatedRoute } from '@angular/router';
import { Note } from '../../data/note';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit {
    constructor(private collectionService: CollectionService, private activatedRoute: ActivatedRoute) {
    }

    public noteTitle: string;

    ngOnInit() {
        log.info("Note");
        this.collectionService.initializeDataStoreAsync();

        var quill = new Quill('#editor', {
            theme: 'snow'
        });

        // Get note id from url
        this.activatedRoute.queryParams.subscribe(params => {
            let noteId: string = params['id'];
            log.info(`Note id=${noteId}`);

            // Get the note from the data store
            let note: Note = this.collectionService.getNote(noteId);
            this.noteTitle = note.title;
        });
    }

    public performAction(): void {

    }
}
