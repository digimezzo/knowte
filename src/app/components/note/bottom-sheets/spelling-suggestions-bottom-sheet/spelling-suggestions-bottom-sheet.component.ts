import { Component, NgZone } from '@angular/core';
import { BrowserWindow } from 'electron';
import { SpellCheckService } from '../../../../services/spell-check/spell-check.service';
import * as remote from '@electron/remote';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-spelling-suggestions-bottom-sheet',
    templateUrl: 'spelling-suggestions-bottom-sheet.component.html',
})
export class SpellingSuggestionsBottomSheetComponent {
    constructor(
        public spellCheckService: SpellCheckService,
        private bottomSheetRef: MatBottomSheetRef<SpellingSuggestionsBottomSheetComponent>
    ) {}

    public replaceMisspelling(dictionarySuggestion: string): void {
        this.bottomSheetRef.dismiss();

        if (this.spellCheckService.webContents !== null && this.spellCheckService.webContents !== undefined) {
            this.spellCheckService.quill.setSelection(this.spellCheckService.range.index, this.spellCheckService.range.length);
            this.spellCheckService.webContents.replaceMisspelling(dictionarySuggestion);
        }
    }
}
