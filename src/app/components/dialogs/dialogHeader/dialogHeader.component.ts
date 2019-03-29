import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'dialog-header',
    templateUrl: './dialogHeader.component.html',
    styleUrls: ['./dialogHeader.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DialogHeaderComponent implements OnInit {
    constructor() {
    }

    @Input() public titleText: string;

    public ngOnInit(): void {
    }
}
