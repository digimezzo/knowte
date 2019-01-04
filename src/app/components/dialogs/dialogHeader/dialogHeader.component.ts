import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'dialog-header',
    templateUrl: './dialogHeader.component.html',
    styleUrls: ['./dialogHeader.component.scss']
})
export class DialogHeaderComponent implements OnInit {
    constructor() {
    }

    @Input() public titleText: string;

    ngOnInit() {
    }
}
