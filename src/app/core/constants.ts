import { Language } from './language';
import { ColorTheme } from './color-theme';
import { FontSize } from './font-size';

export class Constants {
    public static readonly applicationName: string = require('../../../package.json').name;
    public static readonly applicationVersion: string = require('../../../package.json').version;
    public static readonly applicationCopyright: string = 'Copyright Digimezzo Ⓒ 2013 - 2020';
    public static readonly donateUrl: string = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MQALEWTEZ7HX8';
    public static readonly websiteUrl: string = 'https://www.digimezzo.com';
    public static readonly twitterUrl: string = 'https://twitter.com/digimezzo';
    public static readonly githubUrl: string = 'https://github.com/digimezzo';
    public static readonly collectionsDirectory: string = `${Constants.applicationName} collections`;
    public static readonly noteContentExtension: string = '.content';
    public static readonly noteStateExtension: string = '.state';
    public static readonly noteExportExtension: string = '.knowte';
    public static readonly defaultCollection: string = 'Default';
    public static readonly allNotesNotebookId: string = '0';
    public static readonly unfiledNotesNotebookId: string = '1';

    public static readonly allCategory: string = 'all';
    public static readonly todayCategory: string = 'today';
    public static readonly yesterdayCategory: string = 'yesterday';
    public static readonly thisWeekCategory: string = 'thisweek';
    public static readonly markedCategory: string = 'marked';

    public static readonly setNoteOpenEvent: string = 'b4a112dd-25ac-4ec6-bd08-3b8e7fbdedda';
    public static readonly setNotebookEvent: string = 'cf6f3e12-b435-4787-a81c-f40c99b176d9';
    public static readonly setNoteMarkEvent: string = '1386e290-1f5d-4ca8-b8c3-76c5991faeba';
    public static readonly setNoteTitleEvent: string = 'd81c66b1-34f3-4b9d-9275-2aa6cee35201';
    public static readonly setNoteTextEvent: string = '7188b946-484c-4b6e-89d3-3e8a16ff33cd';
    public static readonly getNotebooksEvent: string = '00169e63-412e-428b-b969-8dd4b3602a02';
    public static readonly getNoteDetailsEvent: string = 'db3595b0-0997-414e-a30e-c5921c8d9861';
    public static readonly getSearchTextEvent: string = '22c2fc1d-6a81-459b-8829-2ee04c8d9c03';
    public static readonly notebookChangedEvent: string = '2518f49c-50f0-4165-ad92-cfa00476d884';
    public static readonly noteMarkChangedEvent: string = '3b46bceb-dbcd-4013-935d-8e6f79e371a0';
    public static readonly focusNoteEvent: string = 'f45748e7-a7af-4057-a712-b9b181212119';
    public static readonly closeNoteEvent: string = '0b7877ac-ca71-4cf5-a5a5-96798be7c5be';
    public static readonly deleteNoteEvent: string = '0896531e-ee16-4407-b4e5-120b55c6e82f';
    public static readonly themeChangedEvent: string = 'f132f4ce-ae3c-4e1d-958a-a9cd28517b68';
    public static readonly uiFontSizeChangedEvent: string = 'e49b82b5-f960-49bf-83f8-9721edc386cb';
    public static readonly languageChangedEvent: string = '0f8d004f-080d-4901-b813-477432809519';
    public static readonly noteFontSizeChangedEvent: string = '6ec3f042-27ea-49e1-a012-49693f44db02';

    public static noteFontSizes: number[] = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

    public static readonly uiFontSizes: FontSize[] = [
        new FontSize(12),
        new FontSize(13),
        new FontSize(14),
        new FontSize(15)
    ];

    public static readonly languages: Language[] = [
        { code: 'en', englishName: 'English', localizedName: 'English' },
        { code: 'fr', englishName: 'French', localizedName: 'Français' },
        { code: 'nl', englishName: 'Dutch', localizedName: 'Nederlands' }
    ];

    public static readonly colorThemes: ColorTheme[] = [
        { name: 'default-blue-theme', displayName: 'Knowte blue', color: '#1D7DD4' },
        { name: 'default-green-theme', displayName: 'Knowte green', color: '#7FB718' },
        { name: 'default-yellow-theme', displayName: 'Knowte yellow', color: '#F09609' },
        { name: 'default-purple-theme', displayName: 'Knowte purple', color: '#A835B2' },
        { name: 'default-pink-theme', displayName: 'Knowte pink', color: '#CE0058' },
        { name: 'ubuntu-orange-theme', displayName: 'Ubuntu orange', color: '#E95420' },
        { name: 'linuxmint-green-theme', displayName: 'Linux Mint green', color: '#8bb158' },
        { name: 'manjaro-green-theme', displayName: 'Manjaro green', color: '#16a085' },
        { name: 'windows10-blue-theme', displayName: 'Windows 10 blue', color: '#0078d7' },
        { name: 'material-red-theme', displayName: 'Material red', color: '#F44336' },
        { name: 'material-pink-theme', displayName: 'Material pink', color: '#E91E63' },
        { name: 'material-purple-theme', displayName: 'Material purple', color: '#9C27B0' },
        { name: 'material-deep-purple-theme', displayName: 'Material deep purple', color: '#673AB7' },
        { name: 'material-indigo-theme', displayName: 'Material indigo', color: '#3F51B5' },
        { name: 'material-blue-theme', displayName: 'Material blue', color: '#2196F3' },
        { name: 'material-light-blue-theme', displayName: 'Material light blue', color: '#03A9F4' },
        { name: 'material-cyan-theme', displayName: 'Material cyan', color: '#00BCD4' },
        { name: 'material-teal-theme', displayName: 'Material teal', color: '#009688' },
        { name: 'material-green-theme', displayName: 'Material green', color: '#4CAF50' },
        { name: 'material-light-green-theme', displayName: 'Material light green', color: '#8BC34A' },
        // { name: "material-lime-theme", displayName: "Material lime", color: "#CDDC39" },
        // { name: "material-yellow-theme", displayName: "Material yellow", color: "#FFEB3B" },
        { name: 'material-amber-theme', displayName: 'Material amber', color: '#FFC107' },
        { name: 'material-orange-theme', displayName: 'Material orange', color: '#FF9800' },
        { name: 'material-deep-orange-theme', displayName: 'Material deep orange', color: '#FF5722' }
    ];

