import { FontSize } from './font-size';
import { Language } from './language';
import { SpellCheckLanguage } from './spell-check-language';

export class Constants {
    public static readonly logFileName: string = 'Knowte.log';
    public static readonly donateUrl: string = 'https://digimezzo.github.io/site/donate?software=knowte';
    public static readonly websiteUrl: string = 'https://digimezzo.github.io/site/';
    public static readonly blueskyUrl: string = 'https://bsky.app/profile/digimezzo.bsky.social';
    public static readonly mastodonUrl: string = 'https://hachyderm.io/@digimezzo';
    public static readonly githubUrl: string = 'https://github.com/digimezzo/knowte';
    public static readonly collectionsDirectory: string = 'Knowte collections';
    public static readonly classicNoteContentExtension: string = '.content';
    public static readonly markdownNoteContentExtension: string = '.md';
    public static readonly noteStateExtension: string = '.state';
    public static readonly classicNoteExportExtension: string = '.knowte';
    public static readonly markdownNoteExportExtension: string = '.knowtemd';
    public static readonly defaultCollection: string = 'Default';
    public static readonly allNotesNotebookId: string = '0';
    public static readonly unfiledNotesNotebookId: string = '1';
    public static readonly screenEaseSpeedMilliseconds: number = 350;

    public static readonly allCategory: string = 'all';
    public static readonly todayCategory: string = 'today';
    public static readonly yesterdayCategory: string = 'yesterday';
    public static readonly thisWeekCategory: string = 'thisweek';
    public static readonly markedCategory: string = 'marked';

    public static readonly previewApplicationTag: string = 'preview';
    public static readonly releaseCandidateApplicationTag: string = 'rc';

    public static readonly noteSaveTimeoutMilliseconds: number = 2000;
    public static readonly noteMaximumSaveDelayMilliseconds: number = 30000;
    public static readonly noteSaveRetryMilliseconds: number = 10000;
    public static readonly noteMetadataSaveTimeoutMilliseconds: number = 10000;
    public static readonly noteWindowCloseTimeoutMilliseconds: number = 500;

