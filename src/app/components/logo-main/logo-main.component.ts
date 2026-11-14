import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-logo-main',
    host: { style: 'display: block' },
    templateUrl: './logo-main.component.html',
    styleUrls: ['./logo-main.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class LogoMainComponent {
    constructor() {}

    @Input()
    public showBackArrow: boolean;
}
