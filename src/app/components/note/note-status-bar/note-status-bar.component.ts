import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BaseSettings } from '../../../core/base-settings';
import { SpellCheckService } from '../../../services/spell-check/spell-check.service';
import { SpellCheckBottomSheetComponent } from '../bottom-sheets/spell-check-bottom-sheet/spell-check-bottom-sheet.component';
import { TextSizeBottomSheetComponent } from '../bottom-sheets/text-size-bottom-sheet/text-size-bottom-sheet.component';

@Component({
    selector: 'app-note-status-bar',
    styleUrls: ['./note-status-bar.component.scss'],
    templateUrl: 'note-status-bar.component.html',
})
export class NoteStatusBarComponent {
    constructor(public spellCheckService: SpellCheckService, public settings: BaseSettings, private bottomSheet: MatBottomSheet) {}

    @Input()
    public isMarked: boolean;

    public openTextSizeBottomSheet(): void {
        this.bottomSheet.open(TextSizeBottomSheetComponent);
    }

    public openSpellCheckBottomSheet(): void {
        this.bottomSheet.open(SpellCheckBottomSheetComponent);
    }
}