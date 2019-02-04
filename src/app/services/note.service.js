"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var NoteService = /** @class */ (function () {
    function NoteService() {
        this.noteRenamed = new rxjs_1.Subject();
        this.noteRenamed$ = this.noteRenamed.asObservable();
    }
    return NoteService;
}());
exports.NoteService = NoteService;
//# sourceMappingURL=note.service.js.map