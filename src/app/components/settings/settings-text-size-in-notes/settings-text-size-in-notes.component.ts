import { Component, ViewEncapsulation } from '@angular/core';
import { Constants } from '../../../common/application/constants';
import { BaseSettings } from '../../../common/settings/base-settings';
import { CollectionService } from '../../../services/collection/collection.service';

@Component({
    selector: 'app-settings-text-size-in-notes',
    templateUrl: './settings-text-size-in-notes.component.html',
    styleUrls: ['./settings-text-size-in-notes.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SettingsTextSizeInNotesComponent {
    constructor(private collectionService: CollectionService, private settings: BaseSettings) {}

    public noteZoomPercentages: number[] = Constants.noteZoomPercentages;

    public get selectedNoteZoomPercentage(): number {
        return this.settings.noteZoomPercentage;
    }

    public set selectedNoteZoomPercentage(v: number) {
        this.settings.noteZoomPercentage = v;
        this.collectionService.onNoteZoomPercentageChanged();
    }
}
