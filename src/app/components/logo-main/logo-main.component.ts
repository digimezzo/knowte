import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-logo-main',
    host: { style: 'display: block' },
    templateUrl: './logo-main.component.html',
    styleUrls: ['./logo-main.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LogoMainComponent implements OnInit {
    constructor() {}

    @Input()
    public showBackArrow: boolean;

    public ngOnInit(): void {}
}
