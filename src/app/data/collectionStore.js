"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var electron_1 = require("electron");
var Datastore = require("nedb");
var CollectionStore = /** @class */ (function () {
    function CollectionStore() {
        this.databaseFile = path.join(electron_1.app.getPath("userData"), "Collections.db");
        this.db = new Datastore({ filename: this.databaseFile, autoload: true });
    }
    return CollectionStore;
}());
exports.CollectionStore = CollectionStore;
//# sourceMappingURL=collectionStore.js.map