"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var nanoid = require("nanoid");
var Note = /** @class */ (function () {
    function Note(title, notebookId) {
        this.title = title;
        this.notebookId = notebookId;
        this.id = nanoid();
        this.isMarked = false;
        this.creationDate = moment().valueOf();
        this.modificationDate = moment().valueOf();
        this.isOpen = false;
        this.text = "";
    }
    return Note;
}());
exports.Note = Note;
//# sourceMappingURL=note.js.map