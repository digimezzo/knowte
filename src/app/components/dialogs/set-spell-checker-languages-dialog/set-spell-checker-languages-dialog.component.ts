import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SpellCheckLanguage } from '../../../core/spell-check-language';
import { SpellCheckService } from '../../../services/spell-check/spell-check.service';

@Component({
    selector: 'app-set-spell-checker-languages',
    host: { style: 'display: block' },
    templateUrl: './set-spell-checker-languages-dialog.component.html',
    styleUrls: ['./set-spell-checker-languages-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SetSpellCheckerLanguagesDialogComponent implements OnInit {
    constructor(private spellCheckService: SpellCheckService) {}

    public spellCheckLanguages: SpellCheckLanguage[] = this.spellCheckService.getAllSpellCheckLanguages();

    public ngOnInit(): void {}

    public toggleSpellCheckLanguage(spellCheckLanguage: SpellCheckLanguage): void {
        this.spellCheckService.toggleSpellCheckLanguage(spellCheckLanguage);
    }
}
