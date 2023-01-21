import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { BaseSettings } from '../../core/base-settings';
import { Constants } from '../../core/constants';
import { Language } from '../../core/language';
import { TranslatorEvents } from './translator-events';

@Injectable()
export class TranslatorService {
    private languageChanged: Subject<Language> = new Subject();

    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private languageChangedListener: any = this.languageChangedHandler.bind(this);
    private _selectedLanguage: Language;

    constructor(private translate: TranslateService, private settings: BaseSettings) {
        this.initialize();
    }

    public languageChanged$: Observable<Language> = this.languageChanged.asObservable();

    public languages: Language[] = Constants.languages;

    public get selectedLanguage(): Language {
        return this._selectedLanguage;
    }

    public set selectedLanguage(v: Language) {
        this._selectedLanguage = v;
        this.settings.language = v.code;

        // Global event because all windows need to be notified
        this.globalEmitter.emit(TranslatorEvents.languageChangedEvent, v);
    }

    public languageChangedHandler(language: Language): void {
        this.translate.use(language.code);
        this.languageChanged.next(language);
    }

    public getAsync(key: string | Array<string>, interpolateParams?: Object): Promise<string> {
        return this.translate.get(key, interpolateParams).toPromise();
    }

    private initialize(): void {
        this.translate.setDefaultLang(this.settings.defaultLanguage);

        this._selectedLanguage = this.languages.find((x) => x.code === this.settings.language);
        this.languageChangedHandler(this._selectedLanguage);

        this.globalEmitter.on(TranslatorEvents.languageChangedEvent, this.languageChangedListener);
    }
}
