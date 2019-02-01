"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var nanoid = require("nanoid");
var Note = /** @class */ (function () {
    function Note(title, notebookId, collectionId) {
        this.title = title;
        this.notebookId = notebookId;
        this.collectionId = collectionId;
        this.id = nanoid();
        this.isOpen = false;
        this.isMarked = false;
        this.creationDate = moment().valueOf();
        this.modificationDate = moment().valueOf();
    }
    return Note;
}());
exports.Note = Note;
//# sourceMappingURL=note.js.map