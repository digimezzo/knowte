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
        define("tsickle/src/rewriter", ["require", "exports", "tsickle/src/fileoverview_comment_transformer", "tsickle/src/source_map_utils", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fileoverview_comment_transformer_1 = require("tsickle/src/fileoverview_comment_transformer");
    var source_map_utils_1 = require("tsickle/src/source_map_utils");
    var ts = require("tsickle/src/typescript");
    /**
     * A Rewriter manages iterating through a ts.SourceFile, copying input
     * to output while letting the subclass potentially alter some nodes
     * along the way by implementing maybeProcess().
     */
    var Rewriter = /** @class */ (function () {
        function Rewriter(file, sourceMapper) {
            if (sourceMapper === void 0) { sourceMapper = source_map_utils_1.NOOP_SOURCE_MAPPER; }
            this.file = file;
            this.sourceMapper = sourceMapper;
            this.output = [];
            /** Errors found while examining the code. */
            this.diagnostics = [];
            /** Current position in the output. */
            this.position = { line: 0, column: 0, position: 0 };
            /**
             * The current level of recursion through TypeScript Nodes.  Used in formatting internal debug
             * print statements.
             */
            this.indent = 0;
            /**
             * Skip emitting any code before the given offset. E.g. used to avoid emitting @fileoverview
             * comments twice.
             */
            this.skipCommentsUpToOffset = -1;
        }
        Rewriter.prototype.getOutput = function (prefix) {
            var e_1, _a;
            if (this.indent !== 0) {
                throw new Error('visit() failed to track nesting');
            }
            var out = this.output.join('');
            if (prefix) {
                // Insert prefix after any leading @fileoverview comments, so they still come first in the
                // file. This must not use file.getStart() (comment position in the input file), but rahter
                // check comments in the new output, as those (in particular for comments) are unrelated.
                var insertionIdx = 0;
                try {
                    for (var _b = __values(ts.getLeadingCommentRanges(out, 0) || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var cr = _c.value;
                        if (fileoverview_comment_transformer_1.isClosureFileoverviewComment(out.substring(cr.pos, cr.end))) {
                            insertionIdx = cr.end;
                            // Include space (in particular line breaks) after a @fileoverview comment; without the
                            // space seperating it, TypeScript might elide the emit.
                            while (insertionIdx < out.length && out[insertionIdx].match(/\s/))
                                insertionIdx++;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                out = out.substring(0, insertionIdx) + prefix + out.substring(insertionIdx);
                this.sourceMapper.shiftByOffset(prefix.length);
            }
            return {
                output: out,
                diagnostics: this.diagnostics,
            };
        };
        /**
         * visit traverses a Node, recursively writing all nodes not handled by this.maybeProcess.
         */
        Rewriter.prototype.visit = function (node) {
            // this.logWithIndent('node: ' + ts.SyntaxKind[node.kind]);
            this.indent++;
            try {
                if (!this.maybeProcess(node)) {
                    this.writeNode(node);
                }
            }
            catch (e) {
                if (!e.message)
                    e.message = 'Unhandled error in tsickle';
                e.message += "\n at " + ts.SyntaxKind[node.kind] + " in " + this.file.fileName + ":";
                var _a = this.file.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
                e.message += line + 1 + ":" + (character + 1);
                throw e;
            }
            this.indent--;
        };
        /**
         * maybeProcess lets subclasses optionally processes a node.
         *
         * @return True if the node has been handled and doesn't need to be traversed;
         *    false to have the node written and its children recursively visited.
         */
        Rewriter.prototype.maybeProcess = function (node) {
            return false;
        };
        /** writeNode writes a ts.Node, calling this.visit() on its children. */
        Rewriter.prototype.writeNode = function (node, skipComments, newLineIfCommentsStripped) {
            if (skipComments === void 0) { skipComments = false; }
            if (newLineIfCommentsStripped === void 0) { newLineIfCommentsStripped = true; }
            var pos = node.getFullStart();
            if (skipComments) {
                // To skip comments, we skip all whitespace/comments preceding
                // the node.  But if there was anything skipped we should emit
                // a newline in its place so that the node remains separated
                // from the previous node.  TODO: don't skip anything here if
                // there wasn't any comment.
                if (newLineIfCommentsStripped && node.getFullStart() < node.getStart()) {
                    this.emit('\n');
                }
                pos = node.getStart();
            }
            this.writeNodeFrom(node, pos);
        };
        Rewriter.prototype.writeNodeFrom = function (node, pos, end) {
            var _this = this;
            if (end === void 0) { end = node.getEnd(); }
            if (end <= this.skipCommentsUpToOffset) {
                return;
            }
            var oldSkipCommentsUpToOffset = this.skipCommentsUpToOffset;
            this.skipCommentsUpToOffset = Math.max(this.skipCommentsUpToOffset, pos);
            ts.forEachChild(node, function (child) {
                _this.writeRange(node, pos, child.getFullStart());
                _this.visit(child);
                pos = child.getEnd();
            });
            this.writeRange(node, pos, end);
            this.skipCommentsUpToOffset = oldSkipCommentsUpToOffset;
        };
        /**
         * Writes all leading trivia (whitespace or comments) on node, or all trivia up to the given
         * position. Also marks those trivia as "already emitted" by shifting the skipCommentsUpTo marker.
         */
        Rewriter.prototype.writeLeadingTrivia = function (node, upTo) {
            if (upTo === void 0) { upTo = 0; }
            var upToOffset = upTo || node.getStart();
            this.writeRange(node, node.getFullStart(), upTo || node.getStart());
            this.skipCommentsUpToOffset = upToOffset;
        };
        Rewriter.prototype.addSourceMapping = function (node) {
            this.writeRange(node, node.getEnd(), node.getEnd());
        };
        /**
         * Start a source mapping for the given node. This allows adding source mappings for statements
         * that are not yet finished, and whose total length is unknown. Does not add recursive mappings
         * for child nodes.
         * @return a handler to finish the mapping.
         */
        Rewriter.prototype.startSourceMapping = function (node) {
            var _this = this;
            var startPos = this.position.position;
            return function () {
                _this.sourceMapper.addMappingForRange(node, startPos, _this.position.position);
            };
        };
        /**
         * Write a span of the input file as expressed by absolute offsets.
         * These offsets are found in attributes like node.getFullStart() and
         * node.getEnd().
         */
        Rewriter.prototype.writeRange = function (node, from, to) {
            var fullStart = node.getFullStart();
            var textStart = node.getStart();
            if (from >= fullStart && from < textStart) {
                from = Math.max(from, this.skipCommentsUpToOffset);
            }
            // Add a source mapping. writeRange(from, to) always corresponds to
            // original source code, so add a mapping at the current location that
            // points back to the location at `from`. The additional code generated
            // by tsickle will then be considered part of the last mapped code
            // section preceding it. That's arguably incorrect (e.g. for the fake
            // methods defining properties), but is good enough for stack traces.
            var pos = this.file.getLineAndCharacterOfPosition(from);
            this.sourceMapper.addMapping(node, { line: pos.line, column: pos.character, position: from }, this.position, to - from);
            // getSourceFile().getText() is wrong here because it has the text of
            // the SourceFile node of the AST, which doesn't contain the comments
            // preceding that node.  Semantically these ranges are just offsets
            // into the original source file text, so slice from that.
            var text = this.file.text.slice(from, to);
            if (text) {
                this.emit(text);
            }
        };
        Rewriter.prototype.emit = function (str) {
            var e_2, _a;
            this.output.push(str);
            try {
                for (var str_1 = __values(str), str_1_1 = str_1.next(); !str_1_1.done; str_1_1 = str_1.next()) {
                    var c = str_1_1.value;
                    this.position.column++;
                    if (c === '\n') {
                        this.position.line++;
                        this.position.column = 0;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (str_1_1 && !str_1_1.done && (_a = str_1.return)) _a.call(str_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.position.position += str.length;
        };
        /** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
        Rewriter.prototype.escapeForComment = function (str) {
            return str.replace(/\/\*/g, '__').replace(/\*\//g, '__');
        };
        /* tslint:disable: no-unused-variable */
        Rewriter.prototype.logWithIndent = function (message) {
            /* tslint:enable: no-unused-variable */
            var prefix = new Array(this.indent + 1).join('| ');
            console.log(prefix + message);
        };
        /**
         * Produces a compiler error that references the Node's kind.  This is useful for the "else"
         * branch of code that is attempting to handle all possible input Node types, to ensure all cases
         * covered.
         */
        Rewriter.prototype.errorUnimplementedKind = function (node, where) {
            this.error(node, ts.SyntaxKind[node.kind] + " not implemented in " + where);
        };
        Rewriter.prototype.error = function (node, messageText) {
            this.diagnostics.push({
                file: node.getSourceFile(),
                start: node.getStart(),
                length: node.getEnd() - node.getStart(),
                messageText: messageText,
                category: ts.DiagnosticCategory.Error,
                code: 0,
            });
        };
        return Rewriter;
    }());
    exports.Rewriter = Rewriter;
    /** Returns the string contents of a ts.Identifier. */
    function getIdentifierText(identifier) {
        // NOTE: the 'text' property on an Identifier may be escaped if it starts
        // with '__', so just use getText().
        return identifier.getText();
    }
    exports.getIdentifierText = getIdentifierText;
    /** Returns a dot-joined qualified name (foo.bar.Baz). */
    function getEntityNameText(name) {
        if (ts.isIdentifier(name)) {
            return getIdentifierText(name);
        }
        return getEntityNameText(name.left) + '.' + getIdentifierText(name.right);
    }
    exports.getEntityNameText = getEntityNameText;
    /**
     * Converts an escaped TypeScript name into the original source name.
     * Prefer getIdentifierText() instead if possible.
     */
    function unescapeName(name) {
        // See the private function unescapeIdentifier in TypeScript's utilities.ts.
        if (name.match(/^___/))
            return name.substr(1);
        return name;
    }
    exports.unescapeName = unescapeName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmV3cml0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmV3cml0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsaUdBQWdGO0lBQ2hGLGlFQUFvRjtJQUNwRiwyQ0FBbUM7SUFFbkM7Ozs7T0FJRztJQUNIO1FBaUJFLGtCQUFtQixJQUFtQixFQUFVLFlBQStDO1lBQS9DLDZCQUFBLEVBQUEsZUFBNkIscUNBQWtCO1lBQTVFLFNBQUksR0FBSixJQUFJLENBQWU7WUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBbUM7WUFoQnZGLFdBQU0sR0FBYSxFQUFFLENBQUM7WUFDOUIsNkNBQTZDO1lBQ25DLGdCQUFXLEdBQW9CLEVBQUUsQ0FBQztZQUM1QyxzQ0FBc0M7WUFDOUIsYUFBUSxHQUFtQixFQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFDLENBQUM7WUFDckU7OztlQUdHO1lBQ0ssV0FBTSxHQUFHLENBQUMsQ0FBQztZQUNuQjs7O2VBR0c7WUFDSywyQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUdwQyxDQUFDO1FBRUQsNEJBQVMsR0FBVCxVQUFVLE1BQWU7O1lBQ3ZCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQzthQUNwRDtZQUNELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9CLElBQUksTUFBTSxFQUFFO2dCQUNWLDBGQUEwRjtnQkFDMUYsMkZBQTJGO2dCQUMzRix5RkFBeUY7Z0JBQ3pGLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQzs7b0JBQ3JCLEtBQWlCLElBQUEsS0FBQSxTQUFBLEVBQUUsQ0FBQyx1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LElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUxELDhDQUtDO0lBRUQ7OztPQUdHO0lBQ0gsc0JBQTZCLElBQVk7UUFDdkMsNEVBQTRFO1FBQzVFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBSkQsb0NBSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNDbG9zdXJlRmlsZW92ZXJ2aWV3Q29tbWVudH0gZnJvbSAnLi9maWxlb3ZlcnZpZXdfY29tbWVudF90cmFuc2Zvcm1lcic7XG5pbXBvcnQge05PT1BfU09VUkNFX01BUFBFUiwgU291cmNlTWFwcGVyLCBTb3VyY2VQb3NpdGlvbn0gZnJvbSAnLi9zb3VyY2VfbWFwX3V0aWxzJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogQSBSZXdyaXRlciBtYW5hZ2VzIGl0ZXJhdGluZyB0aHJvdWdoIGEgdHMuU291cmNlRmlsZSwgY29weWluZyBpbnB1dFxuICogdG8gb3V0cHV0IHdoaWxlIGxldHRpbmcgdGhlIHN1YmNsYXNzIHBvdGVudGlhbGx5IGFsdGVyIHNvbWUgbm9kZXNcbiAqIGFsb25nIHRoZSB3YXkgYnkgaW1wbGVtZW50aW5nIG1heWJlUHJvY2VzcygpLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmV3cml0ZXIge1xuICBwcml2YXRlIG91dHB1dDogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEVycm9ycyBmb3VuZCB3aGlsZSBleGFtaW5pbmcgdGhlIGNvZGUuICovXG4gIHByb3RlY3RlZCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gIC8qKiBDdXJyZW50IHBvc2l0aW9uIGluIHRoZSBvdXRwdXQuICovXG4gIHByaXZhdGUgcG9zaXRpb246IFNvdXJjZVBvc2l0aW9uID0ge2xpbmU6IDAsIGNvbHVtbjogMCwgcG9zaXRpb246IDB9O1xuICAvKipcbiAgICogVGhlIGN1cnJlbnQgbGV2ZWwgb2YgcmVjdXJzaW9uIHRocm91Z2ggVHlwZVNjcmlwdCBOb2Rlcy4gIFVzZWQgaW4gZm9ybWF0dGluZyBpbnRlcm5hbCBkZWJ1Z1xuICAgKiBwcmludCBzdGF0ZW1lbnRzLlxuICAgKi9cbiAgcHJpdmF0ZSBpbmRlbnQgPSAwO1xuICAvKipcbiAgICogU2tpcCBlbWl0dGluZyBhbnkgY29kZSBiZWZvcmUgdGhlIGdpdmVuIG9mZnNldC4gRS5nLiB1c2VkIHRvIGF2b2lkIGVtaXR0aW5nIEBmaWxlb3ZlcnZpZXdcbiAgICogY29tbWVudHMgdHdpY2UuXG4gICAqL1xuICBwcml2YXRlIHNraXBDb21tZW50c1VwVG9PZmZzZXQgPSAtMTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmlsZTogdHMuU291cmNlRmlsZSwgcHJpdmF0ZSBzb3VyY2VNYXBwZXI6IFNvdXJjZU1hcHBlciA9IE5PT1BfU09VUkNFX01BUFBFUikge1xuICB9XG5cbiAgZ2V0T3V0cHV0KHByZWZpeD86IHN0cmluZyk6IHtvdXRwdXQ6IHN0cmluZywgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXX0ge1xuICAgIGlmICh0aGlzLmluZGVudCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd2aXNpdCgpIGZhaWxlZCB0byB0cmFjayBuZXN0aW5nJyk7XG4gICAgfVxuICAgIGxldCBvdXQgPSB0aGlzLm91dHB1dC5qb2luKCcnKTtcbiAgICBpZiAocHJlZml4KSB7XG4gICAgICAvLyBJbnNlcnQgcHJlZml4IGFmdGVyIGFueSBsZWFkaW5nIEBmaWxlb3ZlcnZpZXcgY29tbWVudHMsIHNvIHRoZXkgc3RpbGwgY29tZSBmaXJzdCBpbiB0aGVcbiAgICAgIC8vIGZpbGUuIFRoaXMgbXVzdCBub3QgdXNlIGZpbGUuZ2V0U3RhcnQoKSAoY29tbWVudCBwb3NpdGlvbiBpbiB0aGUgaW5wdXQgZmlsZSksIGJ1dCByYWh0ZXJcbiAgICAgIC8vIGNoZWNrIGNvbW1lbnRzIGluIHRoZSBuZXcgb3V0cHV0LCBhcyB0aG9zZSAoaW4gcGFydGljdWxhciBmb3IgY29tbWVudHMpIGFyZSB1bnJlbGF0ZWQuXG4gICAgICBsZXQgaW5zZXJ0aW9uSWR4ID0gMDtcbiAgICAgIGZvciAoY29uc3QgY3Igb2YgdHMuZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXMob3V0LCAwKSB8fCBbXSkge1xuICAgICAgICBpZiAoaXNDbG9zdXJlRmlsZW92ZXJ2aWV3Q29tbWVudChvdXQuc3Vic3RyaW5nKGNyLnBvcywgY3IuZW5kKSkpIHtcbiAgICAgICAgICBpbnNlcnRpb25JZHggPSBjci5lbmQ7XG4gICAgICAgICAgLy8gSW5jbHVkZSBzcGFjZSAoaW4gcGFydGljdWxhciBsaW5lIGJyZWFrcykgYWZ0ZXIgYSBAZmlsZW92ZXJ2aWV3IGNvbW1lbnQ7IHdpdGhvdXQgdGhlXG4gICAgICAgICAgLy8gc3BhY2Ugc2VwZXJhdGluZyBpdCwgVHlwZVNjcmlwdCBtaWdodCBlbGlkZSB0aGUgZW1pdC5cbiAgICAgICAgICB3aGlsZSAoaW5zZXJ0aW9uSWR4IDwgb3V0Lmxlbmd0aCAmJiBvdXRbaW5zZXJ0aW9uSWR4XS5tYXRjaCgvXFxzLykpIGluc2VydGlvbklkeCsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvdXQgPSBvdXQuc3Vic3RyaW5nKDAsIGluc2VydGlvbklkeCkgKyBwcmVmaXggKyBvdXQuc3Vic3RyaW5nKGluc2VydGlvbklkeCk7XG4gICAgICB0aGlzLnNvdXJjZU1hcHBlci5zaGlmdEJ5T2Zmc2V0KHByZWZpeC5sZW5ndGgpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgb3V0cHV0OiBvdXQsXG4gICAgICBkaWFnbm9zdGljczogdGhpcy5kaWFnbm9zdGljcyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIHZpc2l0IHRyYXZlcnNlcyBhIE5vZGUsIHJlY3Vyc2l2ZWx5IHdyaXRpbmcgYWxsIG5vZGVzIG5vdCBoYW5kbGVkIGJ5IHRoaXMubWF5YmVQcm9jZXNzLlxuICAgKi9cbiAgdmlzaXQobm9kZTogdHMuTm9kZSkge1xuICAgIC8vIHRoaXMubG9nV2l0aEluZGVudCgnbm9kZTogJyArIHRzLlN5bnRheEtpbmRbbm9kZS5raW5kXSk7XG4gICAgdGhpcy5pbmRlbnQrKztcbiAgICB0cnkge1xuICAgICAgaWYgKCF0aGlzLm1heWJlUHJvY2Vzcyhub2RlKSkge1xuICAgICAgICB0aGlzLndyaXRlTm9kZShub2RlKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoIWUubWVzc2FnZSkgZS5tZXNzYWdlID0gJ1VuaGFuZGxlZCBlcnJvciBpbiB0c2lja2xlJztcbiAgICAgIGUubWVzc2FnZSArPSBgXFxuIGF0ICR7dHMuU3ludGF4S2luZFtub2RlLmtpbmRdfSBpbiAke3RoaXMuZmlsZS5maWxlTmFtZX06YDtcbiAgICAgIGNvbnN0IHtsaW5lLCBjaGFyYWN0ZXJ9ID0gdGhpcy5maWxlLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKG5vZGUuZ2V0U3RhcnQoKSk7XG4gICAgICBlLm1lc3NhZ2UgKz0gYCR7bGluZSArIDF9OiR7Y2hhcmFjdGVyICsgMX1gO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgdGhpcy5pbmRlbnQtLTtcbiAgfVxuXG4gIC8qKlxuICAgKiBtYXliZVByb2Nlc3MgbGV0cyBzdWJjbGFzc2VzIG9wdGlvbmFsbHkgcHJvY2Vzc2VzIGEgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiBUcnVlIGlmIHRoZSBub2RlIGhhcyBiZWVuIGhhbmRsZWQgYW5kIGRvZXNuJ3QgbmVlZCB0byBiZSB0cmF2ZXJzZWQ7XG4gICAqICAgIGZhbHNlIHRvIGhhdmUgdGhlIG5vZGUgd3JpdHRlbiBhbmQgaXRzIGNoaWxkcmVuIHJlY3Vyc2l2ZWx5IHZpc2l0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgbWF5YmVQcm9jZXNzKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogd3JpdGVOb2RlIHdyaXRlcyBhIHRzLk5vZGUsIGNhbGxpbmcgdGhpcy52aXNpdCgpIG9uIGl0cyBjaGlsZHJlbi4gKi9cbiAgd3JpdGVOb2RlKG5vZGU6IHRzLk5vZGUsIHNraXBDb21tZW50cyA9IGZhbHNlLCBuZXdMaW5lSWZDb21tZW50c1N0cmlwcGVkID0gdHJ1ZSkge1xuICAgIGxldCBwb3MgPSBub2RlLmdldEZ1bGxTdGFydCgpO1xuICAgIGlmIChza2lwQ29tbWVudHMpIHtcbiAgICAgIC8vIFRvIHNraXAgY29tbWVudHMsIHdlIHNraXAgYWxsIHdoaXRlc3BhY2UvY29tbWVudHMgcHJlY2VkaW5nXG4gICAgICAvLyB0aGUgbm9kZS4gIEJ1dCBpZiB0aGVyZSB3YXMgYW55dGhpbmcgc2tpcHBlZCB3ZSBzaG91bGQgZW1pdFxuICAgICAgLy8gYSBuZXdsaW5lIGluIGl0cyBwbGFjZSBzbyB0aGF0IHRoZSBub2RlIHJlbWFpbnMgc2VwYXJhdGVkXG4gICAgICAvLyBmcm9tIHRoZSBwcmV2aW91cyBub2RlLiAgVE9ETzogZG9uJ3Qgc2tpcCBhbnl0aGluZyBoZXJlIGlmXG4gICAgICAvLyB0aGVyZSB3YXNuJ3QgYW55IGNvbW1lbnQuXG4gICAgICBpZiAobmV3TGluZUlmQ29tbWVudHNTdHJpcHBlZCAmJiBub2RlLmdldEZ1bGxTdGFydCgpIDwgbm9kZS5nZXRTdGFydCgpKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnXFxuJyk7XG4gICAgICB9XG4gICAgICBwb3MgPSBub2RlLmdldFN0YXJ0KCk7XG4gICAgfVxuICAgIHRoaXMud3JpdGVOb2RlRnJvbShub2RlLCBwb3MpO1xuICB9XG5cbiAgd3JpdGVOb2RlRnJvbShub2RlOiB0cy5Ob2RlLCBwb3M6IG51bWJlciwgZW5kID0gbm9kZS5nZXRFbmQoKSkge1xuICAgIGlmIChlbmQgPD0gdGhpcy5za2lwQ29tbWVudHNVcFRvT2Zmc2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9sZFNraXBDb21tZW50c1VwVG9PZmZzZXQgPSB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQ7XG4gICAgdGhpcy5za2lwQ29tbWVudHNVcFRvT2Zmc2V0ID0gTWF0aC5tYXgodGhpcy5za2lwQ29tbWVudHNVcFRvT2Zmc2V0LCBwb3MpO1xuICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCBjaGlsZCA9PiB7XG4gICAgICB0aGlzLndyaXRlUmFuZ2Uobm9kZSwgcG9zLCBjaGlsZC5nZXRGdWxsU3RhcnQoKSk7XG4gICAgICB0aGlzLnZpc2l0KGNoaWxkKTtcbiAgICAgIHBvcyA9IGNoaWxkLmdldEVuZCgpO1xuICAgIH0pO1xuICAgIHRoaXMud3JpdGVSYW5nZShub2RlLCBwb3MsIGVuZCk7XG4gICAgdGhpcy5za2lwQ29tbWVudHNVcFRvT2Zmc2V0ID0gb2xkU2tpcENvbW1lbnRzVXBUb09mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZXMgYWxsIGxlYWRpbmcgdHJpdmlhICh3aGl0ZXNwYWNlIG9yIGNvbW1lbnRzKSBvbiBub2RlLCBvciBhbGwgdHJpdmlhIHVwIHRvIHRoZSBnaXZlblxuICAgKiBwb3NpdGlvbi4gQWxzbyBtYXJrcyB0aG9zZSB0cml2aWEgYXMgXCJhbHJlYWR5IGVtaXR0ZWRcIiBieSBzaGlmdGluZyB0aGUgc2tpcENvbW1lbnRzVXBUbyBtYXJrZXIuXG4gICAqL1xuICB3cml0ZUxlYWRpbmdUcml2aWEobm9kZTogdHMuTm9kZSwgdXBUbyA9IDApIHtcbiAgICBjb25zdCB1cFRvT2Zmc2V0ID0gdXBUbyB8fCBub2RlLmdldFN0YXJ0KCk7XG4gICAgdGhpcy53cml0ZVJhbmdlKG5vZGUsIG5vZGUuZ2V0RnVsbFN0YXJ0KCksIHVwVG8gfHwgbm9kZS5nZXRTdGFydCgpKTtcbiAgICB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQgPSB1cFRvT2Zmc2V0O1xuICB9XG5cbiAgYWRkU291cmNlTWFwcGluZyhub2RlOiB0cy5Ob2RlKSB7XG4gICAgdGhpcy53cml0ZVJhbmdlKG5vZGUsIG5vZGUuZ2V0RW5kKCksIG5vZGUuZ2V0RW5kKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGEgc291cmNlIG1hcHBpbmcgZm9yIHRoZSBnaXZlbiBub2RlLiBUaGlzIGFsbG93cyBhZGRpbmcgc291cmNlIG1hcHBpbmdzIGZvciBzdGF0ZW1lbnRzXG4gICAqIHRoYXQgYXJlIG5vdCB5ZXQgZmluaXNoZWQsIGFuZCB3aG9zZSB0b3RhbCBsZW5ndGggaXMgdW5rbm93bi4gRG9lcyBub3QgYWRkIHJlY3Vyc2l2ZSBtYXBwaW5nc1xuICAgKiBmb3IgY2hpbGQgbm9kZXMuXG4gICAqIEByZXR1cm4gYSBoYW5kbGVyIHRvIGZpbmlzaCB0aGUgbWFwcGluZy5cbiAgICovXG4gIHN0YXJ0U291cmNlTWFwcGluZyhub2RlOiB0cy5Ob2RlKSB7XG4gICAgY29uc3Qgc3RhcnRQb3MgPSB0aGlzLnBvc2l0aW9uLnBvc2l0aW9uO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLnNvdXJjZU1hcHBlci5hZGRNYXBwaW5nRm9yUmFuZ2Uobm9kZSwgc3RhcnRQb3MsIHRoaXMucG9zaXRpb24ucG9zaXRpb24pO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogV3JpdGUgYSBzcGFuIG9mIHRoZSBpbnB1dCBmaWxlIGFzIGV4cHJlc3NlZCBieSBhYnNvbHV0ZSBvZmZzZXRzLlxuICAgKiBUaGVzZSBvZmZzZXRzIGFyZSBmb3VuZCBpbiBhdHRyaWJ1dGVzIGxpa2Ugbm9kZS5nZXRGdWxsU3RhcnQoKSBhbmRcbiAgICogbm9kZS5nZXRFbmQoKS5cbiAgICovXG4gIHdyaXRlUmFuZ2Uobm9kZTogdHMuTm9kZSwgZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyKSB7XG4gICAgY29uc3QgZnVsbFN0YXJ0ID0gbm9kZS5nZXRGdWxsU3RhcnQoKTtcbiAgICBjb25zdCB0ZXh0U3RhcnQgPSBub2RlLmdldFN0YXJ0KCk7XG4gICAgaWYgKGZyb20gPj0gZnVsbFN0YXJ0ICYmIGZyb20gPCB0ZXh0U3RhcnQpIHtcbiAgICAgIGZyb20gPSBNYXRoLm1heChmcm9tLCB0aGlzLnNraXBDb21tZW50c1VwVG9PZmZzZXQpO1xuICAgIH1cbiAgICAvLyBBZGQgYSBzb3VyY2UgbWFwcGluZy4gd3JpdGVSYW5nZShmcm9tLCB0bykgYWx3YXlzIGNvcnJlc3BvbmRzIHRvXG4gICAgLy8gb3JpZ2luYWwgc291cmNlIGNvZGUsIHNvIGFkZCBhIG1hcHBpbmcgYXQgdGhlIGN1cnJlbnQgbG9jYXRpb24gdGhhdFxuICAgIC8vIHBvaW50cyBiYWNrIHRvIHRoZSBsb2NhdGlvbiBhdCBgZnJvbWAuIFRoZSBhZGRpdGlvbmFsIGNvZGUgZ2VuZXJhdGVkXG4gICAgLy8gYnkgdHNpY2tsZSB3aWxsIHRoZW4gYmUgY29uc2lkZXJlZCBwYXJ0IG9mIHRoZSBsYXN0IG1hcHBlZCBjb2RlXG4gICAgLy8gc2VjdGlvbiBwcmVjZWRpbmcgaXQuIFRoYXQncyBhcmd1YWJseSBpbmNvcnJlY3QgKGUuZy4gZm9yIHRoZSBmYWtlXG4gICAgLy8gbWV0aG9kcyBkZWZpbmluZyBwcm9wZXJ0aWVzKSwgYnV0IGlzIGdvb2QgZW5vdWdoIGZvciBzdGFjayB0cmFjZXMuXG4gICAgY29uc3QgcG9zID0gdGhpcy5maWxlLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKGZyb20pO1xuICAgIHRoaXMuc291cmNlTWFwcGVyLmFkZE1hcHBpbmcoXG4gICAgICAgIG5vZGUsIHtsaW5lOiBwb3MubGluZSwgY29sdW1uOiBwb3MuY2hhcmFjdGVyLCBwb3NpdGlvbjogZnJvbX0sIHRoaXMucG9zaXRpb24sIHRvIC0gZnJvbSk7XG4gICAgLy8gZ2V0U291cmNlRmlsZSgpLmdldFRleHQoKSBpcyB3cm9uZyBoZXJlIGJlY2F1c2UgaXQgaGFzIHRoZSB0ZXh0IG9mXG4gICAgLy8gdGhlIFNvdXJjZUZpbGUgbm9kZSBvZiB0aGUgQVNULCB3aGljaCBkb2Vzbid0IGNvbnRhaW4gdGhlIGNvbW1lbnRzXG4gICAgLy8gcHJlY2VkaW5nIHRoYXQgbm9kZS4gIFNlbWFudGljYWxseSB0aGVzZSByYW5nZXMgYXJlIGp1c3Qgb2Zmc2V0c1xuICAgIC8vIGludG8gdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlIHRleHQsIHNvIHNsaWNlIGZyb20gdGhhdC5cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5maWxlLnRleHQuc2xpY2UoZnJvbSwgdG8pO1xuICAgIGlmICh0ZXh0KSB7XG4gICAgICB0aGlzLmVtaXQodGV4dCk7XG4gICAgfVxuICB9XG5cbiAgZW1pdChzdHI6IHN0cmluZykge1xuICAgIHRoaXMub3V0cHV0LnB1c2goc3RyKTtcbiAgICBmb3IgKGNvbnN0IGMgb2Ygc3RyKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uLmNvbHVtbisrO1xuICAgICAgaWYgKGMgPT09ICdcXG4nKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24ubGluZSsrO1xuICAgICAgICB0aGlzLnBvc2l0aW9uLmNvbHVtbiA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb24ucG9zaXRpb24gKz0gc3RyLmxlbmd0aDtcbiAgfVxuXG4gIC8qKiBSZW1vdmVzIGNvbW1lbnQgbWV0YWNoYXJhY3RlcnMgZnJvbSBhIHN0cmluZywgdG8gbWFrZSBpdCBzYWZlIHRvIGVtYmVkIGluIGEgY29tbWVudC4gKi9cbiAgZXNjYXBlRm9yQ29tbWVudChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXC9cXCovZywgJ19fJykucmVwbGFjZSgvXFwqXFwvL2csICdfXycpO1xuICB9XG5cbiAgLyogdHNsaW50OmRpc2FibGU6IG5vLXVudXNlZC12YXJpYWJsZSAqL1xuICBsb2dXaXRoSW5kZW50KG1lc3NhZ2U6IHN0cmluZykge1xuICAgIC8qIHRzbGludDplbmFibGU6IG5vLXVudXNlZC12YXJpYWJsZSAqL1xuICAgIGNvbnN0IHByZWZpeCA9IG5ldyBBcnJheSh0aGlzLmluZGVudCArIDEpLmpvaW4oJ3wgJyk7XG4gICAgY29uc29sZS5sb2cocHJlZml4ICsgbWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgYSBjb21waWxlciBlcnJvciB0aGF0IHJlZmVyZW5jZXMgdGhlIE5vZGUncyBraW5kLiAgVGhpcyBpcyB1c2VmdWwgZm9yIHRoZSBcImVsc2VcIlxuICAgKiBicmFuY2ggb2YgY29kZSB0aGF0IGlzIGF0dGVtcHRpbmcgdG8gaGFuZGxlIGFsbCBwb3NzaWJsZSBpbnB1dCBOb2RlIHR5cGVzLCB0byBlbnN1cmUgYWxsIGNhc2VzXG4gICAqIGNvdmVyZWQuXG4gICAqL1xuICBlcnJvclVuaW1wbGVtZW50ZWRLaW5kKG5vZGU6IHRzLk5vZGUsIHdoZXJlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmVycm9yKG5vZGUsIGAke3RzLlN5bnRheEtpbmRbbm9kZS5raW5kXX0gbm90IGltcGxlbWVudGVkIGluICR7d2hlcmV9YCk7XG4gIH1cblxuICBlcnJvcihub2RlOiB0cy5Ob2RlLCBtZXNzYWdlVGV4dDogc3RyaW5nKSB7XG4gICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKHtcbiAgICAgIGZpbGU6IG5vZGUuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgc3RhcnQ6IG5vZGUuZ2V0U3RhcnQoKSxcbiAgICAgIGxlbmd0aDogbm9kZS5nZXRFbmQoKSAtIG5vZGUuZ2V0U3RhcnQoKSxcbiAgICAgIG1lc3NhZ2VUZXh0LFxuICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgIGNvZGU6IDAsXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqIFJldHVybnMgdGhlIHN0cmluZyBjb250ZW50cyBvZiBhIHRzLklkZW50aWZpZXIuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWRlbnRpZmllclRleHQoaWRlbnRpZmllcjogdHMuSWRlbnRpZmllcik6IHN0cmluZyB7XG4gIC8vIE5PVEU6IHRoZSAndGV4dCcgcHJvcGVydHkgb24gYW4gSWRlbnRpZmllciBtYXkgYmUgZXNjYXBlZCBpZiBpdCBzdGFydHNcbiAgLy8gd2l0aCAnX18nLCBzbyBqdXN0IHVzZSBnZXRUZXh0KCkuXG4gIHJldHVybiBpZGVudGlmaWVyLmdldFRleHQoKTtcbn1cblxuLyoqIFJldHVybnMgYSBkb3Qtam9pbmVkIHF1YWxpZmllZCBuYW1lIChmb28uYmFyLkJheikuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW50aXR5TmFtZVRleHQobmFtZTogdHMuRW50aXR5TmFtZSk6IHN0cmluZyB7XG4gIGlmICh0cy5pc0lkZW50aWZpZXIobmFtZSkpIHtcbiAgICByZXR1cm4gZ2V0SWRlbnRpZmllclRleHQobmFtZSk7XG4gIH1cbiAgcmV0dXJuIGdldEVudGl0eU5hbWVUZXh0KG5hbWUubGVmdCkgKyAnLicgKyBnZXRJZGVudGlmaWVyVGV4dChuYW1lLnJpZ2h0KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBlc2NhcGVkIFR5cGVTY3JpcHQgbmFtZSBpbnRvIHRoZSBvcmlnaW5hbCBzb3VyY2UgbmFtZS5cbiAqIFByZWZlciBnZXRJZGVudGlmaWVyVGV4dCgpIGluc3RlYWQgaWYgcG9zc2libGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmVzY2FwZU5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gU2VlIHRoZSBwcml2YXRlIGZ1bmN0aW9uIHVuZXNjYXBlSWRlbnRpZmllciBpbiBUeXBlU2NyaXB0J3MgdXRpbGl0aWVzLnRzLlxuICBpZiAobmFtZS5tYXRjaCgvXl9fXy8pKSByZXR1cm4gbmFtZS5zdWJzdHIoMSk7XG4gIHJldHVybiBuYW1lO1xufVxuIl19