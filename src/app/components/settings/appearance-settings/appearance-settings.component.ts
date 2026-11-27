import { Component, ViewEncapsulation } from '@angular/core';
import {BaseAppearanceService} from "../../../services/appearance/base-appearance.service";
import {TranslatorService} from "../../../services/translator/translator.service";
import {BaseSettings} from "../../../common/settings/base-settings";
import {Desktop} from "../../../common/io/desktop";
import { BaseApplication } from '../../../common/io/base-application';

@Component({
    selector: 'app-appearance-settings',
    host: { style: 'display: block; width: 100%;' },
    templateUrl: './appearance-settings.component.html',
    styleUrls: ['./appearance-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class AppearanceSettingsComponent {
    public readonly isSnap: boolean;

    public constructor(
        public appearance: BaseAppearanceService,
        public translator: TranslatorService,
        public settings: BaseSettings,
        private desktop: Desktop,
        application: BaseApplication,
    ) {
        this.isSnap = application.getGlobal('isSnap') === true;
    }

    public get useCustomTitleBarChecked(): boolean {
        return this.settings.useCustomTitleBar;
    }
    public set useCustomTitleBarChecked(v: boolean) {
        this.settings.useCustomTitleBar = v;
    }

    public openThemesDirectory(): void {
        this.desktop.openPath(this.appearance.themesDirectoryPath);
    }
}
