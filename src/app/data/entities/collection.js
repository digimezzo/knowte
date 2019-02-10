"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nanoid = require("nanoid");
var Collection = /** @class */ (function () {
    function Collection(name, isActive) {
        this.name = name;
        this.isActive = isActive;
        this.id = nanoid();
    }
    return Collection;
}());
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map