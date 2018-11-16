"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var electron_1 = require("electron");
var Datastore = require("nedb");
var NotebookStore = /** @class */ (function () {
    function NotebookStore() {
        this.databaseFile = path.join(electron_1.app.getPath("userData"), "Notebooks.db");
        this.db = new Datastore({ filename: this.databaseFile, autoload: true });
    }
    return NotebookStore;
}());
exports.NotebookStore = NotebookStore;
//# sourceMappingURL=notebookStore.js.map