    public static noteZoomPercentages: number[] = [70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

    public static readonly fontSizes: FontSize[] = [new FontSize(12), new FontSize(13), new FontSize(14), new FontSize(15)];

    public static readonly languages: Language[] = [
        { code: 'de', englishName: 'German', localizedName: 'Deutch' },
        { code: 'en', englishName: 'English', localizedName: 'English' },
        { code: 'fr', englishName: 'French', localizedName: 'Français' },
        { code: 'hr', englishName: 'Croatian', localizedName: 'Hrvatski' },
        { code: 'jp', englishName: 'Japanese', localizedName: '日本語' },
        { code: 'nl', englishName: 'Dutch', localizedName: 'Nederlands' },
        { code: 'zh-cn', englishName: 'Chinese', localizedName: '中國人' },
        { code: 'pt-br', englishName: 'Brazilian Portuguese', localizedName: 'Português brasileiro' },
        { code: 'ru', englishName: 'Russian', localizedName: 'Русский' },
    ];

    /**
     * These are the languages that are returned by window.webContents.session.availableSpellCheckerLanguages
     * (Where window is a BrowserWindow). It's unclear if this list ever changes. The documentation is non-existent.
     * af,bg,ca,cs,cy,da,de,de-DE,el,en-AU,en-CA,en-GB,en-GB-oxendict,en-US,es,es-419,es-AR,es-ES,es-MX,es-US,et,fa,
     * fo,fr,fr-FR,he,hi,hr,hu,hy,id,it,it-IT,ko,lt,lv,nb,nl,pl,pt,pt-BR,pt-PT,ro,ru,sh,sk,sl,sq,sr,sv,ta,tg,tr,uk,vi
     */
    public static readonly spellCheckLanguages: SpellCheckLanguage[] = [
        new SpellCheckLanguage('af', 'Afrikaans', 'Afrikaans', true),
        new SpellCheckLanguage('bg', 'Bulgarian', 'български', false),
        new SpellCheckLanguage('ca', 'Catalan', 'Català', true),
        new SpellCheckLanguage('cs', 'Czech', 'Čeština', true),
        new SpellCheckLanguage('cy', 'Welsh', 'Cymraeg', true),
        new SpellCheckLanguage('da', 'Danish', 'Dansk', true),
        new SpellCheckLanguage('de', 'German', 'Deutsch', true),
        new SpellCheckLanguage('el', 'Greek', 'Ελληνικά', false),
        new SpellCheckLanguage('en-GB', 'English (UK)', 'English (UK)', true),
        new SpellCheckLanguage('en-US', 'English (US)', 'English (US)', true),
        new SpellCheckLanguage('es', 'Spanish', 'Español', true),
        new SpellCheckLanguage('et', 'Estonian', 'Eesti', true),
        new SpellCheckLanguage('fr', 'French', 'Français', true),
        new SpellCheckLanguage('hi', 'Hindi', 'हिंदी', false),
        new SpellCheckLanguage('hr', 'Croatian', 'Hrvatski', true),
        new SpellCheckLanguage('hu', 'Hungarian', 'Magyar', true),
        new SpellCheckLanguage('hy', 'Armenian', 'Հայերեն', false),
        new SpellCheckLanguage('id', 'Indonesian', 'Bahasa Indonesia', true),
        new SpellCheckLanguage('it', 'Italian', 'Italiano', true),
        new SpellCheckLanguage('ko', 'Korean', '한국인', false),
        new SpellCheckLanguage('lt', 'Lithuanian', 'Lietuvių', true),
        new SpellCheckLanguage('lv', 'Latvian', 'Latviešu', true),
        new SpellCheckLanguage('nb', 'Norwegian', 'Norsk', true),
        new SpellCheckLanguage('nl', 'Dutch', 'Nederlands', true),
        new SpellCheckLanguage('pl', 'Polish', 'Polski', true),
        new SpellCheckLanguage('pt', 'Portuguese', 'Português', true),
        new SpellCheckLanguage('ro', 'Romanian', 'Română', true),
        new SpellCheckLanguage('ru', 'Russian', 'Русский', false),
        new SpellCheckLanguage('sk', 'Slovak', 'Slovenský', true),
        new SpellCheckLanguage('sl', 'Slovenian', 'Slovenščina', true),
        new SpellCheckLanguage('sq', 'Albanian', 'Shqiptare', true),
        new SpellCheckLanguage('sr', 'Serbian', 'Српски', false),
        new SpellCheckLanguage('sv', 'Swedish', 'Svenska', true),
        new SpellCheckLanguage('ta', 'Tamil', 'தமிழ்', false),
        new SpellCheckLanguage('tg', 'Tajik', 'Тоҷикӣ', false),
        new SpellCheckLanguage('tr', 'Turkish', 'Türkçe', true),
        new SpellCheckLanguage('uk', 'Ukrainian', 'Українська', false),
        new SpellCheckLanguage('vi', 'Vietnamese', 'Tiếng Việt', true),
    ];

    public static readonly externalComponents: any[] = [
        {
            name: 'Angular',
            description:
                'Angular is a development platform for building mobile and desktop web applications using Typescript/JavaScript and other languages.',
            url: 'https://angular.dev/',
            licenseUrl: 'https://github.com/angular/angular/blob/master/LICENSE',
        },
        {
            name: 'Archiver',
            description: 'A streaming interface for archive generation.',
            url: 'https://www.archiverjs.com/',
            licenseUrl: 'https://github.com/archiverjs/node-archiver/blob/master/LICENSE',
        },
        {
            name: 'angular-split',
            description: 'Angular UI library to split views and allow dragging to resize areas using CSS flexbox layout.',
            url: 'https://angular-split.github.io/',
            licenseUrl: 'https://github.com/angular-split/angular-split/blob/main/LICENSE',
        },
        {
            name: 'Angular Material',
            description: 'Component infrastructure and Material Design components for Angular.',
            url: 'https://material.angular.dev/',
            licenseUrl: 'https://github.com/angular/components/blob/main/LICENSE',
        },
        {
            name: 'core-js',
            description: 'A modular standard library for JavaScript, including polyfills for modern ECMAScript features.',
            url: 'https://github.com/zloirock/core-js',
            licenseUrl: 'https://github.com/zloirock/core-js/blob/master/LICENSE',
        },
        {
            name: 'crypto-js',
            description: 'JavaScript library of crypto standards..',
            url: 'https://github.com/brix/crypto-js',
            licenseUrl: 'https://github.com/brix/crypto-js/blob/develop/LICENSE',
        },
        {
            name: 'DOMPurify',
            description: 'DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG.',
            url: 'https://github.com/cure53/DOMPurify',
            licenseUrl: 'https://github.com/cure53/DOMPurify/blob/main/LICENSE',
        },
        {
            name: '@electron/remote',
            description: 'Electron module to enable remote method calls between renderer and main processes.',
            url: 'https://github.com/electron/remote',
            licenseUrl: 'https://github.com/electron/remote/blob/main/LICENSE',
        },
        {
            name: 'Electron',
            description:
                'The Electron framework lets you write cross-platform desktop applications using JavaScript, HTML and CSS. It is based on Node.js and Chromium.',
            url: 'https://electronjs.org/',
            licenseUrl: 'https://github.com/electron/electron/blob/master/LICENSE',
        },
        {
            name: 'electron-localshortcut',
            description: 'A module to register/unregister a keyboard shortcut locally to a BrowserWindow instance, without using a Menu.',
            url: 'https://github.com/parro-it/electron-localshortcut',
            licenseUrl: 'https://github.com/parro-it/electron-localshortcut/blob/master/license',
        },
        {
            name: 'extract-zip',
            description: 'Extracts ZIP files to a directory.',
            url: 'https://github.com/max-mapper/extract-zip',
            licenseUrl: 'https://github.com/max-mapper/extract-zip/blob/master/LICENSE',
        },
        {
            name: 'electron-log',
            description:
                'Just a simple logging module for your Electron or NW.js application. No dependencies. No complicated configuration. Just require and use. It can be used without Electron.',
            url: 'https://github.com/megahertz/electron-log',
            licenseUrl: 'https://github.com/megahertz/electron-log/blob/master/LICENSE',
        },
        {
            name: 'electron-window-state',
            description: 'A library to store and restore window sizes and positions for your Electron app.',
            url: 'https://github.com/mawie81/electron-window-state',
            licenseUrl: 'https://github.com/mawie81/electron-window-state/blob/master/license',
        },
        {
            name: 'Font Awesome free',
            description: `Font Awesome is the Internet's icon library and toolkit, used by millions of designers, developers, and content creators.`,
            url: 'https://github.com/FortAwesome/Font-Awesome',
            licenseUrl: 'https://github.com/FortAwesome/Font-Awesome/blob/6.x/LICENSE.txt',
        },
        {
            name: 'fs-extra',
            description:
                "Adds file system methods that aren't included in the native fs module and adds promise support to the fs methods.",
            url: 'https://github.com/jprichardson/node-fs-extra',
            licenseUrl: 'https://github.com/jprichardson/node-fs-extra/blob/master/LICENSE',
        },
        {
            name: 'Line Awesome',
            description:
                'Line Awesome is a free alternative for Font Awesome 5.11.2. It consists of ~1380 flat icons that offer complete coverage of the main Font Awesome icon set.',
            url: 'https://github.com/icons8/line-awesome',
            licenseUrl: 'https://github.com/icons8/line-awesome/blob/master/LICENSE.md',
        },
        {
            name: 'LokiJS',
            description: 'A fast, in-memory document-oriented datastore for node.js, browser and cordova.',
            url: 'https://github.com/techfort/LokiJS',
            licenseUrl: 'https://github.com/techfort/LokiJS/blob/master/LICENSE.txt',
        },
        {
            name: 'Material Design icons',
            description: 'Material Design icons by Google.',
            url: 'https://github.com/google/material-design-icons',
            licenseUrl: 'https://github.com/google/material-design-icons/blob/master/LICENSE',
        },
        {
            name: 'Moment',
            description: 'Parse, validate, manipulate, and display dates in javascript.',
            url: 'http://momentjs.com',
            licenseUrl: 'https://github.com/moment/moment/blob/develop/LICENSE',
        },
        {
            name: 'Marked',
            description: 'A low-level Markdown compiler for parsing Markdown without caching or blocking.',
            url: 'https://marked.js.org/',
            licenseUrl: 'https://github.com/markedjs/marked/blob/master/LICENSE',
        },
        {
            name: 'Nano ID',
            description: 'A tiny (141 bytes), secure, URL-friendly, unique string ID generator for JavaScript.',
            url: 'https://github.com/ai/nanoid',
            licenseUrl: 'https://github.com/ai/nanoid/blob/master/LICENSE',
        },
        {
            name: 'ngx-markdown',
            description: 'An Angular library that renders Markdown content.',
            url: 'https://github.com/jfcere/ngx-markdown',
            licenseUrl: 'https://github.com/jfcere/ngx-markdown/blob/master/LICENSE',
        },
        {
            name: '@ngx-translate/core',
            description: 'The core internationalization library used to translate the application.',
            url: 'https://github.com/ngx-translate/core',
            licenseUrl: 'https://github.com/ngx-translate/core/blob/master/LICENSE',
        },
        {
            name: '@ngx-translate/http-loader',
            description: 'HTTP loader for translation files used with ngx-translate.',
            url: 'https://github.com/ngx-translate/http-loader',
            licenseUrl: 'https://github.com/ngx-translate/http-loader/blob/master/LICENSE',
        },
        {
            name: 'PrismJS',
            description: 'A lightweight, extensible syntax highlighter used for code blocks.',
            url: 'https://prismjs.com/',
            licenseUrl: 'https://github.com/PrismJS/prism/blob/master/LICENSE',
        },
        {
            name: 'Quill',
            description: 'Quill is a modern WYSIWYG editor built for compatibility and extensibility.',
            url: 'https://quilljs.com/',
            licenseUrl: 'https://github.com/quilljs/quill/blob/develop/LICENSE',
        },
        {
            name: 'Quill Blot Formatter',
            description: 'A quill module to format document blots.',
            url: 'https://github.com/Fandom-OSS/quill-blot-formatter',
            licenseUrl: 'https://github.com/Fandom-OSS/quill-blot-formatter/blob/master/LICENSE',
        },
        {
            name: 'sanitize-filename',
            description: 'Sanitize a string to be safe for use as a filename by removing directory paths and invalid characters.',
            url: 'https://github.com/parshap/node-sanitize-filename',
            licenseUrl: 'https://github.com/parshap/node-sanitize-filename/blob/master/LICENSE.md',
        },
        {
            name: 'Reflect Metadata',
            description: 'Polyfill for the Metadata Reflection API used by Angular.',
            url: 'https://github.com/microsoft/reflect-metadata',
            licenseUrl: 'https://github.com/microsoft/reflect-metadata/blob/main/LICENSE',
        },
        {
            name: 'RxJS',
            description: 'A library for reactive programming using Observables.',
            url: 'https://rxjs.dev/',
            licenseUrl: 'https://github.com/ReactiveX/rxjs/blob/master/LICENSE.txt',
        },
        {
            name: 'SpinKit',
            description: 'A collection of loading indicators animated with CSS.',
            url: 'https://github.com/tobiasahlin/SpinKit',
            licenseUrl: 'https://github.com/tobiasahlin/SpinKit/blob/master/LICENSE',
        },
        {
            name: 'tinycolor2',
            description: 'A small, fast library for color manipulation and conversion.',
            url: 'https://github.com/bgrins/TinyColor',
            licenseUrl: 'https://github.com/bgrins/TinyColor/blob/master/LICENSE',
        },
        {
            name: 'tslib',
            description: 'Runtime library for TypeScript helper functions.',
            url: 'https://github.com/microsoft/tslib',
            licenseUrl: 'https://github.com/microsoft/tslib/blob/main/LICENSE.txt',
        },
        {
            name: 'Zone.js',
            description: 'An execution context that persists across asynchronous tasks, used by Angular.',
            url: 'https://github.com/angular/angular/tree/main/packages/zone.js',
            licenseUrl: 'https://github.com/angular/angular/blob/main/LICENSE',
        },
    ];
}
