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
        define("tsickle/src/transformer_sourcemap", ["require", "exports", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * Creates a TypeScript transformer based on a source->text transformation.
     *
     * TypeScript transformers operate on AST nodes. Newly created nodes must be marked as replacing an
     * older AST node. This shim allows running a transformation step that's based on emitting new text
     * as a node based transformer. It achieves that by running the transformation, collecting a source
     * mapping in the process, and then afterwards parsing the source text into a new AST and marking
     * the new nodes as representations of the old nodes based on their source map positions.
     *
     * The process marks all nodes as synthesized except for a handful of special cases (identifiers
     * etc).
     */
    function createTransformerFromSourceMap(sourceBasedTransformer) {
        return function (context) { return function (sourceFile) {
            var sourceMapper = new NodeSourceMapper();
            var transformedSourceText = sourceBasedTransformer(sourceFile, sourceMapper);
            var newFile = ts.createSourceFile(sourceFile.fileName, transformedSourceText, ts.ScriptTarget.Latest, true);
            var mappedFile = visitNode(newFile);
            return transformer_util_1.updateSourceFileNode(sourceFile, mappedFile.statements);
            function visitNode(node) {
                return transformer_util_1.visitNodeWithSynthesizedComments(context, newFile, node, visitNodeImpl);
            }
            function visitNodeImpl(node) {
                if (node.flags & ts.NodeFlags.Synthesized) {
                    return node;
                }
                var originalNode = sourceMapper.getOriginalNode(node);
                // Use the originalNode for:
                // - literals: as e.g. typescript does not support synthetic regex literals
                // - identifiers: as they don't have children and behave well
                //    regarding comment synthesization
                // - types: as they are not emited anyways
                //          and it leads to errors with `extends` cases.
                // - imports/exports: as TypeScript will only attempt to elide type only
                //                    imports if the new node is identical to the original node.
                if (originalNode) {
                    if (isLiteralKind(node.kind) || node.kind === ts.SyntaxKind.Identifier ||
                        transformer_util_1.isTypeNodeKind(node.kind) || node.kind === ts.SyntaxKind.IndexSignature) {
                        return originalNode;
                    }
                    if (node.kind === ts.SyntaxKind.ImportDeclaration ||
                        node.kind === ts.SyntaxKind.ImportEqualsDeclaration ||
                        node.kind === ts.SyntaxKind.ExportAssignment) {
                        return originalNode;
                    }
                    if (ts.isExportDeclaration(node)) {
                        // Return the original nodes for export declarations, unless they were expanded from an
                        // export * to specific exported symbols.
                        var originalExport = originalNode;
                        if (!node.moduleSpecifier) {
                            // export {a, b, c};
                            return originalNode;
                        }
                        if (!!originalExport.exportClause === !!node.exportClause) {
                            // This already was exported with symbols (export {...}) or was not expanded.
                            return originalNode;
                        }
                        // Rewrote export * -> export {...}, the export declaration must be emitted in the updated
                        // form.
                    }
                }
                node = ts.visitEachChild(node, visitNode, context);
                node.flags |= ts.NodeFlags.Synthesized;
                node.parent = undefined;
                ts.setTextRange(node, originalNode ? originalNode : { pos: -1, end: -1 });
                ts.setOriginalNode(node, originalNode);
                // Loop over all nested ts.NodeArrays /
                // ts.Nodes that were not visited and set their
                // text range to -1 to not emit their whitespace.
                // Sadly, TypeScript does not have an API for this...
                // tslint:disable-next-line:no-any To read all properties
                var nodeAny = node;
                // tslint:disable-next-line:no-any To read all properties
                var originalNodeAny = originalNode;
                for (var prop in nodeAny) {
                    if (nodeAny.hasOwnProperty(prop)) {
                        // tslint:disable-next-line:no-any
                        var value = nodeAny[prop];
                        if (isNodeArray(value)) {
                            // reset the pos/end of all NodeArrays so that we don't emit comments
                            // from them.
                            ts.setTextRange(value, { pos: -1, end: -1 });
                        }
                        else if (isToken(value) && !(value.flags & ts.NodeFlags.Synthesized) &&
                            value.getSourceFile() !== sourceFile) {
                            // Use the original TextRange for all non visited tokens (e.g. the
                            // `BinaryExpression.operatorToken`) to preserve the formatting
                            var textRange = originalNode ? originalNodeAny[prop] : { pos: -1, end: -1 };
                            ts.setTextRange(value, textRange);
                        }
                    }
                }
                return node;
            }
        }; };
    }
    exports.createTransformerFromSourceMap = createTransformerFromSourceMap;
    /**
     * Implementation of the `SourceMapper` that stores and retrieves mappings
     * to original nodes.
     */
    var NodeSourceMapper = /** @class */ (function () {
        function NodeSourceMapper() {
            this.originalNodeByGeneratedRange = new Map();
            this.genStartPositions = new Map();
            /** Conceptual offset for all nodes in this mapping. */
            this.offset = 0;
        }
        /**
         * Recursively adds a source mapping for node and each of its children, mapping ranges from the
         * generated start position plus the child nodes offset up to its length.
         *
         * This is a useful catch all that works for most nodes, as long as their distance from the parent
         * does not change during emit and their own length does not change during emit (e.g. there are no
         * comments added inside them, no rewrites happening).
         */
        NodeSourceMapper.prototype.addFullNodeRange = function (node, genStartPos) {
            var _this = this;
            this.originalNodeByGeneratedRange.set(this.nodeCacheKey(node.kind, genStartPos, genStartPos + (node.getEnd() - node.getStart())), node);
            node.forEachChild(function (child) { return _this.addFullNodeRange(child, genStartPos + (child.getStart() - node.getStart())); });
        };
        NodeSourceMapper.prototype.shiftByOffset = function (offset) {
            this.offset += offset;
        };
        /**
         * Adds a mapping for the specific start/end range in the generated output back to the
         * originalNode.
         */
        NodeSourceMapper.prototype.addMappingForRange = function (originalNode, startPos, endPos) {
            // TODO(martinprobst): This glaringly duplicates addMapping below. However attempting to unify
            // these causes failures around exported variable nodes. Additionally, inspecting this code
            // longer suggests that it really only barely works by accident, and should much rather be
            // replaced by proper transformers :-(
            var cc = this.nodeCacheKey(originalNode.kind, startPos, endPos);
            this.originalNodeByGeneratedRange.set(cc, originalNode);
        };
        NodeSourceMapper.prototype.addMapping = function (originalNode, original, generated, length) {
            var _this = this;
            var originalStartPos = original.position;
            var genStartPos = generated.position;
            if (originalStartPos >= originalNode.getFullStart() &&
                originalStartPos <= originalNode.getStart()) {
                // always use the node.getStart() for the index,
                // as comments and whitespaces might differ between the original and transformed code.
                var diffToStart = originalNode.getStart() - originalStartPos;
                originalStartPos += diffToStart;
                genStartPos += diffToStart;
                length -= diffToStart;
                this.genStartPositions.set(originalNode, genStartPos);
            }
            if (originalStartPos + length === originalNode.getEnd()) {
                var cc = this.nodeCacheKey(originalNode.kind, this.genStartPositions.get(originalNode), genStartPos + length);
                this.originalNodeByGeneratedRange.set(cc, originalNode);
            }
            originalNode.forEachChild(function (child) {
                if (child.getStart() >= originalStartPos && child.getEnd() <= originalStartPos + length) {
                    _this.addFullNodeRange(child, genStartPos + (child.getStart() - originalStartPos));
                }
            });
        };
        /** For the newly parsed `node`, find what node corresponded to it in the original source text. */
        NodeSourceMapper.prototype.getOriginalNode = function (node) {
            // Apply the offset: if there is an offset > 0, all nodes are conceptually shifted by so many
            // characters from the start of the file.
            var start = node.getStart() - this.offset;
            if (start < 0) {
                // Special case: the source file conceptually spans all of the file, including any added
                // prefix added that causes offset to be set.
                if (node.kind !== ts.SyntaxKind.SourceFile) {
                    // Nodes within [0, offset] of the new file (start < 0) is the additional prefix that has no
                    // corresponding nodes in the original source, so return undefined.
                    return undefined;
                }
                start = 0;
            }
            var end = node.getEnd() - this.offset;
            var key = this.nodeCacheKey(node.kind, start, end);
            return this.originalNodeByGeneratedRange.get(key);
        };
        NodeSourceMapper.prototype.nodeCacheKey = function (kind, start, end) {
            return kind + "#" + start + "#" + end;
        };
        return NodeSourceMapper;
    }());
    // tslint:disable-next-line:no-any
    function isNodeArray(value) {
        var anyValue = value;
        return Array.isArray(value) && anyValue.pos !== undefined && anyValue.end !== undefined;
    }
    // tslint:disable-next-line:no-any
    function isToken(value) {
        return value != null && typeof value === 'object' && value.kind >= ts.SyntaxKind.FirstToken &&
            value.kind <= ts.SyntaxKind.LastToken;
    }
    // Copied from TypeScript
    function isLiteralKind(kind) {
        return ts.SyntaxKind.FirstLiteralToken <= kind && kind <= ts.SyntaxKind.LastLiteralToken;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXJfc291cmNlbWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RyYW5zZm9ybWVyX3NvdXJjZW1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUdILGlFQUEwRztJQUMxRywyQ0FBbUM7SUFFbkM7Ozs7Ozs7Ozs7O09BV0c7SUFDSCx3Q0FDSSxzQkFDVTtRQUNaLE9BQU8sVUFBQyxPQUFPLElBQUssT0FBQSxVQUFDLFVBQVU7WUFDN0IsSUFBTSxZQUFZLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVDLElBQU0scUJBQXFCLEdBQUcsc0JBQXNCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQy9FLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDL0IsVUFBVSxDQUFDLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5RSxJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEMsT0FBTyx1Q0FBb0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRS9ELG1CQUFzQyxJQUFPO2dCQUMzQyxPQUFPLG1EQUFnQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBTSxDQUFDO1lBQ3RGLENBQUM7WUFFRCx1QkFBdUIsSUFBYTtnQkFDbEMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFO29CQUN6QyxPQUFPLElBQUksQ0FBQztpQkFDYjtnQkFDRCxJQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV4RCw0QkFBNEI7Z0JBQzVCLDJFQUEyRTtnQkFDM0UsNkRBQTZE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Q0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckQsT0FBTyxJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFTyx1Q0FBWSxHQUFwQixVQUFxQixJQUFtQixFQUFFLEtBQWEsRUFBRSxHQUFXO1lBQ2xFLE9BQVUsSUFBSSxTQUFJLEtBQUssU0FBSSxHQUFLLENBQUM7UUFDbkMsQ0FBQztRQUNILHVCQUFDO0lBQUQsQ0FBQyxBQXhGRCxJQXdGQztJQUVELGtDQUFrQztJQUNsQyxxQkFBcUIsS0FBVTtRQUM3QixJQUFNLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdkIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDO0lBQzFGLENBQUM7SUFFRCxrQ0FBa0M7SUFDbEMsaUJBQWlCLEtBQVU7UUFDekIsT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVTtZQUN2RixLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO0lBQzVDLENBQUM7SUFFRCx5QkFBeUI7SUFDekIsdUJBQXVCLElBQW1CO1FBQ3hDLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7SUFDM0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTb3VyY2VNYXBwZXIsIFNvdXJjZVBvc2l0aW9ufSBmcm9tICcuL3NvdXJjZV9tYXBfdXRpbHMnO1xuaW1wb3J0IHtpc1R5cGVOb2RlS2luZCwgdXBkYXRlU291cmNlRmlsZU5vZGUsIHZpc2l0Tm9kZVdpdGhTeW50aGVzaXplZENvbW1lbnRzfSBmcm9tICcuL3RyYW5zZm9ybWVyX3V0aWwnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgVHlwZVNjcmlwdCB0cmFuc2Zvcm1lciBiYXNlZCBvbiBhIHNvdXJjZS0+dGV4dCB0cmFuc2Zvcm1hdGlvbi5cbiAqXG4gKiBUeXBlU2NyaXB0IHRyYW5zZm9ybWVycyBvcGVyYXRlIG9uIEFTVCBub2Rlcy4gTmV3bHkgY3JlYXRlZCBub2RlcyBtdXN0IGJlIG1hcmtlZCBhcyByZXBsYWNpbmcgYW5cbiAqIG9sZGVyIEFTVCBub2RlLiBUaGlzIHNoaW0gYWxsb3dzIHJ1bm5pbmcgYSB0cmFuc2Zvcm1hdGlvbiBzdGVwIHRoYXQncyBiYXNlZCBvbiBlbWl0dGluZyBuZXcgdGV4dFxuICogYXMgYSBub2RlIGJhc2VkIHRyYW5zZm9ybWVyLiBJdCBhY2hpZXZlcyB0aGF0IGJ5IHJ1bm5pbmcgdGhlIHRyYW5zZm9ybWF0aW9uLCBjb2xsZWN0aW5nIGEgc291cmNlXG4gKiBtYXBwaW5nIGluIHRoZSBwcm9jZXNzLCBhbmQgdGhlbiBhZnRlcndhcmRzIHBhcnNpbmcgdGhlIHNvdXJjZSB0ZXh0IGludG8gYSBuZXcgQVNUIGFuZCBtYXJraW5nXG4gKiB0aGUgbmV3IG5vZGVzIGFzIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgb2xkIG5vZGVzIGJhc2VkIG9uIHRoZWlyIHNvdXJjZSBtYXAgcG9zaXRpb25zLlxuICpcbiAqIFRoZSBwcm9jZXNzIG1hcmtzIGFsbCBub2RlcyBhcyBzeW50aGVzaXplZCBleGNlcHQgZm9yIGEgaGFuZGZ1bCBvZiBzcGVjaWFsIGNhc2VzIChpZGVudGlmaWVyc1xuICogZXRjKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYW5zZm9ybWVyRnJvbVNvdXJjZU1hcChcbiAgICBzb3VyY2VCYXNlZFRyYW5zZm9ybWVyOiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgc291cmNlTWFwcGVyOiBTb3VyY2VNYXBwZXIpID0+XG4gICAgICAgIHN0cmluZyk6IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPiB7XG4gIHJldHVybiAoY29udGV4dCkgPT4gKHNvdXJjZUZpbGUpID0+IHtcbiAgICBjb25zdCBzb3VyY2VNYXBwZXIgPSBuZXcgTm9kZVNvdXJjZU1hcHBlcigpO1xuICAgIGNvbnN0IHRyYW5zZm9ybWVkU291cmNlVGV4dCA9IHNvdXJjZUJhc2VkVHJhbnNmb3JtZXIoc291cmNlRmlsZSwgc291cmNlTWFwcGVyKTtcbiAgICBjb25zdCBuZXdGaWxlID0gdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICAgICAgc291cmNlRmlsZS5maWxlTmFtZSwgdHJhbnNmb3JtZWRTb3VyY2VUZXh0LCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcbiAgICBjb25zdCBtYXBwZWRGaWxlID0gdmlzaXROb2RlKG5ld0ZpbGUpO1xuICAgIHJldHVybiB1cGRhdGVTb3VyY2VGaWxlTm9kZShzb3VyY2VGaWxlLCBtYXBwZWRGaWxlLnN0YXRlbWVudHMpO1xuXG4gICAgZnVuY3Rpb24gdmlzaXROb2RlPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBUKTogVCB7XG4gICAgICByZXR1cm4gdmlzaXROb2RlV2l0aFN5bnRoZXNpemVkQ29tbWVudHMoY29udGV4dCwgbmV3RmlsZSwgbm9kZSwgdmlzaXROb2RlSW1wbCkgYXMgVDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2aXNpdE5vZGVJbXBsKG5vZGU6IHRzLk5vZGUpIHtcbiAgICAgIGlmIChub2RlLmZsYWdzICYgdHMuTm9kZUZsYWdzLlN5bnRoZXNpemVkKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3JpZ2luYWxOb2RlID0gc291cmNlTWFwcGVyLmdldE9yaWdpbmFsTm9kZShub2RlKTtcblxuICAgICAgLy8gVXNlIHRoZSBvcmlnaW5hbE5vZGUgZm9yOlxuICAgICAgLy8gLSBsaXRlcmFsczogYXMgZS5nLiB0eXBlc2NyaXB0IGRvZXMgbm90IHN1cHBvcnQgc3ludGhldGljIHJlZ2V4IGxpdGVyYWxzXG4gICAgICAvLyAtIGlkZW50aWZpZXJzOiBhcyB0aGV5IGRvbid0IGhhdmUgY2hpbGRyZW4gYW5kIGJlaGF2ZSB3ZWxsXG4gICAgICAvLyAgICByZWdhcmRpbmcgY29tbWVudCBzeW50aGVzaXphdGlvblxuICAgICAgLy8gLSB0eXBlczogYXMgdGhleSBhcmUgbm90IGVtaXRlZCBhbnl3YXlzXG4gICAgICAvLyAgICAgICAgICBhbmQgaXQgbGVhZHMgdG8gZXJyb3JzIHdpdGggYGV4dGVuZHNgIGNhc2VzLlxuICAgICAgLy8gLSBpbXBvcnRzL2V4cG9ydHM6IGFzIFR5cGVTY3JpcHQgd2lsbCBvbmx5IGF0dGVtcHQgdG8gZWxpZGUgdHlwZSBvbmx5XG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgaW1wb3J0cyBpZiB0aGUgbmV3IG5vZGUgaXMgaWRlbnRpY2FsIHRvIHRoZSBvcmlnaW5hbCBub2RlLlxuICAgICAgaWYgKG9yaWdpbmFsTm9kZSkge1xuICAgICAgICBpZiAoaXNMaXRlcmFsS2luZChub2RlLmtpbmQpIHx8IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyIHx8XG4gICAgICAgICAgICBpc1R5cGVOb2RlS2luZChub2RlLmtpbmQpIHx8IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbmRleFNpZ25hdHVyZSkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbXBvcnREZWNsYXJhdGlvbiB8fFxuICAgICAgICAgICAgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydEVxdWFsc0RlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgICBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwb3J0QXNzaWdubWVudCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRzLmlzRXhwb3J0RGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgICAgICAvLyBSZXR1cm4gdGhlIG9yaWdpbmFsIG5vZGVzIGZvciBleHBvcnQgZGVjbGFyYXRpb25zLCB1bmxlc3MgdGhleSB3ZXJlIGV4cGFuZGVkIGZyb20gYW5cbiAgICAgICAgICAvLyBleHBvcnQgKiB0byBzcGVjaWZpYyBleHBvcnRlZCBzeW1ib2xzLlxuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsRXhwb3J0ID0gb3JpZ2luYWxOb2RlIGFzIHRzLkV4cG9ydERlY2xhcmF0aW9uO1xuICAgICAgICAgIGlmICghbm9kZS5tb2R1bGVTcGVjaWZpZXIpIHtcbiAgICAgICAgICAgIC8vIGV4cG9ydCB7YSwgYiwgY307XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxOb2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFvcmlnaW5hbEV4cG9ydC5leHBvcnRDbGF1c2UgPT09ICEhbm9kZS5leHBvcnRDbGF1c2UpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgYWxyZWFkeSB3YXMgZXhwb3J0ZWQgd2l0aCBzeW1ib2xzIChleHBvcnQgey4uLn0pIG9yIHdhcyBub3QgZXhwYW5kZWQuXG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxOb2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSZXdyb3RlIGV4cG9ydCAqIC0+IGV4cG9ydCB7Li4ufSwgdGhlIGV4cG9ydCBkZWNsYXJhdGlvbiBtdXN0IGJlIGVtaXR0ZWQgaW4gdGhlIHVwZGF0ZWRcbiAgICAgICAgICAvLyBmb3JtLlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub2RlID0gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXROb2RlLCBjb250ZXh0KTtcblxuICAgICAgbm9kZS5mbGFncyB8PSB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQ7XG4gICAgICBub2RlLnBhcmVudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRzLnNldFRleHRSYW5nZShub2RlLCBvcmlnaW5hbE5vZGUgPyBvcmlnaW5hbE5vZGUgOiB7cG9zOiAtMSwgZW5kOiAtMX0pO1xuICAgICAgdHMuc2V0T3JpZ2luYWxOb2RlKG5vZGUsIG9yaWdpbmFsTm9kZSk7XG5cbiAgICAgIC8vIExvb3Agb3ZlciBhbGwgbmVzdGVkIHRzLk5vZGVBcnJheXMgL1xuICAgICAgLy8gdHMuTm9kZXMgdGhhdCB3ZXJlIG5vdCB2aXNpdGVkIGFuZCBzZXQgdGhlaXJcbiAgICAgIC8vIHRleHQgcmFuZ2UgdG8gLTEgdG8gbm90IGVtaXQgdGhlaXIgd2hpdGVzcGFjZS5cbiAgICAgIC8vIFNhZGx5LCBUeXBlU2NyaXB0IGRvZXMgbm90IGhhdmUgYW4gQVBJIGZvciB0aGlzLi4uXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55IFRvIHJlYWQgYWxsIHByb3BlcnRpZXNcbiAgICAgIGNvbnN0IG5vZGVBbnkgPSBub2RlIGFzIHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueSBUbyByZWFkIGFsbCBwcm9wZXJ0aWVzXG4gICAgICBjb25zdCBvcmlnaW5hbE5vZGVBbnkgPSBvcmlnaW5hbE5vZGUgYXMge1trZXk6IHN0cmluZ106IGFueX07XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gbm9kZUFueSkge1xuICAgICAgICBpZiAobm9kZUFueS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IG5vZGVBbnlbcHJvcF07XG4gICAgICAgICAgaWYgKGlzTm9kZUFycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgLy8gcmVzZXQgdGhlIHBvcy9lbmQgb2YgYWxsIE5vZGVBcnJheXMgc28gdGhhdCB3ZSBkb24ndCBlbWl0IGNvbW1lbnRzXG4gICAgICAgICAgICAvLyBmcm9tIHRoZW0uXG4gICAgICAgICAgICB0cy5zZXRUZXh0UmFuZ2UodmFsdWUsIHtwb3M6IC0xLCBlbmQ6IC0xfSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgaXNUb2tlbih2YWx1ZSkgJiYgISh2YWx1ZS5mbGFncyAmIHRzLk5vZGVGbGFncy5TeW50aGVzaXplZCkgJiZcbiAgICAgICAgICAgICAgdmFsdWUuZ2V0U291cmNlRmlsZSgpICE9PSBzb3VyY2VGaWxlKSB7XG4gICAgICAgICAgICAvLyBVc2UgdGhlIG9yaWdpbmFsIFRleHRSYW5nZSBmb3IgYWxsIG5vbiB2aXNpdGVkIHRva2VucyAoZS5nLiB0aGVcbiAgICAgICAgICAgIC8vIGBCaW5hcnlFeHByZXNzaW9uLm9wZXJhdG9yVG9rZW5gKSB0byBwcmVzZXJ2ZSB0aGUgZm9ybWF0dGluZ1xuICAgICAgICAgICAgY29uc3QgdGV4dFJhbmdlID0gb3JpZ2luYWxOb2RlID8gb3JpZ2luYWxOb2RlQW55W3Byb3BdIDoge3BvczogLTEsIGVuZDogLTF9O1xuICAgICAgICAgICAgdHMuc2V0VGV4dFJhbmdlKHZhbHVlLCB0ZXh0UmFuZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIGBTb3VyY2VNYXBwZXJgIHRoYXQgc3RvcmVzIGFuZCByZXRyaWV2ZXMgbWFwcGluZ3NcbiAqIHRvIG9yaWdpbmFsIG5vZGVzLlxuICovXG5jbGFzcyBOb2RlU291cmNlTWFwcGVyIGltcGxlbWVudHMgU291cmNlTWFwcGVyIHtcbiAgcHJpdmF0ZSBvcmlnaW5hbE5vZGVCeUdlbmVyYXRlZFJhbmdlID0gbmV3IE1hcDxzdHJpbmcsIHRzLk5vZGU+KCk7XG4gIHByaXZhdGUgZ2VuU3RhcnRQb3NpdGlvbnMgPSBuZXcgTWFwPHRzLk5vZGUsIG51bWJlcj4oKTtcbiAgLyoqIENvbmNlcHR1YWwgb2Zmc2V0IGZvciBhbGwgbm9kZXMgaW4gdGhpcyBtYXBwaW5nLiAqL1xuICBwcml2YXRlIG9mZnNldCA9IDA7XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGFkZHMgYSBzb3VyY2UgbWFwcGluZyBmb3Igbm9kZSBhbmQgZWFjaCBvZiBpdHMgY2hpbGRyZW4sIG1hcHBpbmcgcmFuZ2VzIGZyb20gdGhlXG4gICAqIGdlbmVyYXRlZCBzdGFydCBwb3NpdGlvbiBwbHVzIHRoZSBjaGlsZCBub2RlcyBvZmZzZXQgdXAgdG8gaXRzIGxlbmd0aC5cbiAgICpcbiAgICogVGhpcyBpcyBhIHVzZWZ1bCBjYXRjaCBhbGwgdGhhdCB3b3JrcyBmb3IgbW9zdCBub2RlcywgYXMgbG9uZyBhcyB0aGVpciBkaXN0YW5jZSBmcm9tIHRoZSBwYXJlbnRcbiAgICogZG9lcyBub3QgY2hhbmdlIGR1cmluZyBlbWl0IGFuZCB0aGVpciBvd24gbGVuZ3RoIGRvZXMgbm90IGNoYW5nZSBkdXJpbmcgZW1pdCAoZS5nLiB0aGVyZSBhcmUgbm9cbiAgICogY29tbWVudHMgYWRkZWQgaW5zaWRlIHRoZW0sIG5vIHJld3JpdGVzIGhhcHBlbmluZykuXG4gICAqL1xuICBwcml2YXRlIGFkZEZ1bGxOb2RlUmFuZ2Uobm9kZTogdHMuTm9kZSwgZ2VuU3RhcnRQb3M6IG51bWJlcikge1xuICAgIHRoaXMub3JpZ2luYWxOb2RlQnlHZW5lcmF0ZWRSYW5nZS5zZXQoXG4gICAgICAgIHRoaXMubm9kZUNhY2hlS2V5KG5vZGUua2luZCwgZ2VuU3RhcnRQb3MsIGdlblN0YXJ0UG9zICsgKG5vZGUuZ2V0RW5kKCkgLSBub2RlLmdldFN0YXJ0KCkpKSxcbiAgICAgICAgbm9kZSk7XG4gICAgbm9kZS5mb3JFYWNoQ2hpbGQoXG4gICAgICAgIGNoaWxkID0+IHRoaXMuYWRkRnVsbE5vZGVSYW5nZShjaGlsZCwgZ2VuU3RhcnRQb3MgKyAoY2hpbGQuZ2V0U3RhcnQoKSAtIG5vZGUuZ2V0U3RhcnQoKSkpKTtcbiAgfVxuXG4gIHNoaWZ0QnlPZmZzZXQob2Zmc2V0OiBudW1iZXIpIHtcbiAgICB0aGlzLm9mZnNldCArPSBvZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG1hcHBpbmcgZm9yIHRoZSBzcGVjaWZpYyBzdGFydC9lbmQgcmFuZ2UgaW4gdGhlIGdlbmVyYXRlZCBvdXRwdXQgYmFjayB0byB0aGVcbiAgICogb3JpZ2luYWxOb2RlLlxuICAgKi9cbiAgYWRkTWFwcGluZ0ZvclJhbmdlKG9yaWdpbmFsTm9kZTogdHMuTm9kZSwgc3RhcnRQb3M6IG51bWJlciwgZW5kUG9zOiBudW1iZXIpIHtcbiAgICAvLyBUT0RPKG1hcnRpbnByb2JzdCk6IFRoaXMgZ2xhcmluZ2x5IGR1cGxpY2F0ZXMgYWRkTWFwcGluZyBiZWxvdy4gSG93ZXZlciBhdHRlbXB0aW5nIHRvIHVuaWZ5XG4gICAgLy8gdGhlc2UgY2F1c2VzIGZhaWx1cmVzIGFyb3VuZCBleHBvcnRlZCB2YXJpYWJsZSBub2Rlcy4gQWRkaXRpb25hbGx5LCBpbnNwZWN0aW5nIHRoaXMgY29kZVxuICAgIC8vIGxvbmdlciBzdWdnZXN0cyB0aGF0IGl0IHJlYWxseSBvbmx5IGJhcmVseSB3b3JrcyBieSBhY2NpZGVudCwgYW5kIHNob3VsZCBtdWNoIHJhdGhlciBiZVxuICAgIC8vIHJlcGxhY2VkIGJ5IHByb3BlciB0cmFuc2Zvcm1lcnMgOi0oXG4gICAgY29uc3QgY2MgPSB0aGlzLm5vZGVDYWNoZUtleShvcmlnaW5hbE5vZGUua2luZCwgc3RhcnRQb3MsIGVuZFBvcyk7XG4gICAgdGhpcy5vcmlnaW5hbE5vZGVCeUdlbmVyYXRlZFJhbmdlLnNldChjYywgb3JpZ2luYWxOb2RlKTtcbiAgfVxuXG4gIGFkZE1hcHBpbmcoXG4gICAgICBvcmlnaW5hbE5vZGU6IHRzLk5vZGUsIG9yaWdpbmFsOiBTb3VyY2VQb3NpdGlvbiwgZ2VuZXJhdGVkOiBTb3VyY2VQb3NpdGlvbiwgbGVuZ3RoOiBudW1iZXIpIHtcbiAgICBsZXQgb3JpZ2luYWxTdGFydFBvcyA9IG9yaWdpbmFsLnBvc2l0aW9uO1xuICAgIGxldCBnZW5TdGFydFBvcyA9IGdlbmVyYXRlZC5wb3NpdGlvbjtcbiAgICBpZiAob3JpZ2luYWxTdGFydFBvcyA+PSBvcmlnaW5hbE5vZGUuZ2V0RnVsbFN0YXJ0KCkgJiZcbiAgICAgICAgb3JpZ2luYWxTdGFydFBvcyA8PSBvcmlnaW5hbE5vZGUuZ2V0U3RhcnQoKSkge1xuICAgICAgLy8gYWx3YXlzIHVzZSB0aGUgbm9kZS5nZXRTdGFydCgpIGZvciB0aGUgaW5kZXgsXG4gICAgICAvLyBhcyBjb21tZW50cyBhbmQgd2hpdGVzcGFjZXMgbWlnaHQgZGlmZmVyIGJldHdlZW4gdGhlIG9yaWdpbmFsIGFuZCB0cmFuc2Zvcm1lZCBjb2RlLlxuICAgICAgY29uc3QgZGlmZlRvU3RhcnQgPSBvcmlnaW5hbE5vZGUuZ2V0U3RhcnQoKSAtIG9yaWdpbmFsU3RhcnRQb3M7XG4gICAgICBvcmlnaW5hbFN0YXJ0UG9zICs9IGRpZmZUb1N0YXJ0O1xuICAgICAgZ2VuU3RhcnRQb3MgKz0gZGlmZlRvU3RhcnQ7XG4gICAgICBsZW5ndGggLT0gZGlmZlRvU3RhcnQ7XG4gICAgICB0aGlzLmdlblN0YXJ0UG9zaXRpb25zLnNldChvcmlnaW5hbE5vZGUsIGdlblN0YXJ0UG9zKTtcbiAgICB9XG4gICAgaWYgKG9yaWdpbmFsU3RhcnRQb3MgKyBsZW5ndGggPT09IG9yaWdpbmFsTm9kZS5nZXRFbmQoKSkge1xuICAgICAgY29uc3QgY2MgPSB0aGlzLm5vZGVDYWNoZUtleShcbiAgICAgICAgICBvcmlnaW5hbE5vZGUua2luZCwgdGhpcy5nZW5TdGFydFBvc2l0aW9ucy5nZXQob3JpZ2luYWxOb2RlKSEsIGdlblN0YXJ0UG9zICsgbGVuZ3RoKTtcbiAgICAgIHRoaXMub3JpZ2luYWxOb2RlQnlHZW5lcmF0ZWRSYW5nZS5zZXQoY2MsIG9yaWdpbmFsTm9kZSk7XG4gICAgfVxuICAgIG9yaWdpbmFsTm9kZS5mb3JFYWNoQ2hpbGQoKGNoaWxkKSA9PiB7XG4gICAgICBpZiAoY2hpbGQuZ2V0U3RhcnQoKSA+PSBvcmlnaW5hbFN0YXJ0UG9zICYmIGNoaWxkLmdldEVuZCgpIDw9IG9yaWdpbmFsU3RhcnRQb3MgKyBsZW5ndGgpIHtcbiAgICAgICAgdGhpcy5hZGRGdWxsTm9kZVJhbmdlKGNoaWxkLCBnZW5TdGFydFBvcyArIChjaGlsZC5nZXRTdGFydCgpIC0gb3JpZ2luYWxTdGFydFBvcykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEZvciB0aGUgbmV3bHkgcGFyc2VkIGBub2RlYCwgZmluZCB3aGF0IG5vZGUgY29ycmVzcG9uZGVkIHRvIGl0IGluIHRoZSBvcmlnaW5hbCBzb3VyY2UgdGV4dC4gKi9cbiAgZ2V0T3JpZ2luYWxOb2RlKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlfHVuZGVmaW5lZCB7XG4gICAgLy8gQXBwbHkgdGhlIG9mZnNldDogaWYgdGhlcmUgaXMgYW4gb2Zmc2V0ID4gMCwgYWxsIG5vZGVzIGFyZSBjb25jZXB0dWFsbHkgc2hpZnRlZCBieSBzbyBtYW55XG4gICAgLy8gY2hhcmFjdGVycyBmcm9tIHRoZSBzdGFydCBvZiB0aGUgZmlsZS5cbiAgICBsZXQgc3RhcnQgPSBub2RlLmdldFN0YXJ0KCkgLSB0aGlzLm9mZnNldDtcbiAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICAvLyBTcGVjaWFsIGNhc2U6IHRoZSBzb3VyY2UgZmlsZSBjb25jZXB0dWFsbHkgc3BhbnMgYWxsIG9mIHRoZSBmaWxlLCBpbmNsdWRpbmcgYW55IGFkZGVkXG4gICAgICAvLyBwcmVmaXggYWRkZWQgdGhhdCBjYXVzZXMgb2Zmc2V0IHRvIGJlIHNldC5cbiAgICAgIGlmIChub2RlLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuU291cmNlRmlsZSkge1xuICAgICAgICAvLyBOb2RlcyB3aXRoaW4gWzAsIG9mZnNldF0gb2YgdGhlIG5ldyBmaWxlIChzdGFydCA8IDApIGlzIHRoZSBhZGRpdGlvbmFsIHByZWZpeCB0aGF0IGhhcyBub1xuICAgICAgICAvLyBjb3JyZXNwb25kaW5nIG5vZGVzIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UsIHNvIHJldHVybiB1bmRlZmluZWQuXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIGNvbnN0IGVuZCA9IG5vZGUuZ2V0RW5kKCkgLSB0aGlzLm9mZnNldDtcbiAgICBjb25zdCBrZXkgPSB0aGlzLm5vZGVDYWNoZUtleShub2RlLmtpbmQsIHN0YXJ0LCBlbmQpO1xuICAgIHJldHVybiB0aGlzLm9yaWdpbmFsTm9kZUJ5R2VuZXJhdGVkUmFuZ2UuZ2V0KGtleSk7XG4gIH1cblxuICBwcml2YXRlIG5vZGVDYWNoZUtleShraW5kOiB0cy5TeW50YXhLaW5kLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke2tpbmR9IyR7c3RhcnR9IyR7ZW5kfWA7XG4gIH1cbn1cblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuZnVuY3Rpb24gaXNOb2RlQXJyYXkodmFsdWU6IGFueSk6IHZhbHVlIGlzIHRzLk5vZGVBcnJheTxhbnk+IHtcbiAgY29uc3QgYW55VmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpICYmIGFueVZhbHVlLnBvcyAhPT0gdW5kZWZpbmVkICYmIGFueVZhbHVlLmVuZCAhPT0gdW5kZWZpbmVkO1xufVxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG5mdW5jdGlvbiBpc1Rva2VuKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyB0cy5Ub2tlbjxhbnk+IHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5raW5kID49IHRzLlN5bnRheEtpbmQuRmlyc3RUb2tlbiAmJlxuICAgICAgdmFsdWUua2luZCA8PSB0cy5TeW50YXhLaW5kLkxhc3RUb2tlbjtcbn1cblxuLy8gQ29waWVkIGZyb20gVHlwZVNjcmlwdFxuZnVuY3Rpb24gaXNMaXRlcmFsS2luZChraW5kOiB0cy5TeW50YXhLaW5kKSB7XG4gIHJldHVybiB0cy5TeW50YXhLaW5kLkZpcnN0TGl0ZXJhbFRva2VuIDw9IGtpbmQgJiYga2luZCA8PSB0cy5TeW50YXhLaW5kLkxhc3RMaXRlcmFsVG9rZW47XG59XG4iXX0=