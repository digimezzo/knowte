export class Constants {
    static readonly applicationName: string = require("../../../package.json").name;
    static readonly applicationVersion: string = require("../../../package.json").version;
    static readonly applicationCopyright: string = "Copyright Digimezzo Ⓒ 2013 - 2018";
    static readonly donateUrl = "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MQALEWTEZ7HX8";
    static readonly websiteUrl = "https://www.digimezzo.com";
    static readonly emailAddress = "https://www.digimezzo.com/contact";
    static readonly facebookUrl = "https://www.facebook.com/Digimezzo";
    static readonly twitterUrl = "https://twitter.com/Digimezzo";
    static readonly collectionsDirectory: string = `${Constants.applicationName} collections`;
    static readonly noteExtension: string = ".knowte";
    static readonly stateExtension: string = ".state";
    static readonly defaultCollection: string = "Default";
    static readonly unfiledNotebookName: string = "Unfiled";
    static readonly allNotesNotebookId: string = "0";
    static readonly unfiledNotesNotebookId: string = "1";
  
    static readonly allCategory: string = "all";
    static readonly todayCategory: string = "today";
    static readonly yesterdayCategory: string = "yesterday";
    static readonly thisWeekCategory: string = "thisweek";
    static readonly markedCategory: string = "marked";

    static readonly setNoteOpenEvent: string = "b4a112dd-25ac-4ec6-bd08-3b8e7fbdedda";
    static readonly setNotebookEvent: string = "cf6f3e12-b435-4787-a81c-f40c99b176d9";
    static readonly setNoteMarkEvent: string = "1386e290-1f5d-4ca8-b8c3-76c5991faeba";
    static readonly setNoteTitleEvent: string = "d81c66b1-34f3-4b9d-9275-2aa6cee35201";
    static readonly setNoteTextEvent: string = "7188b946-484c-4b6e-89d3-3e8a16ff33cd";
    static readonly getNotebooksEvent: string = "00169e63-412e-428b-b969-8dd4b3602a02";
    static readonly getNoteDetailsEvent: string = "db3595b0-0997-414e-a30e-c5921c8d9861";
    static readonly notebookChangedEvent: string = "2518f49c-50f0-4165-ad92-cfa00476d884";
    static readonly noteMarkChangedEvent: string = "3b46bceb-dbcd-4013-935d-8e6f79e371a0";

    static readonly externalComponents: any[] = [
        { name: "Angular", description: "Angular is a development platform for building mobile and desktop web applications using Typescript/JavaScript and other languages.", url: "https://angular.io/", licenseUrl: "https://github.com/angular/angular/blob/master/LICENSE" },
        { name: "Angular Material", description: "Component infrastructure and Material Design components for Angular.", url: "https://material.angular.io/", licenseUrl: "https://github.com/angular/material2/blob/master/LICENSE" },
        { name: "Electron", description: "The Electron framework lets you write cross-platform desktop applications using JavaScript, HTML and CSS. It is based on Node.js and Chromium.", url: "https://electronjs.org/", licenseUrl: "https://github.com/electron/electron/blob/master/LICENSE" },
        { name: "electron-log", description: "Just a simple logging module for your Electron or NW.js application. No dependencies. No complicated configuration. Just require and use. It can be used without Electron.", url: "https://github.com/megahertz/electron-log", licenseUrl: "https://github.com/megahertz/electron-log/blob/master/LICENSE" },
        { name: "electron-store", description: "Simple data persistence for your Electron app or module. Save and load user preferences, app state, cache, etc.", url: "https://github.com/sindresorhus/electron-store", licenseUrl: "https://github.com/sindresorhus/electron-store/blob/master/license" },
        { name: "electron-window-state", description: "A library to store and restore window sizes and positions for your Electron app.", url: "https://github.com/mawie81/electron-window-state", licenseUrl: "https://github.com/mawie81/electron-window-state/blob/master/license" },
        { name: "fs-extra", description: "Adds file system methods that aren't included in the native fs module and adds promise support to the fs methods.", url: "https://github.com/jprichardson/node-fs-extra", licenseUrl: "https://github.com/jprichardson/node-fs-extra/blob/master/LICENSE" },
        { name: "LokiJS", description: "A fast, in-memory document-oriented datastore for node.js, browser and cordova.", url: "http://lokijs.org/", licenseUrl: "https://github.com/techfort/LokiJS/blob/master/LICENSE.txt" },
        { name: "Moment", description: "Parse, validate, manipulate, and display dates in javascript.", url: "http://momentjs.com", licenseUrl: "https://github.com/moment/moment/blob/develop/LICENSE" },
        { name: "Nano ID", description: "A tiny (141 bytes), secure, URL-friendly, unique string ID generator for JavaScript.", url: "https://github.com/ai/nanoid", licenseUrl: "https://github.com/ai/nanoid/blob/master/LICENSE" },
        { name: "Quill", description: "Quill is a modern WYSIWYG editor built for compatibility and extensibility.", url: "https://quilljs.com/", licenseUrl: "https://github.com/quilljs/quill/blob/develop/LICENSE" },
        { name: "sanitize-filename", description: "Sanitize a string to be safe for use as a filename by removing directory paths and invalid characters.", url: "https://github.com/parshap/node-sanitize-filename", licenseUrl: "https://github.com/parshap/node-sanitize-filename/blob/master/LICENSE.md" }
    ];
}