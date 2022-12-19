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

    public get numberOfEnabledLanguages(): number {
        const allSpellCheckLanguages: SpellCheckLanguage[] = this.getAllSpellCheckLanguages();
        const enabledSpellCheckLanguages: SpellCheckLanguage[] = allSpellCheckLanguages.filter((x) => x.isEnabled);

        return enabledSpellCheckLanguages.length;
    }

    public get firstEnabledLanguage(): string {
        const allSpellCheckLanguages: SpellCheckLanguage[] = this.getAllSpellCheckLanguages();
        const enabledSpellCheckLanguages: SpellCheckLanguage[] = allSpellCheckLanguages.filter((x) => x.isEnabled);

        if (enabledSpellCheckLanguages.length === 0) {
            return '';
        }

        return enabledSpellCheckLanguages[0].localizedName;
    }

    public applyActiveSpellCheckLanguagesIfEnabled(): void {
        if (!this.settings.enableSpellChecker) {
            this.logger.info('Spell check is disabled.', 'SpellCheckService', 'applyActiveSpellCheckLanguagesIfEnabled');

            return;
        }

        const languageCodesFromSettings: string[] = this.getLanguageCodesFromSettings();

        if (languageCodesFromSettings.length === 0) {
            this.logger.info('No spell check languages found.', 'SpellCheckService', 'applyActiveSpellCheckLanguagesIfEnabled');

            return;
        }

        try {
            const window: BrowserWindow = remote.getCurrentWindow();
            const supportedLanguageCodes: string[] = window.webContents.session.availableSpellCheckerLanguages;
            const languageCodesToSet: string[] = [];
            const unsupportedLanguageCodes: string[] = [];

            for (const languageCodeFromSettings of languageCodesFromSettings) {
                if (supportedLanguageCodes.includes(languageCodeFromSettings)) {
                    languageCodesToSet.push(languageCodeFromSettings);
                } else {
                    unsupportedLanguageCodes.push(languageCodeFromSettings);
                }
            }

            if (unsupportedLanguageCodes.length > 0) {
                this.logger.warn(
                    `These language codes are not supported: ${unsupportedLanguageCodes.join(', ')}`,
                    'SpellCheckService',
                    'applyActiveSpellCheckLanguagesIfEnabled'
                );
            }

            window.webContents.session.setSpellCheckerLanguages(languageCodesToSet);
            this.logger.info(
                `Applying spell check languages: ${languageCodesFromSettings.join(', ')}`,
                'SpellCheckService',
                'applyActiveSpellCheckLanguagesIfEnabled'
            );
        } catch (e) {
            this.logger.error(
                `Could not apply spell check languages. Error: ${e.message}`,
                'SpellCheckService',
                'applyActiveSpellCheckLanguagesIfEnabled'
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
        let allSpellCheckLanguages: SpellCheckLanguage[] = Constants.spellCheckLanguages;
        const languageCodesFromSettings: string[] = this.getLanguageCodesFromSettings();

        for (const spellCheckLanguage of allSpellCheckLanguages) {
            spellCheckLanguage.isEnabled = languageCodesFromSettings.includes(spellCheckLanguage.code);
        }

        allSpellCheckLanguages = allSpellCheckLanguages.sort((a, b) => (b.sortName.toLowerCase() > a.sortName.toLowerCase() ? -1 : 1));

        return allSpellCheckLanguages;
    }

    private getLanguageCodesFromSettings(): string[] {
        let languageCodesFromSettings: string[] = this.settings.activeSpellCheckLanguages.split(';');
        languageCodesFromSettings = languageCodesFromSettings.filter((x) => x !== '');

        return languageCodesFromSettings;
    }
}
