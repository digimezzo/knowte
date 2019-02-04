"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
/**
 * Angular services cannot be configured as singletons across Electron windows. So we use this class, which we
 * set as a global main process variable, and then use it as a app-wide singleton to send events across windows.
 */
var NoteService = /** @class */ (function () {
    function NoteService() {
        this.openNoteIds = [];
        this.noteRenamed = new rxjs_1.Subject();
        this.noteRenamed$ = this.noteRenamed.asObservable();
    }
    NoteService.prototype.openNote = function (noteId) {
        if (!this.openNoteIds.includes(noteId)) {
            this.openNoteIds.push(noteId);
        }
    };
    NoteService.prototype.closeNote = function (noteId) {
        if (this.openNoteIds.includes(noteId)) {
            this.openNoteIds.splice(this.openNoteIds.indexOf(noteId), 1);
        }
    };
    NoteService.prototype.noteIsOpen = function (noteId) {
        return this.openNoteIds.includes(noteId);
    };
    return NoteService;
}());
exports.NoteService = NoteService;
//# sourceMappingURL=note.service.js.map