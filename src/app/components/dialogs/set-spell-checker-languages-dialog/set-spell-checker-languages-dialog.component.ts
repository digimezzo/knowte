import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-set-spell-checker-languages',
    host: { style: 'display: block' },
    templateUrl: './set-spell-checker-languages-dialog.component.html',
    styleUrls: ['./set-spell-checker-languages-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class SetSpellCheckerLanguagesDialogComponent {
    constructor() {}
}
