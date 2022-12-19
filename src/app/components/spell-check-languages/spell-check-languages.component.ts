import { Component, ViewEncapsulation } from '@angular/core';
import { SpellCheckLanguage } from '../../core/spell-check-language';
import { SpellCheckService } from '../../services/spell-check/spell-check.service';

@Component({
    selector: 'app-spell-check-languages',
    host: { style: 'display: block' },
    templateUrl: './spell-check-languages.component.html',
    styleUrls: ['./spell-check-languages.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SpellCheckLanguagesComponent {
    constructor(private spellCheckService: SpellCheckService) {}

    public spellCheckLanguages: SpellCheckLanguage[] = this.spellCheckService.getAllSpellCheckLanguages();
    public toggleSpellCheckLanguage(spellCheckLanguage: SpellCheckLanguage): void {
        this.spellCheckService.toggleSpellCheckLanguage(spellCheckLanguage);
    }
}
