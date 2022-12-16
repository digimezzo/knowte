import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { BrowserWindow } from 'electron';
import { BaseSettings } from '../../core/base-settings';
import { Constants } from '../../core/constants';
import { Logger } from '../../core/logger';
import { SpellCheckLanguage } from '../../core/spell-check-language';

@Injectable({
    providedIn: 'root',
})
export class SpellCheckService {
    constructor(private settings: BaseSettings, private logger: Logger) {}

    public applyActiveSpellCheckLanguagesIfEnabled(): void {
        if (!this.settings.enableSpellChecker) {
            this.logger.info('Spell check is disabled.', 'SpellCheckService', 'applyActiveSpellCheckLanguages');

            return;
        }

        const languageCodesFromSettings: string[] = this.getLanguageCodesFromSettings();

        if (languageCodesFromSettings.length === 0) {
            this.logger.info('No spell check languages found.', 'SpellCheckService', 'applyActiveSpellCheckLanguages');

            return;
        }

        try {
            const window: BrowserWindow = remote.getCurrentWindow();
            window.webContents.session.setSpellCheckerLanguages(languageCodesFromSettings);
            this.logger.info(
                `Applying spell check languages: ${languageCodesFromSettings.join(', ')}`,
                'SpellCheckService',
                'applyActiveSpellCheckLanguages'
            );
        } catch (e) {
            this.logger.error(
                `Could not apply spell check languages. Error: ${e.message}`,
                'SpellCheckService',
                'applyActiveSpellCheckLanguages'
            );
        }
    }

    public toggleSpellCheckLanguage(spellCheckLanguage: SpellCheckLanguage): void {
        const languageCodesFromSettings: string[] = this.getLanguageCodesFromSettings();

        if (languageCodesFromSettings.includes(spellCheckLanguage.code)) {
            const index = languageCodesFromSettings.indexOf(spellCheckLanguage.code);
            languageCodesFromSettings.splice(index, 1);
        } else {
            languageCodesFromSettings.push(spellCheckLanguage.code);
        }

        this.settings.activeSpellCheckLanguages = languageCodesFromSettings.join(';');

        this.applyActiveSpellCheckLanguagesIfEnabled();
    }

    public getAllSpellCheckLanguages(): SpellCheckLanguage[] {
        const allSpellCheckLanguages: SpellCheckLanguage[] = Constants.spellCheckLanguages;
        const languageCodesFromSettings: string[] = this.getLanguageCodesFromSettings();

        for (const spellCheckLanguage of allSpellCheckLanguages) {
            spellCheckLanguage.isEnabled = languageCodesFromSettings.includes(spellCheckLanguage.code);
        }

        return allSpellCheckLanguages;
    }

    private getLanguageCodesFromSettings(): string[] {
        let languageCodesFromSettings: string[] = this.settings.activeSpellCheckLanguages.split(';');
        languageCodesFromSettings = languageCodesFromSettings.filter((x) => x !== '');

        return languageCodesFromSettings;
    }
}
