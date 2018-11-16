"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var electron_1 = require("electron");
var Datastore = require("nedb");
var NoteStore = /** @class */ (function () {
    function NoteStore() {
        this.databaseFile = path.join(electron_1.app.getPath("userData"), "Notes.db");
        this.db = new Datastore({ filename: this.databaseFile, autoload: true });
    }
    return NoteStore;
}());
exports.NoteStore = NoteStore;
//# sourceMappingURL=noteStore.js.map