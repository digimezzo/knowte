import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BaseSettings } from '../../../core/base-settings';
import { Constants } from '../../../core/constants';

@Component({
    selector: 'app-text-size-bottom-sheet',
    templateUrl: 'text-size-bottom-sheet.component.html',
})
export class TextSizeBottomSheetComponent {
    constructor(private settings: BaseSettings, private bottomSheetRef: MatBottomSheetRef<TextSizeBottomSheetComponent>) {}

    public noteZoomPercentages: number[] = Constants.noteZoomPercentages;

    public get selectedNoteZoomPercentage(): number {
        return this.settings.noteZoomPercentage;
    }
    public set selectedNoteZoomPercentage(v: number) {
        this.settings.noteZoomPercentage = v;
    }

    public openLink(event: MouseEvent): void {
        this.bottomSheetRef.dismiss();
        event.preventDefault();
    }
}
