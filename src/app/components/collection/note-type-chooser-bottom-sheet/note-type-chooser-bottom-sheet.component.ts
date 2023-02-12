import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { NoteCreator } from '../note-creator';

@Component({
    selector: 'app-note-type-chooser-bottom-sheet',
    templateUrl: 'note-type-chooser-bottom-sheet.component.html',
    styleUrls: ['./note-type-chooser-bottom-sheet.component.scss'],
})
export class NoteTypeChooserBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
        private noteCreator: NoteCreator,
        private bottomSheetRef: MatBottomSheetRef<NoteTypeChooserBottomSheetComponent>
    ) {}

    public async addClassicNoteAsync(): Promise<void> {
        await this.noteCreator.createClassicNoteAsync(this.data.activeNotebookId);
        this.bottomSheetRef.dismiss();
    }

    public async addMarkdownNoteAsync(): Promise<void> {
        await this.noteCreator.createMarkdownNoteAsync(this.data.activeNotebookId);
        this.bottomSheetRef.dismiss();
    }
}
