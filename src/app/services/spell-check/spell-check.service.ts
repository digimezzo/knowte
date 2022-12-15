import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { BrowserWindow } from 'electron';
import { BaseSettings } from '../../core/base-settings';
import { Logger } from '../../core/logger';

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

        let activeSpellCheckLanguages: string[] = this.settings.activeSpellCheckLanguages.split(';');

        activeSpellCheckLanguages = activeSpellCheckLanguages.filter((x) => x !== '');

        if (activeSpellCheckLanguages.length === 0) {
            this.logger.info('No spell check languages found.', 'SpellCheckService', 'applyActiveSpellCheckLanguages');

            return;
        }

        try {
            const window: BrowserWindow = remote.getCurrentWindow();
            window.webContents.session.setSpellCheckerLanguages(activeSpellCheckLanguages);
            this.logger.info(
                `Applying spell check languages: ${activeSpellCheckLanguages.join(', ')}`,
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
}
