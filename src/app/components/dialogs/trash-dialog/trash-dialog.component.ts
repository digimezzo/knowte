import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Note } from '../../../data/entities/note';
import { CollectionService } from '../../../services/collection/collection.service';

@Component({
    selector: 'app-trash-dialog',
    templateUrl: './trash-dialog.component.html',
    styleUrls: ['./trash-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TrashDialogComponent implements OnInit {
    constructor(public collection: CollectionService) {}

    public activeCollection: string = '';
    public trashedNotes: Note[] = [];

    public ngOnInit(): void {
        this.activeCollection = this.collection.getActiveCollection();
        this.trashedNotes = this.collection.getTrashedNotes();
    }
}
