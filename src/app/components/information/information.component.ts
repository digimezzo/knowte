import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BaseAppearanceService } from '../../services/appearance/base-appearance.service';
import {AnimatedPage} from "../animated-page";
import {enterLeftToRight, enterRightToLeft} from "../../animations/animations";

@Component({
    selector: 'app-information',
    templateUrl: './information.component.html',
    styleUrls: ['./information.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [enterLeftToRight, enterRightToLeft],
})
export class InformationComponent extends AnimatedPage {
    public constructor(public appearance: BaseAppearanceService, private router: Router) {
        super();
    }
    
    public isBusy: boolean = false;

    public goBackToCollection(): void {
        this.router.navigate(['/collection']);
    }
}
