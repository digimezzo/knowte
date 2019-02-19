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
    static readonly defaultCollection: string = "Default";
    static readonly unfiledNotebookName: string = "Unfiled";
    static readonly allNotesNotebookId: string = "0";
    static readonly unfiledNotesNotebookId: string = "1";

    static readonly allCategory: string = "all";
    static readonly todayCategory: string = "today";
    static readonly yesterdayCategory: string = "yesterday";
    static readonly thisWeekCategory: string = "thisweek";
    static readonly markedCategory: string = "marked";

    static readonly externalComponents: any[] = [
        { name: "Angular", description: "Angular is a development platform for building mobile and desktop web applications using Typescript/JavaScript and other languages.", url: "https://angular.io/", licenseUrl: "https://github.com/angular/angular/blob/master/LICENSE" },
        { name: "Electron", description: "The Electron framework lets you write cross-platform desktop applications using JavaScript, HTML and CSS. It is based on Node.js and Chromium.", url: "https://electronjs.org/", licenseUrl: "https://github.com/electron/electron/blob/master/LICENSE" },
        { name: "Electron-log", description: "Just a simple logging module for your Electron or NW.js application. No dependencies. No complicated configuration. Just require and use. It can be used without Electron.", url: "https://github.com/megahertz/electron-log", licenseUrl: "https://github.com/megahertz/electron-log/blob/master/LICENSE" }
    ];
}