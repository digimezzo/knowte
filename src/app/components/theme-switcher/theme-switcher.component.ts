import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { Theme } from '../../services/appearance/theme/theme';

@Component({
    selector: 'app-theme-switcher',
    host: { style: 'display: block' },
    templateUrl: './theme-switcher.component.html',
    styleUrls: ['./theme-switcher.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ThemeSwitcherComponent implements OnInit {
    constructor(public appearanceService: AppearanceService) {}

    public ngOnInit(): void {}

    public setTheme(theme: Theme): void {
        this.appearanceService.selectedTheme = theme;
    }
}
