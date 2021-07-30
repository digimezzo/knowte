import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ProductInformation } from '../../core/product-information';

@Component({
    selector: 'app-logo-full',
    host: { style: 'display: block' },
    templateUrl: './logo-full.component.html',
    styleUrls: ['./logo-full.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LogoFullComponent implements OnInit {
    constructor() {}

    @Input() public textColor: string;
    public applicationName: string = ProductInformation.applicationName.toUpperCase();

    public ngOnInit(): void {}
}
