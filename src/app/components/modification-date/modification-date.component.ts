import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-modification-date',
    templateUrl: './modification-date.component.html',
    styleUrls: ['./modification-date.component.scss']
})
export class ModificationDateComponent implements OnInit {
    constructor() {
    }

    public modificationDate: string = 'Today';

    public ngOnInit(): void {
    }
}
