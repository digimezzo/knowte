import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoteLinkTarget } from '../../../services/results/note-link-targets-result';
import { CollectionUtils } from '../../../common/utils/collection-utils';

@Component({
    selector: 'app-note-link-dialog',
    templateUrl: './note-link-dialog.component.html',
    styleUrls: ['./note-link-dialog.component.scss'],
})
export class NoteLinkDialogComponent {
    private _searchText: string = '';
    public filteredNotes: NoteLinkTarget[];

    constructor(@Inject(MAT_DIALOG_DATA) public notes: NoteLinkTarget[]) {
        this.filteredNotes = notes;
    }

    public get searchText(): string {
        return this._searchText;
    }

    public set searchText(value: string) {
        this._searchText = value;
        const query = value.trim();
        const words = query.split(/\s+/);
        this.filteredNotes = query
            ? this.notes.filter((note) => CollectionUtils.containsAll(`${note.title} ${note.notebookName}`, words))
            : this.notes;
    }

    public trackNote(_index: number, note: NoteLinkTarget): string {
        return note.id;
    }
}
