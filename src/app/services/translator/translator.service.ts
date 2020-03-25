import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../../core/language';
import { Constants } from '../../core/constants';
import { remote } from 'electron';
import { Settings } from '../../core/settings';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {
  private globalEmitter: any = remote.getGlobal('globalEmitter');
  private languageChangedListener: any = this.languageChangedHandler.bind(this);
  private _selectedLanguage: Language;

  constructor(private translate: TranslateService, private settings: Settings) {
    this.initialize();
  }

  public languages: Language[] = Constants.languages;

  public get selectedLanguage(): Language {
    return this._selectedLanguage;
  }

  public set selectedLanguage(v: Language) {
    this._selectedLanguage = v;
    this.settings.language = v.code;

     // Global event because all windows need to be notified
     this.globalEmitter.emit(Constants.languageChangedEvent, v);
  }

  public languageChangedHandler(language: Language): void {
    this.translate.use(language.code);
  }

  public getAsync(key: string | Array<string>, interpolateParams?: Object): Promise<string> {
    return this.translate.get(key, interpolateParams).toPromise();
  }

  private initialize(): void {
    this.translate.setDefaultLang(this.settings.defaultLanguage);

    this._selectedLanguage = this.languages.find(x => x.code === this.settings.language);
    this.languageChangedHandler(this._selectedLanguage);

    this.globalEmitter.on(Constants.languageChangedEvent, this.languageChangedListener);
  }
}
