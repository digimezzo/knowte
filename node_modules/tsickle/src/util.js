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
        define("tsickle/src/util", ["require", "exports", "path", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // toArray is a temporary function to help in the use of
    // ES6 maps and sets when running on node 4, which doesn't
    // support Iterators completely.
    var path = require("path");
    var ts = require("typescript");
    /**
     * Constructs a new ts.CompilerHost that overlays sources in substituteSource
     * over another ts.CompilerHost.
     *
     * @param substituteSource A map of source file name -> overlay source text.
     */
    function createSourceReplacingCompilerHost(substituteSource, delegate) {
        return {
            getSourceFile: getSourceFile,
            getCancellationToken: delegate.getCancellationToken,
            getDefaultLibFileName: delegate.getDefaultLibFileName,
            writeFile: delegate.writeFile,
            getCurrentDirectory: delegate.getCurrentDirectory,
            getCanonicalFileName: delegate.getCanonicalFileName,
            useCaseSensitiveFileNames: delegate.useCaseSensitiveFileNames,
            getNewLine: delegate.getNewLine,
            fileExists: delegate.fileExists,
            readFile: delegate.readFile,
            directoryExists: delegate.directoryExists,
            getDirectories: delegate.getDirectories,
        };
        function getSourceFile(fileName, languageVersion, onError) {
            var path = ts.sys.resolvePath(fileName);
            var sourceText = substituteSource.get(path);
            if (sourceText !== undefined) {
                return ts.createSourceFile(fileName, sourceText, languageVersion);
            }
            return delegate.getSourceFile(path, languageVersion, onError);
        }
    }
    exports.createSourceReplacingCompilerHost = createSourceReplacingCompilerHost;
    /**
     * Returns the input string with line endings normalized to '\n'.
     */
    function normalizeLineEndings(input) {
        return input.replace(/\r\n/g, '\n');
    }
    exports.normalizeLineEndings = normalizeLineEndings;
    /** @return true if node has the specified modifier flag set. */
    function hasModifierFlag(node, flag) {
        return (ts.getCombinedModifierFlags(node) & flag) !== 0;
    }
    exports.hasModifierFlag = hasModifierFlag;
    function isDtsFileName(fileName) {
        return /\.d\.ts$/.test(fileName);
    }
    exports.isDtsFileName = isDtsFileName;
    /**
     * Determine the lowest-level common parent directory of the given list of files.
     */
    function getCommonParentDirectory(fileNames) {
        var pathSplitter = /[\/\\]+/;
        var commonParent = fileNames[0].split(pathSplitter);
        for (var i = 1; i < fileNames.length; i++) {
            var thisPath = fileNames[i].split(pathSplitter);
            var j = 0;
            while (thisPath[j] === commonParent[j]) {
                j++;
            }
            commonParent.length = j; // Truncate without copying the array
        }
        if (commonParent.length === 0) {
            return '/';
        }
        else {
            return commonParent.join(path.sep);
        }
    }
    exports.getCommonParentDirectory = getCommonParentDirectory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsd0RBQXdEO0lBQ3hELDBEQUEwRDtJQUMxRCxnQ0FBZ0M7SUFFaEMsMkJBQTZCO0lBQzdCLCtCQUFpQztJQUVqQzs7Ozs7T0FLRztJQUNILDJDQUNJLGdCQUFxQyxFQUFFLFFBQXlCO1FBQ2xFLE9BQU87WUFDTCxhQUFhLGVBQUE7WUFDYixvQkFBb0IsRUFBRSxRQUFRLENBQUMsb0JBQW9CO1lBQ25ELHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxxQkFBcUI7WUFDckQsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO1lBQzdCLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxtQkFBbUI7WUFDakQsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLG9CQUFvQjtZQUNuRCx5QkFBeUIsRUFBRSxRQUFRLENBQUMseUJBQXlCO1lBQzdELFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVTtZQUMvQixVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7WUFDL0IsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO1lBQzNCLGVBQWUsRUFBRSxRQUFRLENBQUMsZUFBZTtZQUN6QyxjQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWM7U0FDeEMsQ0FBQztRQUVGLHVCQUNJLFFBQWdCLEVBQUUsZUFBZ0MsRUFDbEQsT0FBbUM7WUFDckMsSUFBTSxJQUFJLEdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEQsSUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDNUIsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNuRTtZQUNELE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFLENBQUM7SUFDSCxDQUFDO0lBM0JELDhFQTJCQztJQUVEOztPQUVHO0lBQ0gsOEJBQXFDLEtBQWE7UUFDaEQsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRkQsb0RBRUM7SUFFRCxnRUFBZ0U7SUFDaEUseUJBQWdDLElBQWEsRUFBRSxJQUFzQjtRQUNuRSxPQUFPLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRkQsMENBRUM7SUFFRCx1QkFBOEIsUUFBZ0I7UUFDNUMsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFGRCxzQ0FFQztJQUVEOztPQUVHO0lBQ0gsa0NBQXlDLFNBQW1CO1FBQzFELElBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQztRQUMvQixJQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pDLElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN0QyxDQUFDLEVBQUUsQ0FBQzthQUNMO1lBQ0QsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBRSxxQ0FBcUM7U0FDaEU7UUFDRCxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzdCLE9BQU8sR0FBRyxDQUFDO1NBQ1o7YUFBTTtZQUNMLE9BQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEM7SUFDSCxDQUFDO0lBaEJELDREQWdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gdG9BcnJheSBpcyBhIHRlbXBvcmFyeSBmdW5jdGlvbiB0byBoZWxwIGluIHRoZSB1c2Ugb2Zcbi8vIEVTNiBtYXBzIGFuZCBzZXRzIHdoZW4gcnVubmluZyBvbiBub2RlIDQsIHdoaWNoIGRvZXNuJ3Rcbi8vIHN1cHBvcnQgSXRlcmF0b3JzIGNvbXBsZXRlbHkuXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgbmV3IHRzLkNvbXBpbGVySG9zdCB0aGF0IG92ZXJsYXlzIHNvdXJjZXMgaW4gc3Vic3RpdHV0ZVNvdXJjZVxuICogb3ZlciBhbm90aGVyIHRzLkNvbXBpbGVySG9zdC5cbiAqXG4gKiBAcGFyYW0gc3Vic3RpdHV0ZVNvdXJjZSBBIG1hcCBvZiBzb3VyY2UgZmlsZSBuYW1lIC0+IG92ZXJsYXkgc291cmNlIHRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTb3VyY2VSZXBsYWNpbmdDb21waWxlckhvc3QoXG4gICAgc3Vic3RpdHV0ZVNvdXJjZTogTWFwPHN0cmluZywgc3RyaW5nPiwgZGVsZWdhdGU6IHRzLkNvbXBpbGVySG9zdCk6IHRzLkNvbXBpbGVySG9zdCB7XG4gIHJldHVybiB7XG4gICAgZ2V0U291cmNlRmlsZSxcbiAgICBnZXRDYW5jZWxsYXRpb25Ub2tlbjogZGVsZWdhdGUuZ2V0Q2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgZ2V0RGVmYXVsdExpYkZpbGVOYW1lOiBkZWxlZ2F0ZS5nZXREZWZhdWx0TGliRmlsZU5hbWUsXG4gICAgd3JpdGVGaWxlOiBkZWxlZ2F0ZS53cml0ZUZpbGUsXG4gICAgZ2V0Q3VycmVudERpcmVjdG9yeTogZGVsZWdhdGUuZ2V0Q3VycmVudERpcmVjdG9yeSxcbiAgICBnZXRDYW5vbmljYWxGaWxlTmFtZTogZGVsZWdhdGUuZ2V0Q2Fub25pY2FsRmlsZU5hbWUsXG4gICAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lczogZGVsZWdhdGUudXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcyxcbiAgICBnZXROZXdMaW5lOiBkZWxlZ2F0ZS5nZXROZXdMaW5lLFxuICAgIGZpbGVFeGlzdHM6IGRlbGVnYXRlLmZpbGVFeGlzdHMsXG4gICAgcmVhZEZpbGU6IGRlbGVnYXRlLnJlYWRGaWxlLFxuICAgIGRpcmVjdG9yeUV4aXN0czogZGVsZWdhdGUuZGlyZWN0b3J5RXhpc3RzLFxuICAgIGdldERpcmVjdG9yaWVzOiBkZWxlZ2F0ZS5nZXREaXJlY3RvcmllcyxcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRTb3VyY2VGaWxlKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgbGFuZ3VhZ2VWZXJzaW9uOiB0cy5TY3JpcHRUYXJnZXQsXG4gICAgICBvbkVycm9yPzogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCk6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBwYXRoOiBzdHJpbmcgPSB0cy5zeXMucmVzb2x2ZVBhdGgoZmlsZU5hbWUpO1xuICAgIGNvbnN0IHNvdXJjZVRleHQgPSBzdWJzdGl0dXRlU291cmNlLmdldChwYXRoKTtcbiAgICBpZiAoc291cmNlVGV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShmaWxlTmFtZSwgc291cmNlVGV4dCwgbGFuZ3VhZ2VWZXJzaW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlbGVnYXRlLmdldFNvdXJjZUZpbGUocGF0aCwgbGFuZ3VhZ2VWZXJzaW9uLCBvbkVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGlucHV0IHN0cmluZyB3aXRoIGxpbmUgZW5kaW5ncyBub3JtYWxpemVkIHRvICdcXG4nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplTGluZUVuZGluZ3MoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xufVxuXG4vKiogQHJldHVybiB0cnVlIGlmIG5vZGUgaGFzIHRoZSBzcGVjaWZpZWQgbW9kaWZpZXIgZmxhZyBzZXQuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTW9kaWZpZXJGbGFnKG5vZGU6IHRzLk5vZGUsIGZsYWc6IHRzLk1vZGlmaWVyRmxhZ3MpOiBib29sZWFuIHtcbiAgcmV0dXJuICh0cy5nZXRDb21iaW5lZE1vZGlmaWVyRmxhZ3Mobm9kZSkgJiBmbGFnKSAhPT0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHRzRmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gL1xcLmRcXC50cyQvLnRlc3QoZmlsZU5hbWUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSB0aGUgbG93ZXN0LWxldmVsIGNvbW1vbiBwYXJlbnQgZGlyZWN0b3J5IG9mIHRoZSBnaXZlbiBsaXN0IG9mIGZpbGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbW9uUGFyZW50RGlyZWN0b3J5KGZpbGVOYW1lczogc3RyaW5nW10pOiBzdHJpbmcge1xuICBjb25zdCBwYXRoU3BsaXR0ZXIgPSAvW1xcL1xcXFxdKy87XG4gIGNvbnN0IGNvbW1vblBhcmVudCA9IGZpbGVOYW1lc1swXS5zcGxpdChwYXRoU3BsaXR0ZXIpO1xuICBmb3IgKGxldCBpID0gMTsgaSA8IGZpbGVOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHRoaXNQYXRoID0gZmlsZU5hbWVzW2ldLnNwbGl0KHBhdGhTcGxpdHRlcik7XG4gICAgbGV0IGogPSAwO1xuICAgIHdoaWxlICh0aGlzUGF0aFtqXSA9PT0gY29tbW9uUGFyZW50W2pdKSB7XG4gICAgICBqKys7XG4gICAgfVxuICAgIGNvbW1vblBhcmVudC5sZW5ndGggPSBqOyAgLy8gVHJ1bmNhdGUgd2l0aG91dCBjb3B5aW5nIHRoZSBhcnJheVxuICB9XG4gIGlmIChjb21tb25QYXJlbnQubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICcvJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29tbW9uUGFyZW50LmpvaW4ocGF0aC5zZXApO1xuICB9XG59XG4iXX0=