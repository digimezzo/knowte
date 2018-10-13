"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./alias"));
__export(require("./buffer"));
__export(require("./interface"));
__export(require("./memory"));
__export(require("./pattern"));
__export(require("./scoped"));
__export(require("./sync"));
const test = require("./test");
exports.test = test;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2NvcmUvc3JjL3ZpcnR1YWwtZnMvaG9zdC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7OztBQUVILDZCQUF3QjtBQUN4Qiw4QkFBeUI7QUFDekIsaUNBQTRCO0FBQzVCLDhCQUF5QjtBQUN6QiwrQkFBMEI7QUFDMUIsOEJBQXlCO0FBQ3pCLDRCQUF1QjtBQUV2QiwrQkFBK0I7QUFFdEIsb0JBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vYWxpYXMnO1xuZXhwb3J0ICogZnJvbSAnLi9idWZmZXInO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9tZW1vcnknO1xuZXhwb3J0ICogZnJvbSAnLi9wYXR0ZXJuJztcbmV4cG9ydCAqIGZyb20gJy4vc2NvcGVkJztcbmV4cG9ydCAqIGZyb20gJy4vc3luYyc7XG5cbmltcG9ydCAqIGFzIHRlc3QgZnJvbSAnLi90ZXN0JztcblxuZXhwb3J0IHsgdGVzdCB9O1xuIl19