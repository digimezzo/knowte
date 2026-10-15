import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

export type NoteAction = 'search' | 'tags' | 'share' | 'pin' | 'mark' | 'encrypt' | 'decrypt' | 'delete';

export interface NoteActionsData {
    isPinned: boolean;
    isMarked: boolean;
    isEncrypted: boolean;
    isTrashed: boolean;
}

@Component({
    selector: 'app-actions-bottom-sheet',
    templateUrl: './actions-bottom-sheet.component.html',
    styleUrls: ['./actions-bottom-sheet.component.scss'],
})
export class ActionsBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: NoteActionsData,
        private bottomSheetRef: MatBottomSheetRef<ActionsBottomSheetComponent, NoteAction>,
    ) {}

    public choose(action: NoteAction): void {
        this.bottomSheetRef.dismiss(action);
    }
}
