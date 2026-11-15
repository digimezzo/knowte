import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-main-menu',
    host: { style: 'display: block' },
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false,
})
export class MainMenuComponent {
    constructor() {}

    @Input() public selectedMenuItem: number;
}
