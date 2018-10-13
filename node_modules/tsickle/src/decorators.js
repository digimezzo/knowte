/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/decorators", ["require", "exports", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("tsickle/src/typescript");
    /**
     * Returns the declarations for the given decorator.
     */
    function getDecoratorDeclarations(decorator, typeChecker) {
        // Walk down the expression to find the identifier of the decorator function.
        var node = decorator;
        while (node.kind !== ts.SyntaxKind.Identifier) {
            if (node.kind === ts.SyntaxKind.Decorator || node.kind === ts.SyntaxKind.CallExpression) {
                node = node.expression;
            }
            else {
                // We do not know how to handle this type of decorator.
                return [];
            }
        }
        var decSym = typeChecker.getSymbolAtLocation(node);
        if (!decSym)
            return [];
        if (decSym.flags & ts.SymbolFlags.Alias) {
            decSym = typeChecker.getAliasedSymbol(decSym);
        }
        return decSym.getDeclarations() || [];
    }
    exports.getDecoratorDeclarations = getDecoratorDeclarations;
    /**
     * Returns true if node has an exporting decorator  (i.e., a decorator with @ExportDecoratedItems
     * in its JSDoc).
     */
    function hasExportingDecorator(node, typeChecker) {
        return node.decorators &&
            node.decorators.some(function (decorator) { return isExportingDecorator(decorator, typeChecker); });
    }
    exports.hasExportingDecorator = hasExportingDecorator;
    /**
     * Returns true if the given decorator has an @ExportDecoratedItems directive in its JSDoc.
     */
    function isExportingDecorator(decorator, typeChecker) {
        return getDecoratorDeclarations(decorator, typeChecker).some(function (declaration) {
            var e_1, _a;
            var range = ts.getLeadingCommentRanges(declaration.getFullText(), 0);
            if (!range) {
                return false;
            }
            try {
                for (var range_1 = __values(range), range_1_1 = range_1.next(); !range_1_1.done; range_1_1 = range_1.next()) {
                    var _b = range_1_1.value, pos = _b.pos, end = _b.end;
                    if (/@ExportDecoratedItems\b/.test(declaration.getFullText().substring(pos, end))) {
                        return true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (range_1_1 && !range_1_1.done && (_a = range_1.return)) _a.call(range_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return false;
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILDJDQUFtQztJQUVuQzs7T0FFRztJQUNILGtDQUNJLFNBQXVCLEVBQUUsV0FBMkI7UUFDdEQsNkVBQTZFO1FBQzdFLElBQUksSUFBSSxHQUFZLFNBQVMsQ0FBQztRQUM5QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDN0MsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUU7Z0JBQ3ZGLElBQUksR0FBSSxJQUF5QyxDQUFDLFVBQVUsQ0FBQzthQUM5RDtpQkFBTTtnQkFDTCx1REFBdUQ7Z0JBQ3ZELE9BQU8sRUFBRSxDQUFDO2FBQ1g7U0FDRjtRQUVELElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLElBQUksTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtZQUN2QyxNQUFNLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsT0FBTyxNQUFNLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFuQkQsNERBbUJDO0lBRUQ7OztPQUdHO0lBQ0gsK0JBQXNDLElBQWEsRUFBRSxXQUEyQjtRQUM5RSxPQUFPLElBQUksQ0FBQyxVQUFVO1lBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsb0JBQW9CLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUE1QyxDQUE0QyxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUhELHNEQUdDO0lBRUQ7O09BRUc7SUFDSCw4QkFBOEIsU0FBdUIsRUFBRSxXQUEyQjtRQUNoRixPQUFPLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxXQUFXOztZQUN0RSxJQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1YsT0FBTyxLQUFLLENBQUM7YUFDZDs7Z0JBQ0QsS0FBeUIsSUFBQSxVQUFBLFNBQUEsS0FBSyxDQUFBLDRCQUFBLCtDQUFFO29CQUFyQixJQUFBLG9CQUFVLEVBQVQsWUFBRyxFQUFFLFlBQUc7b0JBQ2xCLElBQUkseUJBQXlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUU7d0JBQ2pGLE9BQU8sSUFBSSxDQUFDO3FCQUNiO2lCQUNGOzs7Ozs7Ozs7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkZWNsYXJhdGlvbnMgZm9yIHRoZSBnaXZlbiBkZWNvcmF0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWNvcmF0b3JEZWNsYXJhdGlvbnMoXG4gICAgZGVjb3JhdG9yOiB0cy5EZWNvcmF0b3IsIHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlcik6IHRzLkRlY2xhcmF0aW9uW10ge1xuICAvLyBXYWxrIGRvd24gdGhlIGV4cHJlc3Npb24gdG8gZmluZCB0aGUgaWRlbnRpZmllciBvZiB0aGUgZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICBsZXQgbm9kZTogdHMuTm9kZSA9IGRlY29yYXRvcjtcbiAgd2hpbGUgKG5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5EZWNvcmF0b3IgfHwgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSB7XG4gICAgICBub2RlID0gKG5vZGUgYXMgdHMuRGVjb3JhdG9yIHwgdHMuQ2FsbEV4cHJlc3Npb24pLmV4cHJlc3Npb247XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIGRvIG5vdCBrbm93IGhvdyB0byBoYW5kbGUgdGhpcyB0eXBlIG9mIGRlY29yYXRvci5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBsZXQgZGVjU3ltID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihub2RlKTtcbiAgaWYgKCFkZWNTeW0pIHJldHVybiBbXTtcbiAgaWYgKGRlY1N5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgZGVjU3ltID0gdHlwZUNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChkZWNTeW0pO1xuICB9XG4gIHJldHVybiBkZWNTeW0uZ2V0RGVjbGFyYXRpb25zKCkgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIG5vZGUgaGFzIGFuIGV4cG9ydGluZyBkZWNvcmF0b3IgIChpLmUuLCBhIGRlY29yYXRvciB3aXRoIEBFeHBvcnREZWNvcmF0ZWRJdGVtc1xuICogaW4gaXRzIEpTRG9jKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc0V4cG9ydGluZ0RlY29yYXRvcihub2RlOiB0cy5Ob2RlLCB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpIHtcbiAgcmV0dXJuIG5vZGUuZGVjb3JhdG9ycyAmJlxuICAgICAgbm9kZS5kZWNvcmF0b3JzLnNvbWUoZGVjb3JhdG9yID0+IGlzRXhwb3J0aW5nRGVjb3JhdG9yKGRlY29yYXRvciwgdHlwZUNoZWNrZXIpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGRlY29yYXRvciBoYXMgYW4gQEV4cG9ydERlY29yYXRlZEl0ZW1zIGRpcmVjdGl2ZSBpbiBpdHMgSlNEb2MuXG4gKi9cbmZ1bmN0aW9uIGlzRXhwb3J0aW5nRGVjb3JhdG9yKGRlY29yYXRvcjogdHMuRGVjb3JhdG9yLCB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpIHtcbiAgcmV0dXJuIGdldERlY29yYXRvckRlY2xhcmF0aW9ucyhkZWNvcmF0b3IsIHR5cGVDaGVja2VyKS5zb21lKGRlY2xhcmF0aW9uID0+IHtcbiAgICBjb25zdCByYW5nZSA9IHRzLmdldExlYWRpbmdDb21tZW50UmFuZ2VzKGRlY2xhcmF0aW9uLmdldEZ1bGxUZXh0KCksIDApO1xuICAgIGlmICghcmFuZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChjb25zdCB7cG9zLCBlbmR9IG9mIHJhbmdlKSB7XG4gICAgICBpZiAoL0BFeHBvcnREZWNvcmF0ZWRJdGVtc1xcYi8udGVzdChkZWNsYXJhdGlvbi5nZXRGdWxsVGV4dCgpLnN1YnN0cmluZyhwb3MsIGVuZCkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufVxuIl19