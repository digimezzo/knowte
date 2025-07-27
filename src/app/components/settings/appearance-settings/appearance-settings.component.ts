import { Component, ViewEncapsulation } from '@angular/core';
import {BaseAppearanceService} from "../../../services/appearance/base-appearance.service";
import {TranslatorService} from "../../../services/translator/translator.service";
import {BaseSettings} from "../../../common/settings/base-settings";
import {Desktop} from "../../../common/io/desktop";

@Component({
    selector: 'app-appearance-settings',
    host: { style: 'display: block; width: 100%;' },
    templateUrl: './appearance-settings.component.html',
    styleUrls: ['./appearance-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppearanceSettingsComponent {
    public constructor(
        public appearance: BaseAppearanceService,
        public translator: TranslatorService,
        public settings: BaseSettings,
        private desktop: Desktop,
    ) {}

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
