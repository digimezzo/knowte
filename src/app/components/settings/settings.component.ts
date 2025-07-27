import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BaseAppearanceService } from '../../services/appearance/base-appearance.service';
import {AnimatedPage} from "../animated-page";
import {enterLeftToRight, enterRightToLeft} from "../../animations/animations";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [enterLeftToRight, enterRightToLeft],
})
export class SettingsComponent extends AnimatedPage  {
    public constructor(
        public appearance: BaseAppearanceService,
        private router: Router
    ) {
        super();
    }

    public isBusy: boolean = false;
    
    public goBackToCollection(): void {
        this.router.navigate(['/collection']);
    }
}
