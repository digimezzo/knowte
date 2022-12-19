import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BaseSettings } from '../../../../core/base-settings';

@Component({
    selector: 'app-spell-check-bottom-sheet',
    templateUrl: 'spell-check-bottom-sheet.component.html',
})
export class SpellCheckBottomSheetComponent {
    constructor(private settings: BaseSettings, private bottomSheetRef: MatBottomSheetRef<SpellCheckBottomSheetComponent>) {}
}
