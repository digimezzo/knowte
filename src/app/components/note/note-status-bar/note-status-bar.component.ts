import { Component, Input } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { BaseSettings } from '../../../core/base-settings';
import { CollectionClient } from '../../../services/collection/collection.client';
import { SpellCheckService } from '../../../services/spell-check/spell-check.service';
import { SpellCheckBottomSheetComponent } from '../bottom-sheets/spell-check-bottom-sheet/spell-check-bottom-sheet.component';
import { TextSizeBottomSheetComponent } from '../bottom-sheets/text-size-bottom-sheet/text-size-bottom-sheet.component';

@Component({
    selector: 'app-note-status-bar',
    styleUrls: ['./note-status-bar.component.scss'],
    templateUrl: 'note-status-bar.component.html',
})
export class NoteStatusBarComponent {
    constructor(
        private collectionClient: CollectionClient,
        public spellCheckService: SpellCheckService,
        public settings: BaseSettings,
        private bottomSheet: MatBottomSheet
    ) {}

    @Input()
    public noteId: string;

    @Input()
    public isMarked: boolean;

    @Input()
    public isEncrypted: boolean;

    public openSpellCheckBottomSheet(): void {
        this.bottomSheet.open(SpellCheckBottomSheetComponent);
    }

    public openTextSizeBottomSheet(): void {
        this.bottomSheet.open(TextSizeBottomSheetComponent);
    }

    public openSearchBottomSheet(): void {
        const config: MatBottomSheetConfig = {
            hasBackdrop: false,
        };

        this.bottomSheet.open(TextSizeBottomSheetComponent, config);
    }

    public toggleNoteMark(): void {
        this.collectionClient.setNoteMark(this.noteId, !this.isMarked);
    }
}
