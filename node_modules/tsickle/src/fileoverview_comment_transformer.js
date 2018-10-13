/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/fileoverview_comment_transformer", ["require", "exports", "tsickle/src/jsdoc", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jsdoc = require("tsickle/src/jsdoc");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * A set of JSDoc tags that mark a comment as a fileoverview comment. These are recognized by other
     * pieces of infrastructure (Closure Compiler, module system, ...).
     */
    var FILEOVERVIEW_COMMENT_MARKERS = new Set(['fileoverview', 'externs', 'modName', 'mods', 'pintomodule']);
    /**
     * Returns true if the given comment is a \@fileoverview style comment in the Closure sense, i.e. a
     * comment that has JSDoc tags marking it as a fileoverview comment.
     * Note that this is different from TypeScript's understanding of the concept, where a file comment
     * is a comment separated from the rest of the file by a double newline.
     */
    function isClosureFileoverviewComment(text) {
        var current = jsdoc.parse(text);
        return current !== null && current.tags.some(function (t) { return FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName); });
    }
    exports.isClosureFileoverviewComment = isClosureFileoverviewComment;
    /**
     * Given a parsed @fileoverview comment, ensures it has all the attributes we need.
     * This function can be called to modify an existing comment or to make a new one.
     *
     * @param tags Comment as parsed list of tags; modified in-place.
     */
    function augmentFileoverviewComments(tags) {
        // Ensure we start with a @fileoverview.
        if (!tags.find(function (t) { return t.tagName === 'fileoverview'; })) {
            tags.splice(0, 0, { tagName: 'fileoverview', text: 'added by tsickle' });
        }
        // Find or create a @suppress tag.
        // Closure compiler barfs if there's a duplicated @suppress tag in a file, so the tag must
        // only appear once and be merged.
        var suppressTag = tags.find(function (t) { return t.tagName === 'suppress'; });
        var suppressions;
        if (suppressTag) {
            suppressions = new Set((suppressTag.type || '').split(',').map(function (s) { return s.trim(); }));
        }
        else {
            suppressTag = { tagName: 'suppress', text: 'checked by tsc' };
            tags.push(suppressTag);
            suppressions = new Set();
        }
        // Ensure our suppressions are included in the @suppress tag:
        // 1) Suppress checkTypes.  We believe the code has already been type-checked by TypeScript,
        // and we cannot model all the TypeScript type decisions in Closure syntax.
        suppressions.add('checkTypes');
        // 2) Suppress extraRequire.  We remove extra requires at the TypeScript level, so any require
        // that gets to the JS level is a load-bearing require.
        suppressions.add('extraRequire');
        // 3) Suppress uselessCode.  We emit an "if (false)" around type declarations,
        // which is flagged as unused code unless we suppress it.
        suppressions.add('uselessCode');
        suppressTag.type = Array.from(suppressions.values()).sort().join(',');
        return tags;
    }
    /**
     * A transformer that ensures the emitted JS file has an \@fileoverview comment that contains an
     * \@suppress {checkTypes} annotation by either adding or updating an existing comment.
     */
    function transformFileoverviewComment(context) {
        return function (sf) {
            var comments = [];
            // Use trailing comments because that's what transformer_util.ts creates (i.e. by convention).
            if (sf.statements.length && sf.statements[0].kind === ts.SyntaxKind.NotEmittedStatement) {
                comments = ts.getSyntheticTrailingComments(sf.statements[0]) || [];
            }
            // Closure Compiler considers the *last* comment with @fileoverview (or @externs or @nocompile)
            // that has not been attached to some other tree node to be the file overview comment, and
            // only applies @suppress tags from it.
            // AJD considers *any* comment mentioning @fileoverview.
            var fileoverviewIdx = -1;
            var tags = [];
            for (var i = comments.length - 1; i >= 0; i--) {
                var parse = jsdoc.parseContents(comments[i].text);
                if (parse !== null && parse.tags.some(function (t) { return FILEOVERVIEW_COMMENT_MARKERS.has(t.tagName); })) {
                    fileoverviewIdx = i;
                    tags = parse.tags;
                    break;
                }
            }
            augmentFileoverviewComments(tags);
            var commentText = jsdoc.toStringWithoutStartEnd(tags);
            if (fileoverviewIdx < 0) {
                // No existing comment to merge with, just emit a new one.
                return addNewFileoverviewComment(sf, commentText);
            }
            comments[fileoverviewIdx].text = commentText;
            // sf does not need to be updated, synthesized comments are mutable.
            return sf;
        };
    }
    exports.transformFileoverviewComment = transformFileoverviewComment;
    function addNewFileoverviewComment(sf, commentText) {
        var syntheticFirstStatement = transformer_util_1.createNotEmittedStatement(sf);
        syntheticFirstStatement = ts.addSyntheticTrailingComment(syntheticFirstStatement, ts.SyntaxKind.MultiLineCommentTrivia, commentText, true);
        return transformer_util_1.updateSourceFileNode(sf, ts.createNodeArray(__spread([syntheticFirstStatement], sf.statements)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZmlsZW92ZXJ2aWV3X2NvbW1lbnRfdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILHlDQUFpQztJQUNqQyxpRUFBbUY7SUFDbkYsMkNBQW1DO0lBRW5DOzs7T0FHRztJQUNILElBQU0sNEJBQTRCLEdBQzlCLElBQUksR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFFM0U7Ozs7O09BS0c7SUFDSCxzQ0FBNkMsSUFBWTtRQUN2RCxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sT0FBTyxLQUFLLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQTNDLENBQTJDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBSEQsb0VBR0M7SUFFRDs7Ozs7T0FLRztJQUNILHFDQUFxQyxJQUFpQjtRQUNwRCx3Q0FBd0M7UUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxLQUFLLGNBQWMsRUFBNUIsQ0FBNEIsQ0FBQyxFQUFFO1lBQ2pELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFDLENBQUMsQ0FBQztTQUN4RTtRQUVELGtDQUFrQztRQUNsQywwRkFBMEY7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LENBQUMsRUFBRTtnQkFDdkIsMERBQTBEO2dCQUMxRCxPQUFPLHlCQUF5QixDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNuRDtZQUVELFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDO1lBQzdDLG9FQUFvRTtZQUNwRSxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUMsQ0FBQztJQUNKLENBQUM7SUFwQ0Qsb0VBb0NDO0lBRUQsbUNBQW1DLEVBQWlCLEVBQUUsV0FBbUI7UUFDdkUsSUFBSSx1QkFBdUIsR0FBRyw0Q0FBeUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RCx1QkFBdUIsR0FBRyxFQUFFLENBQUMsMkJBQTJCLENBQ3BELHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RGLE9BQU8sdUNBQW9CLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxlQUFlLFdBQUUsdUJBQXVCLEdBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDbkcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMganNkb2MgZnJvbSAnLi9qc2RvYyc7XG5pbXBvcnQge2NyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQsIHVwZGF0ZVNvdXJjZUZpbGVOb2RlfSBmcm9tICcuL3RyYW5zZm9ybWVyX3V0aWwnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBBIHNldCBvZiBKU0RvYyB0YWdzIHRoYXQgbWFyayBhIGNvbW1lbnQgYXMgYSBmaWxlb3ZlcnZpZXcgY29tbWVudC4gVGhlc2UgYXJlIHJlY29nbml6ZWQgYnkgb3RoZXJcbiAqIHBpZWNlcyBvZiBpbmZyYXN0cnVjdHVyZSAoQ2xvc3VyZSBDb21waWxlciwgbW9kdWxlIHN5c3RlbSwgLi4uKS5cbiAqL1xuY29uc3QgRklMRU9WRVJWSUVXX0NPTU1FTlRfTUFSS0VSUzogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9XG4gICAgbmV3IFNldChbJ2ZpbGVvdmVydmlldycsICdleHRlcm5zJywgJ21vZE5hbWUnLCAnbW9kcycsICdwaW50b21vZHVsZSddKTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGNvbW1lbnQgaXMgYSBcXEBmaWxlb3ZlcnZpZXcgc3R5bGUgY29tbWVudCBpbiB0aGUgQ2xvc3VyZSBzZW5zZSwgaS5lLiBhXG4gKiBjb21tZW50IHRoYXQgaGFzIEpTRG9jIHRhZ3MgbWFya2luZyBpdCBhcyBhIGZpbGVvdmVydmlldyBjb21tZW50LlxuICogTm90ZSB0aGF0IHRoaXMgaXMgZGlmZmVyZW50IGZyb20gVHlwZVNjcmlwdCdzIHVuZGVyc3RhbmRpbmcgb2YgdGhlIGNvbmNlcHQsIHdoZXJlIGEgZmlsZSBjb21tZW50XG4gKiBpcyBhIGNvbW1lbnQgc2VwYXJhdGVkIGZyb20gdGhlIHJlc3Qgb2YgdGhlIGZpbGUgYnkgYSBkb3VibGUgbmV3bGluZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xvc3VyZUZpbGVvdmVydmlld0NvbW1lbnQodGV4dDogc3RyaW5nKSB7XG4gIGNvbnN0IGN1cnJlbnQgPSBqc2RvYy5wYXJzZSh0ZXh0KTtcbiAgcmV0dXJuIGN1cnJlbnQgIT09IG51bGwgJiYgY3VycmVudC50YWdzLnNvbWUodCA9PiBGSUxFT1ZFUlZJRVdfQ09NTUVOVF9NQVJLRVJTLmhhcyh0LnRhZ05hbWUpKTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIHBhcnNlZCBAZmlsZW92ZXJ2aWV3IGNvbW1lbnQsIGVuc3VyZXMgaXQgaGFzIGFsbCB0aGUgYXR0cmlidXRlcyB3ZSBuZWVkLlxuICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIHRvIG1vZGlmeSBhbiBleGlzdGluZyBjb21tZW50IG9yIHRvIG1ha2UgYSBuZXcgb25lLlxuICpcbiAqIEBwYXJhbSB0YWdzIENvbW1lbnQgYXMgcGFyc2VkIGxpc3Qgb2YgdGFnczsgbW9kaWZpZWQgaW4tcGxhY2UuXG4gKi9cbmZ1bmN0aW9uIGF1Z21lbnRGaWxlb3ZlcnZpZXdDb21tZW50cyh0YWdzOiBqc2RvYy5UYWdbXSkge1xuICAvLyBFbnN1cmUgd2Ugc3RhcnQgd2l0aCBhIEBmaWxlb3ZlcnZpZXcuXG4gIGlmICghdGFncy5maW5kKHQgPT4gdC50YWdOYW1lID09PSAnZmlsZW92ZXJ2aWV3JykpIHtcbiAgICB0YWdzLnNwbGljZSgwLCAwLCB7dGFnTmFtZTogJ2ZpbGVvdmVydmlldycsIHRleHQ6ICdhZGRlZCBieSB0c2lja2xlJ30pO1xuICB9XG5cbiAgLy8gRmluZCBvciBjcmVhdGUgYSBAc3VwcHJlc3MgdGFnLlxuICAvLyBDbG9zdXJlIGNvbXBpbGVyIGJhcmZzIGlmIHRoZXJlJ3MgYSBkdXBsaWNhdGVkIEBzdXBwcmVzcyB0YWcgaW4gYSBmaWxlLCBzbyB0aGUgdGFnIG11c3RcbiAgLy8gb25seSBhcHBlYXIgb25jZSBhbmQgYmUgbWVyZ2VkLlxuICBsZXQgc3VwcHJlc3NUYWcgPSB0YWdzLmZpbmQodCA9PiB0LnRhZ05hbWUgPT09ICdzdXBwcmVzcycpO1xuICBsZXQgc3VwcHJlc3Npb25zOiBTZXQ8c3RyaW5nPjtcbiAgaWYgKHN1cHByZXNzVGFnKSB7XG4gICAgc3VwcHJlc3Npb25zID0gbmV3IFNldCgoc3VwcHJlc3NUYWcudHlwZSB8fCAnJykuc3BsaXQoJywnKS5tYXAocyA9PiBzLnRyaW0oKSkpO1xuICB9IGVsc2Uge1xuICAgIHN1cHByZXNzVGFnID0ge3RhZ05hbWU6ICdzdXBwcmVzcycsIHRleHQ6ICdjaGVja2VkIGJ5IHRzYyd9O1xuICAgIHRhZ3MucHVzaChzdXBwcmVzc1RhZyk7XG4gICAgc3VwcHJlc3Npb25zID0gbmV3IFNldCgpO1xuICB9XG5cbiAgLy8gRW5zdXJlIG91ciBzdXBwcmVzc2lvbnMgYXJlIGluY2x1ZGVkIGluIHRoZSBAc3VwcHJlc3MgdGFnOlxuICAvLyAxKSBTdXBwcmVzcyBjaGVja1R5cGVzLiAgV2UgYmVsaWV2ZSB0aGUgY29kZSBoYXMgYWxyZWFkeSBiZWVuIHR5cGUtY2hlY2tlZCBieSBUeXBlU2NyaXB0LFxuICAvLyBhbmQgd2UgY2Fubm90IG1vZGVsIGFsbCB0aGUgVHlwZVNjcmlwdCB0eXBlIGRlY2lzaW9ucyBpbiBDbG9zdXJlIHN5bnRheC5cbiAgc3VwcHJlc3Npb25zLmFkZCgnY2hlY2tUeXBlcycpO1xuICAvLyAyKSBTdXBwcmVzcyBleHRyYVJlcXVpcmUuICBXZSByZW1vdmUgZXh0cmEgcmVxdWlyZXMgYXQgdGhlIFR5cGVTY3JpcHQgbGV2ZWwsIHNvIGFueSByZXF1aXJlXG4gIC8vIHRoYXQgZ2V0cyB0byB0aGUgSlMgbGV2ZWwgaXMgYSBsb2FkLWJlYXJpbmcgcmVxdWlyZS5cbiAgc3VwcHJlc3Npb25zLmFkZCgnZXh0cmFSZXF1aXJlJyk7XG4gIC8vIDMpIFN1cHByZXNzIHVzZWxlc3NDb2RlLiAgV2UgZW1pdCBhbiBcImlmIChmYWxzZSlcIiBhcm91bmQgdHlwZSBkZWNsYXJhdGlvbnMsXG4gIC8vIHdoaWNoIGlzIGZsYWdnZWQgYXMgdW51c2VkIGNvZGUgdW5sZXNzIHdlIHN1cHByZXNzIGl0LlxuICBzdXBwcmVzc2lvbnMuYWRkKCd1c2VsZXNzQ29kZScpO1xuICBzdXBwcmVzc1RhZy50eXBlID0gQXJyYXkuZnJvbShzdXBwcmVzc2lvbnMudmFsdWVzKCkpLnNvcnQoKS5qb2luKCcsJyk7XG5cbiAgcmV0dXJuIHRhZ3M7XG59XG5cbi8qKlxuICogQSB0cmFuc2Zvcm1lciB0aGF0IGVuc3VyZXMgdGhlIGVtaXR0ZWQgSlMgZmlsZSBoYXMgYW4gXFxAZmlsZW92ZXJ2aWV3IGNvbW1lbnQgdGhhdCBjb250YWlucyBhblxuICogXFxAc3VwcHJlc3Mge2NoZWNrVHlwZXN9IGFubm90YXRpb24gYnkgZWl0aGVyIGFkZGluZyBvciB1cGRhdGluZyBhbiBleGlzdGluZyBjb21tZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtRmlsZW92ZXJ2aWV3Q29tbWVudChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpOlxuICAgIChzZjogdHMuU291cmNlRmlsZSkgPT4gdHMuU291cmNlRmlsZSB7XG4gIHJldHVybiAoc2Y6IHRzLlNvdXJjZUZpbGUpID0+IHtcbiAgICBsZXQgY29tbWVudHM6IHRzLlN5bnRoZXNpemVkQ29tbWVudFtdID0gW107XG4gICAgLy8gVXNlIHRyYWlsaW5nIGNvbW1lbnRzIGJlY2F1c2UgdGhhdCdzIHdoYXQgdHJhbnNmb3JtZXJfdXRpbC50cyBjcmVhdGVzIChpLmUuIGJ5IGNvbnZlbnRpb24pLlxuICAgIGlmIChzZi5zdGF0ZW1lbnRzLmxlbmd0aCAmJiBzZi5zdGF0ZW1lbnRzWzBdLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTm90RW1pdHRlZFN0YXRlbWVudCkge1xuICAgICAgY29tbWVudHMgPSB0cy5nZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzKHNmLnN0YXRlbWVudHNbMF0pIHx8IFtdO1xuICAgIH1cblxuICAgIC8vIENsb3N1cmUgQ29tcGlsZXIgY29uc2lkZXJzIHRoZSAqbGFzdCogY29tbWVudCB3aXRoIEBmaWxlb3ZlcnZpZXcgKG9yIEBleHRlcm5zIG9yIEBub2NvbXBpbGUpXG4gICAgLy8gdGhhdCBoYXMgbm90IGJlZW4gYXR0YWNoZWQgdG8gc29tZSBvdGhlciB0cmVlIG5vZGUgdG8gYmUgdGhlIGZpbGUgb3ZlcnZpZXcgY29tbWVudCwgYW5kXG4gICAgLy8gb25seSBhcHBsaWVzIEBzdXBwcmVzcyB0YWdzIGZyb20gaXQuXG4gICAgLy8gQUpEIGNvbnNpZGVycyAqYW55KiBjb21tZW50IG1lbnRpb25pbmcgQGZpbGVvdmVydmlldy5cbiAgICBsZXQgZmlsZW92ZXJ2aWV3SWR4ID0gLTE7XG4gICAgbGV0IHRhZ3M6IGpzZG9jLlRhZ1tdID0gW107XG4gICAgZm9yIChsZXQgaSA9IGNvbW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBwYXJzZSA9IGpzZG9jLnBhcnNlQ29udGVudHMoY29tbWVudHNbaV0udGV4dCk7XG4gICAgICBpZiAocGFyc2UgIT09IG51bGwgJiYgcGFyc2UudGFncy5zb21lKHQgPT4gRklMRU9WRVJWSUVXX0NPTU1FTlRfTUFSS0VSUy5oYXModC50YWdOYW1lKSkpIHtcbiAgICAgICAgZmlsZW92ZXJ2aWV3SWR4ID0gaTtcbiAgICAgICAgdGFncyA9IHBhcnNlLnRhZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGF1Z21lbnRGaWxlb3ZlcnZpZXdDb21tZW50cyh0YWdzKTtcbiAgICBjb25zdCBjb21tZW50VGV4dCA9IGpzZG9jLnRvU3RyaW5nV2l0aG91dFN0YXJ0RW5kKHRhZ3MpO1xuXG4gICAgaWYgKGZpbGVvdmVydmlld0lkeCA8IDApIHtcbiAgICAgIC8vIE5vIGV4aXN0aW5nIGNvbW1lbnQgdG8gbWVyZ2Ugd2l0aCwganVzdCBlbWl0IGEgbmV3IG9uZS5cbiAgICAgIHJldHVybiBhZGROZXdGaWxlb3ZlcnZpZXdDb21tZW50KHNmLCBjb21tZW50VGV4dCk7XG4gICAgfVxuXG4gICAgY29tbWVudHNbZmlsZW92ZXJ2aWV3SWR4XS50ZXh0ID0gY29tbWVudFRleHQ7XG4gICAgLy8gc2YgZG9lcyBub3QgbmVlZCB0byBiZSB1cGRhdGVkLCBzeW50aGVzaXplZCBjb21tZW50cyBhcmUgbXV0YWJsZS5cbiAgICByZXR1cm4gc2Y7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZE5ld0ZpbGVvdmVydmlld0NvbW1lbnQoc2Y6IHRzLlNvdXJjZUZpbGUsIGNvbW1lbnRUZXh0OiBzdHJpbmcpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgbGV0IHN5bnRoZXRpY0ZpcnN0U3RhdGVtZW50ID0gY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzZik7XG4gIHN5bnRoZXRpY0ZpcnN0U3RhdGVtZW50ID0gdHMuYWRkU3ludGhldGljVHJhaWxpbmdDb21tZW50KFxuICAgICAgc3ludGhldGljRmlyc3RTdGF0ZW1lbnQsIHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSwgY29tbWVudFRleHQsIHRydWUpO1xuICByZXR1cm4gdXBkYXRlU291cmNlRmlsZU5vZGUoc2YsIHRzLmNyZWF0ZU5vZGVBcnJheShbc3ludGhldGljRmlyc3RTdGF0ZW1lbnQsIC4uLnNmLnN0YXRlbWVudHNdKSk7XG59XG4iXX0=