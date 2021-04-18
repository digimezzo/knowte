import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { Note } from '../../data/entities/note';
import { CollectionService } from '../../services/collection/collection.service';
import { TrashService } from '../../services/trash/trash.service';

@Component({
    selector: 'app-trash',
    templateUrl: './trash.component.html',
    styleUrls: ['./trash.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TrashComponent implements OnInit, OnDestroy {
    private subscription: Subscription = new Subscription();

    constructor(public collection: CollectionService, public trash: TrashService) {}

    public activeCollection: string = '';
    public trashedNotes: Note[] = [];

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public ngOnInit(): void {
        this.subscription.add(
            this.trash.openTrashRequested$.subscribe(() => {
                this.activeCollection = this.collection.getActiveCollection();
                this.trashedNotes = this.collection.getTrashedNotes();
            })
        );
    }
}
