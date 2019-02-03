"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var CollectionServiceMessenger = /** @class */ (function () {
    function CollectionServiceMessenger() {
        this.noteMarkChanged = new rxjs_1.Subject();
        this.noteMarkChanged$ = this.noteMarkChanged.asObservable();
    }
    return CollectionServiceMessenger;
}());
exports.CollectionServiceMessenger = CollectionServiceMessenger;
//# sourceMappingURL=collectionServiceMessenger.js.map