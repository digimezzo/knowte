"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nanoid = require("nanoid");
var Notebook = /** @class */ (function () {
    function Notebook(name) {
        this.name = name;
        this.id = nanoid();
        this.isDefault = false;
    }
    return Notebook;
}());
exports.Notebook = Notebook;
//# sourceMappingURL=notebook.js.map