    public static readonly externalComponents: any[] = [
        {
            name: 'Angular',
            description: 'Angular is a development platform for building mobile and desktop web applications using Typescript/JavaScript and other languages.',
            url: 'https://angular.io/',
            licenseUrl: 'https://github.com/angular/angular/blob/master/LICENSE'
        },
        {
            name: 'Angular Material',
            description: 'Component infrastructure and Material Design components for Angular.',
            url: 'https://material.angular.io/',
            licenseUrl: 'https://github.com/angular/material2/blob/master/LICENSE'
        },
        {
            name: 'Electron',
            description: 'The Electron framework lets you write cross-platform desktop applications using JavaScript, HTML and CSS. It is based on Node.js and Chromium.',
            url: 'https://electronjs.org/',
            licenseUrl: 'https://github.com/electron/electron/blob/master/LICENSE'
        },
        {
            name: 'electron-localshortcut',
            description: 'A module to register/unregister a keyboard shortcut locally to a BrowserWindow instance, without using a Menu.',
            url: 'https://github.com/parro-it/electron-localshortcut',
            licenseUrl: 'https://github.com/parro-it/electron-localshortcut/blob/master/license'
        },
        {
            name: 'electron-log',
            description: 'Just a simple logging module for your Electron or NW.js application. No dependencies. No complicated configuration. Just require and use. It can be used without Electron.',
            url: 'https://github.com/megahertz/electron-log',
            licenseUrl: 'https://github.com/megahertz/electron-log/blob/master/LICENSE'
        },
        {
            name: 'electron-store',
            description: 'Simple data persistence for your Electron app or module. Save and load user preferences, app state, cache, etc.',
            url: 'https://github.com/sindresorhus/electron-store',
            licenseUrl: 'https://github.com/sindresorhus/electron-store/blob/master/license'
        },
        {
            name: 'electron-window-state',
            description: 'A library to store and restore window sizes and positions for your Electron app.',
            url: 'https://github.com/mawie81/electron-window-state',
            licenseUrl: 'https://github.com/mawie81/electron-window-state/blob/master/license'
        },
        {
            name: 'Font Awesome Free',
            description: 'The iconic SVG, font, and CSS toolkit.',
            url: 'https://github.com/FortAwesome/Font-Awesome',
            licenseUrl: 'https://github.com/FortAwesome/Font-Awesome/blob/master/LICENSE.txt'
        },
        {
            name: 'fs-extra',
            description: 'Adds file system methods that aren\'t included in the native fs module and adds promise support to the fs methods.',
            url: 'https://github.com/jprichardson/node-fs-extra',
            licenseUrl: 'https://github.com/jprichardson/node-fs-extra/blob/master/LICENSE'
        },
        {
            name: 'LokiJS',
            description: 'A fast, in-memory document-oriented datastore for node.js, browser and cordova.',
            url: 'https://github.com/techfort/LokiJS',
            licenseUrl: 'https://github.com/techfort/LokiJS/blob/master/LICENSE.txt'
        },
        {
            name: 'Material Design icons',
            description: 'Material Design icons by Google.',
            url: 'https://github.com/google/material-design-icons',
            licenseUrl: 'https://github.com/google/material-design-icons/blob/master/LICENSE'
        },
        {
            name: 'Moment',
            description: 'Parse, validate, manipulate, and display dates in javascript.',
            url: 'http://momentjs.com',
            licenseUrl: 'https://github.com/moment/moment/blob/develop/LICENSE'
        },
        {
            name: 'Nano ID',
            description: 'A tiny (141 bytes), secure, URL-friendly, unique string ID generator for JavaScript.',
            url: 'https://github.com/ai/nanoid',
            licenseUrl: 'https://github.com/ai/nanoid/blob/master/LICENSE'
        },
        {
            name: 'Quill',
            description: 'Quill is a modern WYSIWYG editor built for compatibility and extensibility.',
            url: 'https://quilljs.com/',
            licenseUrl: 'https://github.com/quilljs/quill/blob/develop/LICENSE'
        },
        {
            name: 'sanitize-filename',
            description: 'Sanitize a string to be safe for use as a filename by removing directory paths and invalid characters.',
            url: 'https://github.com/parshap/node-sanitize-filename',
            licenseUrl: 'https://github.com/parshap/node-sanitize-filename/blob/master/LICENSE.md'
        },
        {
            name: 'SpinKit',
            description: 'A collection of loading indicators animated with CSS.',
            url: 'https://github.com/tobiasahlin/SpinKit',
            licenseUrl: 'https://github.com/tobiasahlin/SpinKit/blob/master/LICENSE'
        }
    ];
}
