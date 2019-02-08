"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants = /** @class */ (function () {
    function Constants() {
    }
    Constants.applicationName = require("../../../package.json").name;
    Constants.applicationVersion = require("../../../package.json").version;
    Constants.applicationCopyright = "Copyright Digimezzo Ⓒ 2013 - 2018";
    Constants.donateUrl = "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MQALEWTEZ7HX8";
    Constants.websiteUrl = "https://www.digimezzo.com";
    Constants.emailAddress = "https://www.digimezzo.com/contact";
    Constants.facebookUrl = "https://www.facebook.com/Digimezzo";
    Constants.twitterUrl = "https://twitter.com/Digimezzo";
    Constants.collectionsDirectory = Constants.applicationName + " collections";
    Constants.dataStoreFile = Constants.applicationName + ".json";
    Constants.defaultCollectionName = "Default";
    Constants.unfiledNotebookName = "Unfiled";
    Constants.allNotesNotebookId = "0";
    Constants.unfiledNotesNotebookId = "1";
    Constants.allCategory = "all";
    Constants.todayCategory = "today";
    Constants.yesterdayCategory = "yesterday";
    Constants.thisWeekCategory = "thisweek";
    Constants.markedCategory = "marked";
    Constants.externalComponents = [
        { name: "Angular", description: "Angular is a development platform for building mobile and desktop web applications using Typescript/JavaScript and other languages.", url: "https://angular.io/", licenseUrl: "https://github.com/angular/angular/blob/master/LICENSE" },
        { name: "Electron", description: "The Electron framework lets you write cross-platform desktop applications using JavaScript, HTML and CSS. It is based on Node.js and Chromium.", url: "https://electronjs.org/", licenseUrl: "https://github.com/electron/electron/blob/master/LICENSE" },
        { name: "Electron-log", description: "Just a simple logging module for your Electron or NW.js application. No dependencies. No complicated configuration. Just require and use. It can be used without Electron.", url: "https://github.com/megahertz/electron-log", licenseUrl: "https://github.com/megahertz/electron-log/blob/master/LICENSE" }
    ];
    return Constants;
}());
exports.Constants = Constants;
//# sourceMappingURL=constants.js.map