/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/modules_manifest", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** A class that maintains the module dependency graph of output JS files. */
    var ModulesManifest = /** @class */ (function () {
        function ModulesManifest() {
            /** Map of googmodule module name to file name */
            this.moduleToFileName = {};
            /** Map of file name to arrays of imported googmodule module names */
            this.referencedModules = {};
        }
        ModulesManifest.prototype.addManifest = function (other) {
            Object.assign(this.moduleToFileName, other.moduleToFileName);
            Object.assign(this.referencedModules, other.referencedModules);
        };
        ModulesManifest.prototype.addModule = function (fileName, module) {
            this.moduleToFileName[module] = fileName;
            this.referencedModules[fileName] = [];
        };
        ModulesManifest.prototype.addReferencedModule = function (fileName, resolvedModule) {
            this.referencedModules[fileName].push(resolvedModule);
        };
        Object.defineProperty(ModulesManifest.prototype, "modules", {
            get: function () {
                return Object.keys(this.moduleToFileName);
            },
            enumerable: true,
            configurable: true
        });
        ModulesManifest.prototype.getFileNameFromModule = function (module) {
            return this.moduleToFileName[module];
        };
        Object.defineProperty(ModulesManifest.prototype, "fileNames", {
            get: function () {
                return Object.keys(this.referencedModules);
            },
            enumerable: true,
            configurable: true
        });
        ModulesManifest.prototype.getReferencedModules = function (fileName) {
            return this.referencedModules[fileName];
        };
        return ModulesManifest;
    }());
    exports.ModulesManifest = ModulesManifest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlc19tYW5pZmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzX21hbmlmZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBSUgsNkVBQTZFO0lBQzdFO1FBQUE7WUFDRSxpREFBaUQ7WUFDekMscUJBQWdCLEdBQW9CLEVBQUUsQ0FBQztZQUMvQyxxRUFBcUU7WUFDN0Qsc0JBQWlCLEdBQXNCLEVBQUUsQ0FBQztRQStCcEQsQ0FBQztRQTdCQyxxQ0FBVyxHQUFYLFVBQVksS0FBc0I7WUFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELG1DQUFTLEdBQVQsVUFBVSxRQUFnQixFQUFFLE1BQWM7WUFDeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFRCw2Q0FBbUIsR0FBbkIsVUFBb0IsUUFBZ0IsRUFBRSxjQUFzQjtZQUMxRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRCxzQkFBSSxvQ0FBTztpQkFBWDtnQkFDRSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUMsQ0FBQzs7O1dBQUE7UUFFRCwrQ0FBcUIsR0FBckIsVUFBc0IsTUFBYztZQUNsQyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsc0JBQUksc0NBQVM7aUJBQWI7Z0JBQ0UsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzdDLENBQUM7OztXQUFBO1FBRUQsOENBQW9CLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ25DLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDSCxzQkFBQztJQUFELENBQUMsQUFuQ0QsSUFtQ0M7SUFuQ1ksMENBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZU1hcDxUPiB7IFtmaWxlTmFtZTogc3RyaW5nXTogVDsgfVxuXG4vKiogQSBjbGFzcyB0aGF0IG1haW50YWlucyB0aGUgbW9kdWxlIGRlcGVuZGVuY3kgZ3JhcGggb2Ygb3V0cHV0IEpTIGZpbGVzLiAqL1xuZXhwb3J0IGNsYXNzIE1vZHVsZXNNYW5pZmVzdCB7XG4gIC8qKiBNYXAgb2YgZ29vZ21vZHVsZSBtb2R1bGUgbmFtZSB0byBmaWxlIG5hbWUgKi9cbiAgcHJpdmF0ZSBtb2R1bGVUb0ZpbGVOYW1lOiBGaWxlTWFwPHN0cmluZz4gPSB7fTtcbiAgLyoqIE1hcCBvZiBmaWxlIG5hbWUgdG8gYXJyYXlzIG9mIGltcG9ydGVkIGdvb2dtb2R1bGUgbW9kdWxlIG5hbWVzICovXG4gIHByaXZhdGUgcmVmZXJlbmNlZE1vZHVsZXM6IEZpbGVNYXA8c3RyaW5nW10+ID0ge307XG5cbiAgYWRkTWFuaWZlc3Qob3RoZXI6IE1vZHVsZXNNYW5pZmVzdCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2R1bGVUb0ZpbGVOYW1lLCBvdGhlci5tb2R1bGVUb0ZpbGVOYW1lKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMucmVmZXJlbmNlZE1vZHVsZXMsIG90aGVyLnJlZmVyZW5jZWRNb2R1bGVzKTtcbiAgfVxuXG4gIGFkZE1vZHVsZShmaWxlTmFtZTogc3RyaW5nLCBtb2R1bGU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMubW9kdWxlVG9GaWxlTmFtZVttb2R1bGVdID0gZmlsZU5hbWU7XG4gICAgdGhpcy5yZWZlcmVuY2VkTW9kdWxlc1tmaWxlTmFtZV0gPSBbXTtcbiAgfVxuXG4gIGFkZFJlZmVyZW5jZWRNb2R1bGUoZmlsZU5hbWU6IHN0cmluZywgcmVzb2x2ZWRNb2R1bGU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucmVmZXJlbmNlZE1vZHVsZXNbZmlsZU5hbWVdLnB1c2gocmVzb2x2ZWRNb2R1bGUpO1xuICB9XG5cbiAgZ2V0IG1vZHVsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLm1vZHVsZVRvRmlsZU5hbWUpO1xuICB9XG5cbiAgZ2V0RmlsZU5hbWVGcm9tTW9kdWxlKG1vZHVsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5tb2R1bGVUb0ZpbGVOYW1lW21vZHVsZV07XG4gIH1cblxuICBnZXQgZmlsZU5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5yZWZlcmVuY2VkTW9kdWxlcyk7XG4gIH1cblxuICBnZXRSZWZlcmVuY2VkTW9kdWxlcyhmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZWRNb2R1bGVzW2ZpbGVOYW1lXTtcbiAgfVxufVxuIl19