import { Component, ViewEncapsulation } from '@angular/core';
import {BaseSettings} from "../../../common/settings/base-settings";

@Component({
    selector: 'app-advanced-settings',
    host: { style: 'display: block; width: 100%;' },
    templateUrl: './advanced-settings.component.html',
    styleUrls: ['./advanced-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AdvancedSettingsComponent {
    public constructor(
        public settings: BaseSettings,
    ) {}

    public get checkForUpdatesChecked(): boolean {
        return this.settings.checkForUpdates;
    }
    public set checkForUpdatesChecked(v: boolean) {
        this.settings.checkForUpdates = v;
    }

    public get moveDeletedNotesToTrashChecked(): boolean {
        return this.settings.moveDeletedNotesToTrash;
    }
    public set moveDeletedNotesToTrashChecked(v: boolean) {
        this.settings.moveDeletedNotesToTrash = v;
    }
}
