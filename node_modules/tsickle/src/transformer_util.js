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
        define("tsickle/src/transformer_util", ["require", "exports", "tsickle/src/typescript", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("tsickle/src/typescript");
    var util_1 = require("tsickle/src/util");
    /**
     * Adjusts the given CustomTransformers with additional transformers
     * to fix bugs in TypeScript.
     */
    function createCustomTransformers(given) {
        var before = given.before || [];
        before.unshift(addFileContexts);
        before.push(prepareNodesBeforeTypeScriptTransform);
        var after = given.after || [];
        after.unshift(emitMissingSyntheticCommentsAfterTypescriptTransform);
        return { before: before, after: after };
    }
    exports.createCustomTransformers = createCustomTransformers;
    /**
     * A transformer that does nothing, but synthesizes all comments. This allows testing transformers
     * in isolation, but with an AST and comment placement that matches what'd happen after a source map
     * based transformer ran.
     */
    function synthesizeCommentsTransformer(context) {
        return function (sf) {
            function visitNodeRecursively(n) {
                return visitEachChild(n, function (n) { return visitNodeWithSynthesizedComments(context, sf, n, visitNodeRecursively); }, context);
            }
            return visitNodeWithSynthesizedComments(context, sf, sf, visitNodeRecursively);
        };
    }
    exports.synthesizeCommentsTransformer = synthesizeCommentsTransformer;
    /**
     * Transform that adds the FileContext to the TransformationContext.
     */
    function addFileContexts(context) {
        return function (sourceFile) {
            context.fileContext = new FileContext(sourceFile);
            return sourceFile;
        };
    }
    function assertFileContext(context, sourceFile) {
        if (!context.fileContext) {
            throw new Error("Illegal State: FileContext not initialized. " +
                "Did you forget to add the \"firstTransform\" as first transformer? " +
                ("File: " + sourceFile.fileName));
        }
        if (context.fileContext.file.fileName !== sourceFile.fileName) {
            throw new Error("Illegal State: File of the FileContext does not match. File: " + sourceFile.fileName);
        }
        return context.fileContext;
    }
    /**
     * A context that stores information per file to e.g. allow communication
     * between transformers.
     * There is one ts.TransformationContext per emit,
     * but files are handled sequentially by all transformers. Thefore we can
     * store file related information on a property on the ts.TransformationContext,
     * given that we reset it in the first transformer.
     */
    var FileContext = /** @class */ (function () {
        function FileContext(file) {
            this.file = file;
            /**
             * Stores the parent node for all processed nodes.
             * This is needed for nodes from the parse tree that are used
             * in a synthetic node as must not modify these, even though they
             * have a new parent now.
             */
            this.syntheticNodeParents = new Map();
            this.importOrReexportDeclarations = [];
            this.lastCommentEnd = -1;
        }
        return FileContext;
    }());
    /**
     * Transform that needs to be executed right before TypeScript's transform.
     *
     * This prepares the node tree to workaround some bugs in the TypeScript emitter.
     */
    function prepareNodesBeforeTypeScriptTransform(context) {
        return function (sourceFile) {
            var fileCtx = assertFileContext(context, sourceFile);
            var nodePath = [];
            visitNode(sourceFile);
            return sourceFile;
            function visitNode(node) {
                var parent = nodePath[nodePath.length - 1];
                if (node.flags & ts.NodeFlags.Synthesized) {
                    // Set `parent` for synthetic nodes as well,
                    // as otherwise the TS emit will crash for decorators.
                    // Note: don't update the `parent` of original nodes, as:
                    // 1) we don't want to change them at all
                    // 2) TS emit becomes errorneous in some cases if we add a synthetic parent.
                    // see https://github.com/Microsoft/TypeScript/issues/17384
                    node.parent = parent;
                }
                fileCtx.syntheticNodeParents.set(node, parent);
                var originalNode = ts.getOriginalNode(node);
                if (node.kind === ts.SyntaxKind.ImportDeclaration ||
                    node.kind === ts.SyntaxKind.ExportDeclaration) {
                    var ied = node;
                    if (ied.moduleSpecifier) {
                        fileCtx.importOrReexportDeclarations.push(ied);
                    }
                }
                // recurse
                nodePath.push(node);
                node.forEachChild(visitNode);
                nodePath.pop();
            }
        };
    }
    /**
     * Transform that needs to be executed after TypeScript's transform.
     *
     * This fixes places where the TypeScript transformer does not
     * emit synthetic comments.
     *
     * See https://github.com/Microsoft/TypeScript/issues/17594
     */
    function emitMissingSyntheticCommentsAfterTypescriptTransform(context) {
        return function (sourceFile) {
            var fileContext = assertFileContext(context, sourceFile);
            var nodePath = [];
            visitNode(sourceFile);
            context.fileContext = undefined;
            return sourceFile;
            function visitNode(node) {
                if (node.kind === ts.SyntaxKind.Identifier) {
                    var parent1 = fileContext.syntheticNodeParents.get(node);
                    var parent2 = parent1 && fileContext.syntheticNodeParents.get(parent1);
                    var parent3 = parent2 && fileContext.syntheticNodeParents.get(parent2);
                    if (parent1 && parent1.kind === ts.SyntaxKind.PropertyDeclaration) {
                        // TypeScript ignores synthetic comments on (static) property declarations
                        // with initializers.
                        // find the parent ExpressionStatement like MyClass.foo = ...
                        var expressionStmt = lastNodeWith(nodePath, function (node) { return node.kind === ts.SyntaxKind.ExpressionStatement; });
                        if (expressionStmt) {
                            ts.setSyntheticLeadingComments(expressionStmt, ts.getSyntheticLeadingComments(parent1) || []);
                        }
                    }
                    else if (parent3 && parent3.kind === ts.SyntaxKind.VariableStatement &&
                        util_1.hasModifierFlag(parent3, ts.ModifierFlags.Export)) {
                        // TypeScript ignores synthetic comments on exported variables.
                        // find the parent ExpressionStatement like exports.foo = ...
                        var expressionStmt = lastNodeWith(nodePath, function (node) { return node.kind === ts.SyntaxKind.ExpressionStatement; });
                        if (expressionStmt) {
                            ts.setSyntheticLeadingComments(expressionStmt, ts.getSyntheticLeadingComments(parent3) || []);
                        }
                    }
                }
                // TypeScript ignores synthetic comments on reexport / import statements.
                // The code below re-adds them one the converted CommonJS import statements, and resets the
                // text range to prevent previous comments from being emitted.
                if (isCommonJsRequireStatement(node) && fileContext.importOrReexportDeclarations) {
                    // Locate the original import/export declaration via the
                    // text range.
                    var importOrReexportDeclaration = fileContext.importOrReexportDeclarations.find(function (ied) { return ied.pos === node.pos; });
                    if (importOrReexportDeclaration) {
                        ts.setSyntheticLeadingComments(node, ts.getSyntheticLeadingComments(importOrReexportDeclaration) || []);
                    }
                    // Need to clear the textRange for ImportDeclaration / ExportDeclaration as
                    // otherwise TypeScript would emit the original comments even if we set the
                    // ts.EmitFlag.NoComments. (see also resetNodeTextRangeToPreventDuplicateComments below)
                    ts.setSourceMapRange(node, { pos: node.pos, end: node.end });
                    ts.setTextRange(node, { pos: -1, end: -1 });
                }
                nodePath.push(node);
                node.forEachChild(visitNode);
                nodePath.pop();
            }
        };
    }
    function isCommonJsRequireStatement(node) {
        // CommonJS requires can be either "var x = require('...');" or (for side effect imports), just
        // "require('...');".
        var callExpr;
        if (ts.isVariableStatement(node)) {
            var varStmt = node;
            var decls = varStmt.declarationList.declarations;
            var init = void 0;
            if (decls.length !== 1 || !(init = decls[0].initializer) ||
                init.kind !== ts.SyntaxKind.CallExpression) {
                return false;
            }
            callExpr = init;
        }
        else if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
            callExpr = node.expression;
        }
        else {
            return false;
        }
        if (callExpr.expression.kind !== ts.SyntaxKind.Identifier ||
            callExpr.expression.text !== 'require' ||
            callExpr.arguments.length !== 1) {
            return false;
        }
        var moduleExpr = callExpr.arguments[0];
        return moduleExpr.kind === ts.SyntaxKind.StringLiteral;
    }
    function lastNodeWith(nodes, predicate) {
        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = nodes[i];
            if (predicate(node)) {
                return node;
            }
        }
        return null;
    }
    /**
     * Convert comment text ranges before and after a node
     * into ts.SynthesizedComments for the node and prevent the
     * comment text ranges to be emitted, to allow
     * changing these comments.
     *
     * This function takes a visitor to be able to do some
     * state management after the caller is done changing a node.
     */
    function visitNodeWithSynthesizedComments(context, sourceFile, node, visitor) {
        if (node.flags & ts.NodeFlags.Synthesized) {
            return visitor(node);
        }
        if (node.kind === ts.SyntaxKind.Block) {
            var block_1 = node;
            node = visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, block_1.statements, function (node, stmts) { return visitor(ts.updateBlock(block_1, stmts)); });
        }
        else if (node.kind === ts.SyntaxKind.SourceFile) {
            node = visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, sourceFile.statements, function (node, stmts) { return visitor(updateSourceFileNode(sourceFile, stmts)); });
        }
        else {
            // In arrow functions with expression bodies (`(x) => expr`), do not synthesize comment nodes
            // that precede the body expression. When downleveling to ES5, TypeScript inserts a return
            // statement and moves the comment in front of it, but then still emits any syntesized comment
            // we create here. That can cause a line comment to be emitted after the return, which causes
            // Automatic Semicolon Insertion, which then breaks the code. See arrow_fn_es5.ts for an
            // example.
            if (node.parent && node.kind !== ts.SyntaxKind.Block &&
                ts.isArrowFunction(node.parent) && node === node.parent.body) {
                return visitor(node);
            }
            var fileContext = assertFileContext(context, sourceFile);
            var leadingLastCommentEnd = synthesizeLeadingComments(sourceFile, node, fileContext.lastCommentEnd);
            var trailingLastCommentEnd = synthesizeTrailingComments(sourceFile, node);
            if (leadingLastCommentEnd !== -1) {
                fileContext.lastCommentEnd = leadingLastCommentEnd;
            }
            node = visitor(node);
            if (trailingLastCommentEnd !== -1) {
                fileContext.lastCommentEnd = trailingLastCommentEnd;
            }
        }
        return resetNodeTextRangeToPreventDuplicateComments(node);
    }
    exports.visitNodeWithSynthesizedComments = visitNodeWithSynthesizedComments;
    /**
     * Reset the text range for some special nodes as otherwise TypeScript
     * would always emit the original comments for them.
     * See https://github.com/Microsoft/TypeScript/issues/17594
     *
     * @param node
     */
    function resetNodeTextRangeToPreventDuplicateComments(node) {
        ts.setEmitFlags(node, (ts.getEmitFlags(node) || 0) | ts.EmitFlags.NoComments);
        // See also emitMissingSyntheticCommentsAfterTypescriptTransform.
        // Note: Don't reset the textRange for ts.ExportDeclaration / ts.ImportDeclaration
        // until after the TypeScript transformer as we need the source location
        // to map the generated `require` calls back to the original
        // ts.ExportDeclaration / ts.ImportDeclaration nodes.
        var allowTextRange = node.kind !== ts.SyntaxKind.ClassDeclaration &&
            node.kind !== ts.SyntaxKind.VariableDeclaration &&
            !(node.kind === ts.SyntaxKind.VariableStatement &&
                util_1.hasModifierFlag(node, ts.ModifierFlags.Export)) &&
            node.kind !== ts.SyntaxKind.ModuleDeclaration;
        if (node.kind === ts.SyntaxKind.PropertyDeclaration) {
            allowTextRange = false;
            var pd = node;
            node = ts.updateProperty(pd, pd.decorators, pd.modifiers, resetTextRange(pd.name), pd.questionToken, pd.type, pd.initializer);
        }
        if (!allowTextRange) {
            node = resetTextRange(node);
        }
        return node;
        function resetTextRange(node) {
            if (!(node.flags & ts.NodeFlags.Synthesized)) {
                // need to clone as we don't want to modify source nodes,
                // as the parsed SourceFiles could be cached!
                node = ts.getMutableClone(node);
            }
            var textRange = { pos: node.pos, end: node.end };
            ts.setSourceMapRange(node, textRange);
            ts.setTextRange(node, { pos: -1, end: -1 });
            return node;
        }
    }
    /**
     * Reads in the leading comment text ranges of the given node,
     * converts them into `ts.SyntheticComment`s and stores them on the node.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     *
     * @param lastCommentEnd The end of the last comment
     * @return The end of the last found comment, -1 if no comment was found.
     */
    function synthesizeLeadingComments(sourceFile, node, lastCommentEnd) {
        var parent = node.parent;
        var sharesStartWithParent = parent && parent.kind !== ts.SyntaxKind.Block &&
            parent.kind !== ts.SyntaxKind.SourceFile && parent.getFullStart() === node.getFullStart();
        if (sharesStartWithParent || lastCommentEnd >= node.getStart()) {
            return -1;
        }
        var adjustedNodeFullStart = Math.max(lastCommentEnd, node.getFullStart());
        var leadingComments = getAllLeadingCommentRanges(sourceFile, adjustedNodeFullStart, node.getStart());
        if (leadingComments && leadingComments.length) {
            ts.setSyntheticLeadingComments(node, synthesizeCommentRanges(sourceFile, leadingComments));
            return node.getStart();
        }
        return -1;
    }
    /**
     * Reads in the trailing comment text ranges of the given node,
     * converts them into `ts.SyntheticComment`s and stores them on the node.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     *
     * @return The end of the last found comment, -1 if no comment was found.
     */
    function synthesizeTrailingComments(sourceFile, node) {
        var parent = node.parent;
        var sharesEndWithParent = parent && parent.kind !== ts.SyntaxKind.Block &&
            parent.kind !== ts.SyntaxKind.SourceFile && parent.getEnd() === node.getEnd();
        if (sharesEndWithParent) {
            return -1;
        }
        var trailingComments = ts.getTrailingCommentRanges(sourceFile.text, node.getEnd());
        if (trailingComments && trailingComments.length) {
            ts.setSyntheticTrailingComments(node, synthesizeCommentRanges(sourceFile, trailingComments));
            return trailingComments[trailingComments.length - 1].end;
        }
        return -1;
    }
    function arrayOf(value) {
        return value ? [value] : [];
    }
    /**
     * Convert leading/trailing detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into
     * `ts.NonEmittedStatement`s with `ts.SynthesizedComment`s and
     * prepends / appends them to the given statement array.
     * This is needed to allow changing these comments.
     *
     * This function takes a visitor to be able to do some
     * state management after the caller is done changing a node.
     */
    function visitNodeStatementsWithSynthesizedComments(context, sourceFile, node, statements, visitor) {
        var leading = synthesizeDetachedLeadingComments(sourceFile, node, statements);
        var trailing = synthesizeDetachedTrailingComments(sourceFile, node, statements);
        if (leading.commentStmt || trailing.commentStmt) {
            var newStatements = __spread(arrayOf(leading.commentStmt), statements, arrayOf(trailing.commentStmt));
            statements = ts.setTextRange(ts.createNodeArray(newStatements), { pos: -1, end: -1 });
            /**
             * The visitor creates a new node with the new statements. However, doing so
             * reveals a TypeScript bug.
             * To reproduce comment out the line below and compile:
             *
             * // ......
             *
             * abstract class A {
             * }
             * abstract class B extends A {
             *   // ......
             * }
             *
             * Note that newlines are significant. This would result in the following:
             * runtime error "TypeError: Cannot read property 'members' of undefined".
             *
             * The line below is a workaround that ensures that updateSourceFileNode and
             * updateBlock never create new Nodes.
             * TODO(#634): file a bug with TS team.
             */
            node.statements = statements;
            var fileContext = assertFileContext(context, sourceFile);
            if (leading.lastCommentEnd !== -1) {
                fileContext.lastCommentEnd = leading.lastCommentEnd;
            }
            node = visitor(node, statements);
            if (trailing.lastCommentEnd !== -1) {
                fileContext.lastCommentEnd = trailing.lastCommentEnd;
            }
            ts.setOriginalNode((leading.commentStmt || trailing.commentStmt), node);
            return node;
        }
        return visitor(node, statements);
    }
    /**
     * Convert leading detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into a
     * `ts.NonEmittedStatement` with `ts.SynthesizedComment`s.
     *
     * A Detached leading comment is the first comment in a SourceFile / Block
     * that is separated with a newline from the first statement.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     */
    function synthesizeDetachedLeadingComments(sourceFile, node, statements) {
        var triviaEnd = statements.end;
        if (statements.length) {
            triviaEnd = statements[0].getStart();
        }
        var detachedComments = getDetachedLeadingCommentRanges(sourceFile, statements.pos, triviaEnd);
        if (!detachedComments.length) {
            return { commentStmt: null, lastCommentEnd: -1 };
        }
        var lastCommentEnd = detachedComments[detachedComments.length - 1].end;
        var commentStmt = createNotEmittedStatement(sourceFile);
        ts.setSyntheticTrailingComments(commentStmt, synthesizeCommentRanges(sourceFile, detachedComments));
        return { commentStmt: commentStmt, lastCommentEnd: lastCommentEnd };
    }
    /**
     * Convert trailing detached comment ranges of statement arrays
     * (e.g. the statements of a ts.SourceFile or ts.Block) into a
     * `ts.NonEmittedStatement` with `ts.SynthesizedComment`s.
     *
     * A Detached trailing comment are all comments after the first newline
     * the follows the last statement in a SourceFile / Block.
     *
     * Note: This would be greatly simplified with https://github.com/Microsoft/TypeScript/issues/17615.
     */
    function synthesizeDetachedTrailingComments(sourceFile, node, statements) {
        var trailingCommentStart = statements.end;
        if (statements.length) {
            var lastStmt = statements[statements.length - 1];
            var lastStmtTrailingComments = ts.getTrailingCommentRanges(sourceFile.text, lastStmt.end);
            if (lastStmtTrailingComments && lastStmtTrailingComments.length) {
                trailingCommentStart = lastStmtTrailingComments[lastStmtTrailingComments.length - 1].end;
            }
        }
        var detachedComments = getAllLeadingCommentRanges(sourceFile, trailingCommentStart, node.end);
        if (!detachedComments || !detachedComments.length) {
            return { commentStmt: null, lastCommentEnd: -1 };
        }
        var lastCommentEnd = detachedComments[detachedComments.length - 1].end;
        var commentStmt = createNotEmittedStatement(sourceFile);
        ts.setSyntheticLeadingComments(commentStmt, synthesizeCommentRanges(sourceFile, detachedComments));
        return { commentStmt: commentStmt, lastCommentEnd: lastCommentEnd };
    }
    /**
     * Calculates the the detached leading comment ranges in an area of a SourceFile.
     * @param sourceFile The source file
     * @param start Where to start scanning
     * @param end Where to end scanning
     */
    // Note: This code is based on compiler/comments.ts in TypeScript
    function getDetachedLeadingCommentRanges(sourceFile, start, end) {
        var e_1, _a;
        var leadingComments = getAllLeadingCommentRanges(sourceFile, start, end);
        if (!leadingComments || !leadingComments.length) {
            return [];
        }
        var detachedComments = [];
        var lastComment = undefined;
        try {
            for (var leadingComments_1 = __values(leadingComments), leadingComments_1_1 = leadingComments_1.next(); !leadingComments_1_1.done; leadingComments_1_1 = leadingComments_1.next()) {
                var comment = leadingComments_1_1.value;
                if (lastComment) {
                    var lastCommentLine = getLineOfPos(sourceFile, lastComment.end);
                    var commentLine = getLineOfPos(sourceFile, comment.pos);
                    if (commentLine >= lastCommentLine + 2) {
                        // There was a blank line between the last comment and this comment.  This
                        // comment is not part of the copyright comments.  Return what we have so
                        // far.
                        break;
                    }
                }
                detachedComments.push(comment);
                lastComment = comment;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (leadingComments_1_1 && !leadingComments_1_1.done && (_a = leadingComments_1.return)) _a.call(leadingComments_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (detachedComments.length) {
            // All comments look like they could have been part of the copyright header.  Make
            // sure there is at least one blank line between it and the node.  If not, it's not
            // a copyright header.
            var lastCommentLine = getLineOfPos(sourceFile, detachedComments[detachedComments.length - 1].end);
            var nodeLine = getLineOfPos(sourceFile, end);
            if (nodeLine >= lastCommentLine + 2) {
                // Valid detachedComments
                return detachedComments;
            }
        }
        return [];
    }
    function getLineOfPos(sourceFile, pos) {
        return ts.getLineAndCharacterOfPosition(sourceFile, pos).line;
    }
    /**
     * ts.createNotEmittedStatement will create a node whose comments are never emitted except for very
     * specific special cases (/// comments). createNotEmittedStatementWithComments creates a not
     * emitted statement and adds comment ranges from the original statement as synthetic comments to
     * it, so that they get retained in the output.
     */
    function createNotEmittedStatementWithComments(sourceFile, original) {
        var replacement = ts.createNotEmittedStatement(original);
        // NB: synthetic nodes can have pos/end == -1. This is handled by the underlying implementation.
        var leading = ts.getLeadingCommentRanges(sourceFile.text, original.pos) || [];
        var trailing = ts.getTrailingCommentRanges(sourceFile.text, original.end) || [];
        replacement =
            ts.setSyntheticLeadingComments(replacement, synthesizeCommentRanges(sourceFile, leading));
        replacement =
            ts.setSyntheticTrailingComments(replacement, synthesizeCommentRanges(sourceFile, trailing));
        return replacement;
    }
    exports.createNotEmittedStatementWithComments = createNotEmittedStatementWithComments;
    /**
     * Converts `ts.CommentRange`s into `ts.SynthesizedComment`s
     * @param sourceFile
     * @param parsedComments
     */
    function synthesizeCommentRanges(sourceFile, parsedComments) {
        var synthesizedComments = [];
        parsedComments.forEach(function (_a, commentIdx) {
            var kind = _a.kind, pos = _a.pos, end = _a.end, hasTrailingNewLine = _a.hasTrailingNewLine;
            var commentText = sourceFile.text.substring(pos, end).trim();
            if (kind === ts.SyntaxKind.MultiLineCommentTrivia) {
                commentText = commentText.replace(/(^\/\*)|(\*\/$)/g, '');
            }
            else if (kind === ts.SyntaxKind.SingleLineCommentTrivia) {
                if (commentText.startsWith('///')) {
                    // triple-slash comments are typescript specific, ignore them in the output.
                    return;
                }
                commentText = commentText.replace(/(^\/\/)/g, '');
            }
            synthesizedComments.push({ kind: kind, text: commentText, hasTrailingNewLine: hasTrailingNewLine, pos: -1, end: -1 });
        });
        return synthesizedComments;
    }
    /**
     * Creates a non emitted statement that can be used to store synthesized comments.
     */
    function createNotEmittedStatement(sourceFile) {
        var stmt = ts.createNotEmittedStatement(sourceFile);
        ts.setOriginalNode(stmt, undefined);
        ts.setTextRange(stmt, { pos: 0, end: 0 });
        ts.setEmitFlags(stmt, ts.EmitFlags.CustomPrologue);
        return stmt;
    }
    exports.createNotEmittedStatement = createNotEmittedStatement;
    /**
     * Returns the leading comment ranges in the source file that start at the given position.
     * This is the same as `ts.getLeadingCommentRanges`, except that it does not skip
     * comments before the first newline in the range.
     *
     * @param sourceFile
     * @param start Where to start scanning
     * @param end Where to end scanning
     */
    function getAllLeadingCommentRanges(sourceFile, start, end) {
        // exeute ts.getLeadingCommentRanges with pos = 0 so that it does not skip
        // comments until the first newline.
        var commentRanges = ts.getLeadingCommentRanges(sourceFile.text.substring(start, end), 0) || [];
        return commentRanges.map(function (cr) { return ({
            hasTrailingNewLine: cr.hasTrailingNewLine,
            kind: cr.kind,
            pos: cr.pos + start,
            end: cr.end + start
        }); });
    }
    /**
     * This is a version of `ts.visitEachChild` that works that calls our version
     * of `updateSourceFileNode`, so that typescript doesn't lose type information
     * for property decorators.
     * See https://github.com/Microsoft/TypeScript/issues/17384
     *
     * @param sf
     * @param statements
     */
    function visitEachChild(node, visitor, context) {
        if (node.kind === ts.SyntaxKind.SourceFile) {
            var sf = node;
            return updateSourceFileNode(sf, ts.visitLexicalEnvironment(sf.statements, visitor, context));
        }
        return ts.visitEachChild(node, visitor, context);
    }
    exports.visitEachChild = visitEachChild;
    /**
     * This is a version of `ts.updateSourceFileNode` that works
     * well with property decorators.
     * See https://github.com/Microsoft/TypeScript/issues/17384
     * TODO(#634): This has been fixed in TS 2.5. Investigate removal.
     *
     * @param sf
     * @param statements
     */
    function updateSourceFileNode(sf, statements) {
        if (statements === sf.statements) {
            return sf;
        }
        // Note: Need to clone the original file (and not use `ts.updateSourceFileNode`)
        // as otherwise TS fails when resolving types for decorators.
        sf = ts.getMutableClone(sf);
        sf.statements = statements;
        return sf;
    }
    exports.updateSourceFileNode = updateSourceFileNode;
    // Copied from TypeScript
    function isTypeNodeKind(kind) {
        return (kind >= ts.SyntaxKind.FirstTypeNode && kind <= ts.SyntaxKind.LastTypeNode) ||
            kind === ts.SyntaxKind.AnyKeyword || kind === ts.SyntaxKind.NumberKeyword ||
            kind === ts.SyntaxKind.ObjectKeyword || kind === ts.SyntaxKind.BooleanKeyword ||
            kind === ts.SyntaxKind.StringKeyword || kind === ts.SyntaxKind.SymbolKeyword ||
            kind === ts.SyntaxKind.ThisKeyword || kind === ts.SyntaxKind.VoidKeyword ||
            kind === ts.SyntaxKind.UndefinedKeyword || kind === ts.SyntaxKind.NullKeyword ||
            kind === ts.SyntaxKind.NeverKeyword || kind === ts.SyntaxKind.ExpressionWithTypeArguments;
    }
    exports.isTypeNodeKind = isTypeNodeKind;
    /**
     * Creates a string literal that uses single quotes. Purely cosmetic, but increases fidelity to the
     * existing test suite.
     */
    function createSingleQuoteStringLiteral(text) {
        var stringLiteral = ts.createLiteral(text);
        // tslint:disable-next-line:no-any accessing TS internal API.
        stringLiteral.singleQuote = true;
        return stringLiteral;
    }
    exports.createSingleQuoteStringLiteral = createSingleQuoteStringLiteral;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXJfdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cmFuc2Zvcm1lcl91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRUgsMkNBQW1DO0lBQ25DLHlDQUF1QztJQUV2Qzs7O09BR0c7SUFDSCxrQ0FBeUMsS0FBNEI7UUFDbkUsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbkQsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDaEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sRUFBQyxNQUFNLFFBQUEsRUFBRSxLQUFLLE9BQUEsRUFBQyxDQUFDO0lBQ3pCLENBQUM7SUFQRCw0REFPQztJQUVEOzs7O09BSUc7SUFDSCx1Q0FBOEMsT0FBaUM7UUFFN0UsT0FBTyxVQUFDLEVBQWlCO1lBQ3ZCLDhCQUE4QixDQUFVO2dCQUN0QyxPQUFPLGNBQWMsQ0FDakIsQ0FBQyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsZ0NBQWdDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsb0JBQW9CLENBQUMsRUFBdEUsQ0FBc0UsRUFDaEYsT0FBTyxDQUFDLENBQUM7WUFDZixDQUFDO1lBQ0QsT0FBTyxnQ0FBZ0MsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxvQkFBb0IsQ0FBa0IsQ0FBQztRQUNsRyxDQUFDLENBQUM7SUFDSixDQUFDO0lBVkQsc0VBVUM7SUFFRDs7T0FFRztJQUNILHlCQUF5QixPQUFpQztRQUN4RCxPQUFPLFVBQUMsVUFBeUI7WUFDOUIsT0FBaUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0UsT0FBTyxVQUFVLENBQUM7UUFDcEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELDJCQUEyQixPQUE4QixFQUFFLFVBQXlCO1FBQ2xGLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQ1gsOENBQThDO2dCQUM5QyxxRUFBbUU7aUJBQ25FLFdBQVMsVUFBVSxDQUFDLFFBQVUsQ0FBQSxDQUFDLENBQUM7U0FDckM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUMsUUFBUSxFQUFFO1lBQzdELE1BQU0sSUFBSSxLQUFLLENBQ1gsa0VBQWdFLFVBQVUsQ0FBQyxRQUFVLENBQUMsQ0FBQztTQUM1RjtRQUNELE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUM3QixDQUFDO0lBU0Q7Ozs7Ozs7T0FPRztJQUNIO1FBVUUscUJBQW1CLElBQW1CO1lBQW5CLFNBQUksR0FBSixJQUFJLENBQWU7WUFUdEM7Ozs7O2VBS0c7WUFDSCx5QkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztZQUM3RCxpQ0FBNEIsR0FBcUQsRUFBRSxDQUFDO1lBQ3BGLG1CQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcUIsQ0FBQztRQUM1QyxrQkFBQztJQUFELENBQUMsQUFYRCxJQVdDO0lBRUQ7Ozs7T0FJRztJQUNILCtDQUErQyxPQUFpQztRQUM5RSxPQUFPLFVBQUMsVUFBeUI7WUFDL0IsSUFBTSxPQUFPLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXZELElBQU0sUUFBUSxHQUFjLEVBQUUsQ0FBQztZQUMvQixTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEIsT0FBTyxVQUFVLENBQUM7WUFFbEIsbUJBQW1CLElBQWE7Z0JBQzlCLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUU3QyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUU7b0JBQ3pDLDRDQUE0QztvQkFDNUMsc0RBQXNEO29CQUN0RCx5REFBeUQ7b0JBQ3pELHlDQUF5QztvQkFDekMsNEVBQTRFO29CQUM1RSwyREFBMkQ7b0JBQzNELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2lCQUN0QjtnQkFDRCxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFL0MsSUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFOUMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCO29CQUM3QyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUU7b0JBQ2pELElBQU0sR0FBRyxHQUFHLElBQW1ELENBQUM7b0JBQ2hFLElBQUksR0FBRyxDQUFDLGVBQWUsRUFBRTt3QkFDdkIsT0FBTyxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDaEQ7aUJBQ0Y7Z0JBRUQsVUFBVTtnQkFDVixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3QixRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDakIsQ0FBQztRQUNILENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsOERBQThELE9BQWlDO1FBQzdGLE9BQU8sVUFBQyxVQUF5QjtZQUMvQixJQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDM0QsSUFBTSxRQUFRLEdBQWMsRUFBRSxDQUFDO1lBQy9CLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNyQixPQUFpQyxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7WUFDM0QsT0FBTyxVQUFVLENBQUM7WUFFbEIsbUJBQW1CLElBQWE7Z0JBQzlCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtvQkFDMUMsSUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0QsSUFBTSxPQUFPLEdBQUcsT0FBTyxJQUFJLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3pFLElBQU0sT0FBTyxHQUFHLE9BQU8sSUFBSSxXQUFXLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUV6RSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUU7d0JBQ2pFLDBFQUEwRTt3QkFDMUUscUJBQXFCO3dCQUNyQiw2REFBNkQ7d0JBQzdELElBQU0sY0FBYyxHQUNoQixZQUFZLENBQUMsUUFBUSxFQUFFLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUEvQyxDQUErQyxDQUFDLENBQUM7d0JBQ3RGLElBQUksY0FBYyxFQUFFOzRCQUNsQixFQUFFLENBQUMsMkJBQTJCLENBQzFCLGNBQWMsRUFBRSxFQUFFLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7eUJBQ3BFO3FCQUNGO3lCQUFNLElBQ0gsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUI7d0JBQzNELHNCQUFlLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ3JELCtEQUErRDt3QkFDL0QsNkRBQTZEO3dCQUM3RCxJQUFNLGNBQWMsR0FDaEIsWUFBWSxDQUFDLFFBQVEsRUFBRSxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO3dCQUN0RixJQUFJLGNBQWMsRUFBRTs0QkFDbEIsRUFBRSxDQUFDLDJCQUEyQixDQUMxQixjQUFjLEVBQUUsRUFBRSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO3lCQUNwRTtxQkFDRjtpQkFDRjtnQkFDRCx5RUFBeUU7Z0JBQ3pFLDJGQUEyRjtnQkFDM0YsOERBQThEO2dCQUM5RCxJQUFJLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyw0QkFBNEIsRUFBRTtvQkFDaEYsd0RBQXdEO29CQUN4RCxjQUFjO29CQUNkLElBQU0sMkJBQTJCLEdBQzdCLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQXBCLENBQW9CLENBQUMsQ0FBQztvQkFDL0UsSUFBSSwyQkFBMkIsRUFBRTt3QkFDL0IsRUFBRSxDQUFDLDJCQUEyQixDQUMxQixJQUFJLEVBQUUsRUFBRSxDQUFDLDJCQUEyQixDQUFDLDJCQUEyQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7cUJBQzlFO29CQUNELDJFQUEyRTtvQkFDM0UsMkVBQTJFO29CQUMzRSx3RkFBd0Y7b0JBQ3hGLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBQyxDQUFDLENBQUM7b0JBQzNELEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7aUJBQzNDO2dCQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzdCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNqQixDQUFDO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELG9DQUFvQyxJQUFhO1FBQy9DLCtGQUErRjtRQUMvRixxQkFBcUI7UUFDckIsSUFBSSxRQUEyQixDQUFDO1FBQ2hDLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hDLElBQU0sT0FBTyxHQUFHLElBQTRCLENBQUM7WUFDN0MsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUM7WUFDbkQsSUFBSSxJQUFJLFNBQXlCLENBQUM7WUFDbEMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7Z0JBQ3BELElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUU7Z0JBQzlDLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxRQUFRLEdBQUcsSUFBeUIsQ0FBQztTQUN0QzthQUFNLElBQUksRUFBRSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDakYsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7U0FDNUI7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVTtZQUNwRCxRQUFRLENBQUMsVUFBNEIsQ0FBQyxJQUFJLEtBQUssU0FBUztZQUN6RCxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbkMsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsT0FBTyxVQUFVLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO0lBQ3pELENBQUM7SUFFRCxzQkFBc0IsS0FBZ0IsRUFBRSxTQUFxQztRQUMzRSxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNuQixPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILDBDQUNJLE9BQWlDLEVBQUUsVUFBeUIsRUFBRSxJQUFPLEVBQ3JFLE9BQXVCO1FBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRTtZQUN6QyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN0QjtRQUNELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRTtZQUNyQyxJQUFNLE9BQUssR0FBRyxJQUEyQixDQUFDO1lBQzFDLElBQUksR0FBRywwQ0FBMEMsQ0FDN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsT0FBSyxDQUFDLFVBQVUsRUFDM0MsVUFBQyxJQUFJLEVBQUUsS0FBSyxJQUFLLE9BQUEsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBSyxFQUFFLEtBQUssQ0FBaUIsQ0FBQyxFQUFyRCxDQUFxRCxDQUFDLENBQUM7U0FDN0U7YUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDakQsSUFBSSxHQUFHLDBDQUEwQyxDQUM3QyxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsVUFBVSxFQUNoRCxVQUFDLElBQUksRUFBRSxLQUFLLElBQUssT0FBQSxPQUFPLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBaUIsQ0FBQyxFQUFoRSxDQUFnRSxDQUFDLENBQUM7U0FDeEY7YUFBTTtZQUNMLDZGQUE2RjtZQUM3RiwwRkFBMEY7WUFDMUYsOEZBQThGO1lBQzlGLDZGQUE2RjtZQUM3Rix3RkFBd0Y7WUFDeEYsV0FBVztZQUNYLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSyxJQUFnQixDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUs7Z0JBQzdELEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFLLElBQWdCLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQzdFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3RCO1lBQ0QsSUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzNELElBQU0scUJBQXFCLEdBQ3ZCLHlCQUF5QixDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVFLElBQU0sc0JBQXNCLEdBQUcsMEJBQTBCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVFLElBQUkscUJBQXFCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hDLFdBQVcsQ0FBQyxjQUFjLEdBQUcscUJBQXFCLENBQUM7YUFDcEQ7WUFDRCxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JCLElBQUksc0JBQXNCLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pDLFdBQVcsQ0FBQyxjQUFjLEdBQUcsc0JBQXNCLENBQUM7YUFDckQ7U0FDRjtRQUNELE9BQU8sNENBQTRDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQXZDRCw0RUF1Q0M7SUFFRDs7Ozs7O09BTUc7SUFDSCxzREFBeUUsSUFBTztRQUM5RSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RSxpRUFBaUU7UUFDakUsa0ZBQWtGO1FBQ2xGLHdFQUF3RTtRQUN4RSw0REFBNEQ7UUFDNUQscURBQXFEO1FBQ3JELElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7WUFDN0QsSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLG1CQUFtQjtZQUMvQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQjtnQkFDN0Msc0JBQWUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUM7UUFDbEQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUU7WUFDbkQsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFNLEVBQUUsR0FBRyxJQUF5QyxDQUFDO1lBQ3JELElBQUksR0FBRyxFQUFFLENBQUMsY0FBYyxDQUNiLEVBQUUsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQW9CLEVBQzNFLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFpQixDQUFDO1NBQ3ZFO1FBQ0QsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNuQixJQUFJLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsT0FBTyxJQUFJLENBQUM7UUFFWix3QkFBMkMsSUFBTztZQUNoRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQzVDLHlEQUF5RDtnQkFDekQsNkNBQTZDO2dCQUM3QyxJQUFJLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNqQztZQUNELElBQU0sU0FBUyxHQUFHLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUMsQ0FBQztZQUNqRCxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDMUMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsbUNBQ0ksVUFBeUIsRUFBRSxJQUFhLEVBQUUsY0FBc0I7UUFDbEUsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMzQixJQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSztZQUN2RSxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDOUYsSUFBSSxxQkFBcUIsSUFBSSxjQUFjLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQzlELE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDWDtRQUNELElBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDNUUsSUFBTSxlQUFlLEdBQ2pCLDBCQUEwQixDQUFDLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNuRixJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFO1lBQzdDLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDM0YsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDeEI7UUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxvQ0FBb0MsVUFBeUIsRUFBRSxJQUFhO1FBQzFFLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDM0IsSUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUs7WUFDckUsTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xGLElBQUksbUJBQW1CLEVBQUU7WUFDdkIsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNYO1FBQ0QsSUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNyRixJQUFJLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtZQUMvQyxFQUFFLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDN0YsT0FBTyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFRCxpQkFBb0IsS0FBdUI7UUFDekMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsb0RBQ0ksT0FBaUMsRUFBRSxVQUF5QixFQUFFLElBQU8sRUFDckUsVUFBc0MsRUFDdEMsT0FBK0Q7UUFDakUsSUFBTSxPQUFPLEdBQUcsaUNBQWlDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNoRixJQUFNLFFBQVEsR0FBRyxrQ0FBa0MsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xGLElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO1lBQy9DLElBQU0sYUFBYSxZQUNYLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUssVUFBVSxFQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN2RixVQUFVLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7WUFFcEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFtQkc7WUFDRixJQUFpQyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFFM0QsSUFBTSxXQUFXLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzNELElBQUksT0FBTyxDQUFDLGNBQWMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDakMsV0FBVyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO2FBQ3JEO1lBQ0QsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDakMsSUFBSSxRQUFRLENBQUMsY0FBYyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNsQyxXQUFXLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUM7YUFDdEQ7WUFDRCxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekUsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU8sT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsMkNBQ0ksVUFBeUIsRUFBRSxJQUFhLEVBQUUsVUFBc0M7UUFFbEYsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztRQUMvQixJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDckIsU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN0QztRQUNELElBQU0sZ0JBQWdCLEdBQUcsK0JBQStCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDaEcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtZQUM1QixPQUFPLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQztTQUNoRDtRQUNELElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDekUsSUFBTSxXQUFXLEdBQUcseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUQsRUFBRSxDQUFDLDRCQUE0QixDQUMzQixXQUFXLEVBQUUsdUJBQXVCLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUN4RSxPQUFPLEVBQUMsV0FBVyxhQUFBLEVBQUUsY0FBYyxnQkFBQSxFQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILDRDQUNJLFVBQXlCLEVBQUUsSUFBYSxFQUFFLFVBQXNDO1FBRWxGLElBQUksb0JBQW9CLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztRQUMxQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDckIsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkQsSUFBTSx3QkFBd0IsR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUYsSUFBSSx3QkFBd0IsSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQy9ELG9CQUFvQixHQUFHLHdCQUF3QixDQUFDLHdCQUF3QixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7YUFDMUY7U0FDRjtRQUNELElBQU0sZ0JBQWdCLEdBQUcsMEJBQTBCLENBQUMsVUFBVSxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7WUFDakQsT0FBTyxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUM7U0FDaEQ7UUFDRCxJQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3pFLElBQU0sV0FBVyxHQUFHLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFELEVBQUUsQ0FBQywyQkFBMkIsQ0FDMUIsV0FBVyxFQUFFLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDeEUsT0FBTyxFQUFDLFdBQVcsYUFBQSxFQUFFLGNBQWMsZ0JBQUEsRUFBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGlFQUFpRTtJQUNqRSx5Q0FDSSxVQUF5QixFQUFFLEtBQWEsRUFBRSxHQUFXOztRQUN2RCxJQUFNLGVBQWUsR0FBRywwQkFBMEIsQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO1lBQy9DLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxJQUFNLGdCQUFnQixHQUFzQixFQUFFLENBQUM7UUFDL0MsSUFBSSxXQUFXLEdBQThCLFNBQVMsQ0FBQzs7WUFFdkQsS0FBc0IsSUFBQSxvQkFBQSxTQUFBLGVBQWUsQ0FBQSxnREFBQSw2RUFBRTtnQkFBbEMsSUFBTSxPQUFPLDRCQUFBO2dCQUNoQixJQUFJLFdBQVcsRUFBRTtvQkFDZixJQUFNLGVBQWUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbEUsSUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBRTFELElBQUksV0FBVyxJQUFJLGVBQWUsR0FBRyxDQUFDLEVBQUU7d0JBQ3RDLDBFQUEwRTt3QkFDMUUseUVBQXlFO3dCQUN6RSxPQUFPO3dCQUNQLE1BQU07cUJBQ1A7aUJBQ0Y7Z0JBRUQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQixXQUFXLEdBQUcsT0FBTyxDQUFDO2FBQ3ZCOzs7Ozs7Ozs7UUFFRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtZQUMzQixrRkFBa0Y7WUFDbEYsbUZBQW1GO1lBQ25GLHNCQUFzQjtZQUN0QixJQUFNLGVBQWUsR0FDakIsWUFBWSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEYsSUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMvQyxJQUFJLFFBQVEsSUFBSSxlQUFlLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQyx5QkFBeUI7Z0JBQ3pCLE9BQU8sZ0JBQWdCLENBQUM7YUFDekI7U0FDRjtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELHNCQUFzQixVQUF5QixFQUFFLEdBQVc7UUFDMUQsT0FBTyxFQUFFLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNoRSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCwrQ0FDSSxVQUF5QixFQUFFLFFBQWlCO1FBQzlDLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RCxnR0FBZ0c7UUFDaEcsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoRixJQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xGLFdBQVc7WUFDUCxFQUFFLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzlGLFdBQVc7WUFDUCxFQUFFLENBQUMsNEJBQTRCLENBQUMsV0FBVyxFQUFFLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFYRCxzRkFXQztJQUVEOzs7O09BSUc7SUFDSCxpQ0FDSSxVQUF5QixFQUFFLGNBQWlDO1FBQzlELElBQU0sbUJBQW1CLEdBQTRCLEVBQUUsQ0FBQztRQUN4RCxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBb0MsRUFBRSxVQUFVO2dCQUEvQyxjQUFJLEVBQUUsWUFBRyxFQUFFLFlBQUcsRUFBRSwwQ0FBa0I7WUFDekQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdELElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2pELFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzNEO2lCQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ3pELElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDakMsNEVBQTRFO29CQUM1RSxPQUFPO2lCQUNSO2dCQUNELFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNuRDtZQUNELG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksTUFBQSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsa0JBQWtCLG9CQUFBLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7UUFDNUYsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLG1CQUFtQixDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNILG1DQUEwQyxVQUF5QjtRQUNqRSxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEQsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDcEMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBTkQsOERBTUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILG9DQUNJLFVBQXlCLEVBQUUsS0FBYSxFQUFFLEdBQVc7UUFDdkQsMEVBQTBFO1FBQzFFLG9DQUFvQztRQUNwQyxJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqRyxPQUFPLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxDQUFDO1lBQ0wsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLGtCQUFrQjtZQUN6QyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQWM7WUFDdkIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsS0FBSztZQUNuQixHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxLQUFLO1NBQ3BCLENBQUMsRUFMSSxDQUtKLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCx3QkFDSSxJQUFhLEVBQUUsT0FBbUIsRUFBRSxPQUFpQztRQUN2RSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDMUMsSUFBTSxFQUFFLEdBQUcsSUFBcUIsQ0FBQztZQUNqQyxPQUFPLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUM5RjtRQUVELE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFSRCx3Q0FRQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsOEJBQ0ksRUFBaUIsRUFBRSxVQUFzQztRQUMzRCxJQUFJLFVBQVUsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFO1lBQ2hDLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxnRkFBZ0Y7UUFDaEYsNkRBQTZEO1FBQzdELEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzNCLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQVZELG9EQVVDO0lBRUQseUJBQXlCO0lBQ3pCLHdCQUErQixJQUFtQjtRQUNoRCxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztZQUM5RSxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYTtZQUN6RSxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYztZQUM3RSxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYTtZQUM1RSxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVztZQUN4RSxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXO1lBQzdFLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQztJQUNoRyxDQUFDO0lBUkQsd0NBUUM7SUFFRDs7O09BR0c7SUFDSCx3Q0FBK0MsSUFBWTtRQUN6RCxJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLDZEQUE2RDtRQUM1RCxhQUFxQixDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDMUMsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUxELHdFQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtoYXNNb2RpZmllckZsYWd9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogQWRqdXN0cyB0aGUgZ2l2ZW4gQ3VzdG9tVHJhbnNmb3JtZXJzIHdpdGggYWRkaXRpb25hbCB0cmFuc2Zvcm1lcnNcbiAqIHRvIGZpeCBidWdzIGluIFR5cGVTY3JpcHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21UcmFuc2Zvcm1lcnMoZ2l2ZW46IHRzLkN1c3RvbVRyYW5zZm9ybWVycyk6IHRzLkN1c3RvbVRyYW5zZm9ybWVycyB7XG4gIGNvbnN0IGJlZm9yZSA9IGdpdmVuLmJlZm9yZSB8fCBbXTtcbiAgYmVmb3JlLnVuc2hpZnQoYWRkRmlsZUNvbnRleHRzKTtcbiAgYmVmb3JlLnB1c2gocHJlcGFyZU5vZGVzQmVmb3JlVHlwZVNjcmlwdFRyYW5zZm9ybSk7XG4gIGNvbnN0IGFmdGVyID0gZ2l2ZW4uYWZ0ZXIgfHwgW107XG4gIGFmdGVyLnVuc2hpZnQoZW1pdE1pc3NpbmdTeW50aGV0aWNDb21tZW50c0FmdGVyVHlwZXNjcmlwdFRyYW5zZm9ybSk7XG4gIHJldHVybiB7YmVmb3JlLCBhZnRlcn07XG59XG5cbi8qKlxuICogQSB0cmFuc2Zvcm1lciB0aGF0IGRvZXMgbm90aGluZywgYnV0IHN5bnRoZXNpemVzIGFsbCBjb21tZW50cy4gVGhpcyBhbGxvd3MgdGVzdGluZyB0cmFuc2Zvcm1lcnNcbiAqIGluIGlzb2xhdGlvbiwgYnV0IHdpdGggYW4gQVNUIGFuZCBjb21tZW50IHBsYWNlbWVudCB0aGF0IG1hdGNoZXMgd2hhdCdkIGhhcHBlbiBhZnRlciBhIHNvdXJjZSBtYXBcbiAqIGJhc2VkIHRyYW5zZm9ybWVyIHJhbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN5bnRoZXNpemVDb21tZW50c1RyYW5zZm9ybWVyKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6XG4gICAgdHMuVHJhbnNmb3JtZXI8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKHNmOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG4gICAgZnVuY3Rpb24gdmlzaXROb2RlUmVjdXJzaXZlbHkobjogdHMuTm9kZSk6IHRzLk5vZGUge1xuICAgICAgcmV0dXJuIHZpc2l0RWFjaENoaWxkKFxuICAgICAgICAgIG4sIChuKSA9PiB2aXNpdE5vZGVXaXRoU3ludGhlc2l6ZWRDb21tZW50cyhjb250ZXh0LCBzZiwgbiwgdmlzaXROb2RlUmVjdXJzaXZlbHkpLFxuICAgICAgICAgIGNvbnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gdmlzaXROb2RlV2l0aFN5bnRoZXNpemVkQ29tbWVudHMoY29udGV4dCwgc2YsIHNmLCB2aXNpdE5vZGVSZWN1cnNpdmVseSkgYXMgdHMuU291cmNlRmlsZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhhdCBhZGRzIHRoZSBGaWxlQ29udGV4dCB0byB0aGUgVHJhbnNmb3JtYXRpb25Db250ZXh0LlxuICovXG5mdW5jdGlvbiBhZGRGaWxlQ29udGV4dHMoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSB7XG4gIHJldHVybiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIChjb250ZXh0IGFzIFRyYW5zZm9ybWF0aW9uQ29udGV4dCkuZmlsZUNvbnRleHQgPSBuZXcgRmlsZUNvbnRleHQoc291cmNlRmlsZSk7XG4gICAgcmV0dXJuIHNvdXJjZUZpbGU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFzc2VydEZpbGVDb250ZXh0KGNvbnRleHQ6IFRyYW5zZm9ybWF0aW9uQ29udGV4dCwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IEZpbGVDb250ZXh0IHtcbiAgaWYgKCFjb250ZXh0LmZpbGVDb250ZXh0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSWxsZWdhbCBTdGF0ZTogRmlsZUNvbnRleHQgbm90IGluaXRpYWxpemVkLiBgICtcbiAgICAgICAgYERpZCB5b3UgZm9yZ2V0IHRvIGFkZCB0aGUgXCJmaXJzdFRyYW5zZm9ybVwiIGFzIGZpcnN0IHRyYW5zZm9ybWVyPyBgICtcbiAgICAgICAgYEZpbGU6ICR7c291cmNlRmlsZS5maWxlTmFtZX1gKTtcbiAgfVxuICBpZiAoY29udGV4dC5maWxlQ29udGV4dC5maWxlLmZpbGVOYW1lICE9PSBzb3VyY2VGaWxlLmZpbGVOYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgSWxsZWdhbCBTdGF0ZTogRmlsZSBvZiB0aGUgRmlsZUNvbnRleHQgZG9lcyBub3QgbWF0Y2guIEZpbGU6ICR7c291cmNlRmlsZS5maWxlTmFtZX1gKTtcbiAgfVxuICByZXR1cm4gY29udGV4dC5maWxlQ29udGV4dDtcbn1cblxuLyoqXG4gKiBBbiBleHRlbmRlZCB2ZXJzaW9uIG9mIHRoZSBUcmFuc2Zvcm1hdGlvbkNvbnRleHQgdGhhdCBzdG9yZXMgdGhlIEZpbGVDb250ZXh0IGFzIHdlbGwuXG4gKi9cbmludGVyZmFjZSBUcmFuc2Zvcm1hdGlvbkNvbnRleHQgZXh0ZW5kcyB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQge1xuICBmaWxlQ29udGV4dD86IEZpbGVDb250ZXh0O1xufVxuXG4vKipcbiAqIEEgY29udGV4dCB0aGF0IHN0b3JlcyBpbmZvcm1hdGlvbiBwZXIgZmlsZSB0byBlLmcuIGFsbG93IGNvbW11bmljYXRpb25cbiAqIGJldHdlZW4gdHJhbnNmb3JtZXJzLlxuICogVGhlcmUgaXMgb25lIHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCBwZXIgZW1pdCxcbiAqIGJ1dCBmaWxlcyBhcmUgaGFuZGxlZCBzZXF1ZW50aWFsbHkgYnkgYWxsIHRyYW5zZm9ybWVycy4gVGhlZm9yZSB3ZSBjYW5cbiAqIHN0b3JlIGZpbGUgcmVsYXRlZCBpbmZvcm1hdGlvbiBvbiBhIHByb3BlcnR5IG9uIHRoZSB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQsXG4gKiBnaXZlbiB0aGF0IHdlIHJlc2V0IGl0IGluIHRoZSBmaXJzdCB0cmFuc2Zvcm1lci5cbiAqL1xuY2xhc3MgRmlsZUNvbnRleHQge1xuICAvKipcbiAgICogU3RvcmVzIHRoZSBwYXJlbnQgbm9kZSBmb3IgYWxsIHByb2Nlc3NlZCBub2Rlcy5cbiAgICogVGhpcyBpcyBuZWVkZWQgZm9yIG5vZGVzIGZyb20gdGhlIHBhcnNlIHRyZWUgdGhhdCBhcmUgdXNlZFxuICAgKiBpbiBhIHN5bnRoZXRpYyBub2RlIGFzIG11c3Qgbm90IG1vZGlmeSB0aGVzZSwgZXZlbiB0aG91Z2ggdGhleVxuICAgKiBoYXZlIGEgbmV3IHBhcmVudCBub3cuXG4gICAqL1xuICBzeW50aGV0aWNOb2RlUGFyZW50cyA9IG5ldyBNYXA8dHMuTm9kZSwgdHMuTm9kZXx1bmRlZmluZWQ+KCk7XG4gIGltcG9ydE9yUmVleHBvcnREZWNsYXJhdGlvbnM6IEFycmF5PHRzLkV4cG9ydERlY2xhcmF0aW9ufHRzLkltcG9ydERlY2xhcmF0aW9uPiA9IFtdO1xuICBsYXN0Q29tbWVudEVuZCA9IC0xO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmlsZTogdHMuU291cmNlRmlsZSkge31cbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhhdCBuZWVkcyB0byBiZSBleGVjdXRlZCByaWdodCBiZWZvcmUgVHlwZVNjcmlwdCdzIHRyYW5zZm9ybS5cbiAqXG4gKiBUaGlzIHByZXBhcmVzIHRoZSBub2RlIHRyZWUgdG8gd29ya2Fyb3VuZCBzb21lIGJ1Z3MgaW4gdGhlIFR5cGVTY3JpcHQgZW1pdHRlci5cbiAqL1xuZnVuY3Rpb24gcHJlcGFyZU5vZGVzQmVmb3JlVHlwZVNjcmlwdFRyYW5zZm9ybShjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpIHtcbiAgcmV0dXJuIChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG4gICAgY29uc3QgZmlsZUN0eCA9IGFzc2VydEZpbGVDb250ZXh0KGNvbnRleHQsIHNvdXJjZUZpbGUpO1xuXG4gICAgY29uc3Qgbm9kZVBhdGg6IHRzLk5vZGVbXSA9IFtdO1xuICAgIHZpc2l0Tm9kZShzb3VyY2VGaWxlKTtcbiAgICByZXR1cm4gc291cmNlRmlsZTtcblxuICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSBub2RlUGF0aFtub2RlUGF0aC5sZW5ndGggLSAxXTtcblxuICAgICAgaWYgKG5vZGUuZmxhZ3MgJiB0cy5Ob2RlRmxhZ3MuU3ludGhlc2l6ZWQpIHtcbiAgICAgICAgLy8gU2V0IGBwYXJlbnRgIGZvciBzeW50aGV0aWMgbm9kZXMgYXMgd2VsbCxcbiAgICAgICAgLy8gYXMgb3RoZXJ3aXNlIHRoZSBUUyBlbWl0IHdpbGwgY3Jhc2ggZm9yIGRlY29yYXRvcnMuXG4gICAgICAgIC8vIE5vdGU6IGRvbid0IHVwZGF0ZSB0aGUgYHBhcmVudGAgb2Ygb3JpZ2luYWwgbm9kZXMsIGFzOlxuICAgICAgICAvLyAxKSB3ZSBkb24ndCB3YW50IHRvIGNoYW5nZSB0aGVtIGF0IGFsbFxuICAgICAgICAvLyAyKSBUUyBlbWl0IGJlY29tZXMgZXJyb3JuZW91cyBpbiBzb21lIGNhc2VzIGlmIHdlIGFkZCBhIHN5bnRoZXRpYyBwYXJlbnQuXG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3Mzg0XG4gICAgICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xuICAgICAgfVxuICAgICAgZmlsZUN0eC5zeW50aGV0aWNOb2RlUGFyZW50cy5zZXQobm9kZSwgcGFyZW50KTtcblxuICAgICAgY29uc3Qgb3JpZ2luYWxOb2RlID0gdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpO1xuXG4gICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cG9ydERlY2xhcmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGllZCA9IG5vZGUgYXMgdHMuSW1wb3J0RGVjbGFyYXRpb24gfCB0cy5FeHBvcnREZWNsYXJhdGlvbjtcbiAgICAgICAgaWYgKGllZC5tb2R1bGVTcGVjaWZpZXIpIHtcbiAgICAgICAgICBmaWxlQ3R4LmltcG9ydE9yUmVleHBvcnREZWNsYXJhdGlvbnMucHVzaChpZWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHJlY3Vyc2VcbiAgICAgIG5vZGVQYXRoLnB1c2gobm9kZSk7XG4gICAgICBub2RlLmZvckVhY2hDaGlsZCh2aXNpdE5vZGUpO1xuICAgICAgbm9kZVBhdGgucG9wKCk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGF0IG5lZWRzIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIFR5cGVTY3JpcHQncyB0cmFuc2Zvcm0uXG4gKlxuICogVGhpcyBmaXhlcyBwbGFjZXMgd2hlcmUgdGhlIFR5cGVTY3JpcHQgdHJhbnNmb3JtZXIgZG9lcyBub3RcbiAqIGVtaXQgc3ludGhldGljIGNvbW1lbnRzLlxuICpcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTk0XG4gKi9cbmZ1bmN0aW9uIGVtaXRNaXNzaW5nU3ludGhldGljQ29tbWVudHNBZnRlclR5cGVzY3JpcHRUcmFuc2Zvcm0oY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSB7XG4gIHJldHVybiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIGNvbnN0IGZpbGVDb250ZXh0ID0gYXNzZXJ0RmlsZUNvbnRleHQoY29udGV4dCwgc291cmNlRmlsZSk7XG4gICAgY29uc3Qgbm9kZVBhdGg6IHRzLk5vZGVbXSA9IFtdO1xuICAgIHZpc2l0Tm9kZShzb3VyY2VGaWxlKTtcbiAgICAoY29udGV4dCBhcyBUcmFuc2Zvcm1hdGlvbkNvbnRleHQpLmZpbGVDb250ZXh0ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzb3VyY2VGaWxlO1xuXG4gICAgZnVuY3Rpb24gdmlzaXROb2RlKG5vZGU6IHRzLk5vZGUpIHtcbiAgICAgIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICBjb25zdCBwYXJlbnQxID0gZmlsZUNvbnRleHQuc3ludGhldGljTm9kZVBhcmVudHMuZ2V0KG5vZGUpO1xuICAgICAgICBjb25zdCBwYXJlbnQyID0gcGFyZW50MSAmJiBmaWxlQ29udGV4dC5zeW50aGV0aWNOb2RlUGFyZW50cy5nZXQocGFyZW50MSk7XG4gICAgICAgIGNvbnN0IHBhcmVudDMgPSBwYXJlbnQyICYmIGZpbGVDb250ZXh0LnN5bnRoZXRpY05vZGVQYXJlbnRzLmdldChwYXJlbnQyKTtcblxuICAgICAgICBpZiAocGFyZW50MSAmJiBwYXJlbnQxLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbikge1xuICAgICAgICAgIC8vIFR5cGVTY3JpcHQgaWdub3JlcyBzeW50aGV0aWMgY29tbWVudHMgb24gKHN0YXRpYykgcHJvcGVydHkgZGVjbGFyYXRpb25zXG4gICAgICAgICAgLy8gd2l0aCBpbml0aWFsaXplcnMuXG4gICAgICAgICAgLy8gZmluZCB0aGUgcGFyZW50IEV4cHJlc3Npb25TdGF0ZW1lbnQgbGlrZSBNeUNsYXNzLmZvbyA9IC4uLlxuICAgICAgICAgIGNvbnN0IGV4cHJlc3Npb25TdG10ID1cbiAgICAgICAgICAgICAgbGFzdE5vZGVXaXRoKG5vZGVQYXRoLCAobm9kZSkgPT4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpO1xuICAgICAgICAgIGlmIChleHByZXNzaW9uU3RtdCkge1xuICAgICAgICAgICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKFxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb25TdG10LCB0cy5nZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMocGFyZW50MSkgfHwgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHBhcmVudDMgJiYgcGFyZW50My5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50ICYmXG4gICAgICAgICAgICBoYXNNb2RpZmllckZsYWcocGFyZW50MywgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQpKSB7XG4gICAgICAgICAgLy8gVHlwZVNjcmlwdCBpZ25vcmVzIHN5bnRoZXRpYyBjb21tZW50cyBvbiBleHBvcnRlZCB2YXJpYWJsZXMuXG4gICAgICAgICAgLy8gZmluZCB0aGUgcGFyZW50IEV4cHJlc3Npb25TdGF0ZW1lbnQgbGlrZSBleHBvcnRzLmZvbyA9IC4uLlxuICAgICAgICAgIGNvbnN0IGV4cHJlc3Npb25TdG10ID1cbiAgICAgICAgICAgICAgbGFzdE5vZGVXaXRoKG5vZGVQYXRoLCAobm9kZSkgPT4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpO1xuICAgICAgICAgIGlmIChleHByZXNzaW9uU3RtdCkge1xuICAgICAgICAgICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKFxuICAgICAgICAgICAgICAgIGV4cHJlc3Npb25TdG10LCB0cy5nZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMocGFyZW50MykgfHwgW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gVHlwZVNjcmlwdCBpZ25vcmVzIHN5bnRoZXRpYyBjb21tZW50cyBvbiByZWV4cG9ydCAvIGltcG9ydCBzdGF0ZW1lbnRzLlxuICAgICAgLy8gVGhlIGNvZGUgYmVsb3cgcmUtYWRkcyB0aGVtIG9uZSB0aGUgY29udmVydGVkIENvbW1vbkpTIGltcG9ydCBzdGF0ZW1lbnRzLCBhbmQgcmVzZXRzIHRoZVxuICAgICAgLy8gdGV4dCByYW5nZSB0byBwcmV2ZW50IHByZXZpb3VzIGNvbW1lbnRzIGZyb20gYmVpbmcgZW1pdHRlZC5cbiAgICAgIGlmIChpc0NvbW1vbkpzUmVxdWlyZVN0YXRlbWVudChub2RlKSAmJiBmaWxlQ29udGV4dC5pbXBvcnRPclJlZXhwb3J0RGVjbGFyYXRpb25zKSB7XG4gICAgICAgIC8vIExvY2F0ZSB0aGUgb3JpZ2luYWwgaW1wb3J0L2V4cG9ydCBkZWNsYXJhdGlvbiB2aWEgdGhlXG4gICAgICAgIC8vIHRleHQgcmFuZ2UuXG4gICAgICAgIGNvbnN0IGltcG9ydE9yUmVleHBvcnREZWNsYXJhdGlvbiA9XG4gICAgICAgICAgICBmaWxlQ29udGV4dC5pbXBvcnRPclJlZXhwb3J0RGVjbGFyYXRpb25zLmZpbmQoaWVkID0+IGllZC5wb3MgPT09IG5vZGUucG9zKTtcbiAgICAgICAgaWYgKGltcG9ydE9yUmVleHBvcnREZWNsYXJhdGlvbikge1xuICAgICAgICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhcbiAgICAgICAgICAgICAgbm9kZSwgdHMuZ2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKGltcG9ydE9yUmVleHBvcnREZWNsYXJhdGlvbikgfHwgW10pO1xuICAgICAgICB9XG4gICAgICAgIC8vIE5lZWQgdG8gY2xlYXIgdGhlIHRleHRSYW5nZSBmb3IgSW1wb3J0RGVjbGFyYXRpb24gLyBFeHBvcnREZWNsYXJhdGlvbiBhc1xuICAgICAgICAvLyBvdGhlcndpc2UgVHlwZVNjcmlwdCB3b3VsZCBlbWl0IHRoZSBvcmlnaW5hbCBjb21tZW50cyBldmVuIGlmIHdlIHNldCB0aGVcbiAgICAgICAgLy8gdHMuRW1pdEZsYWcuTm9Db21tZW50cy4gKHNlZSBhbHNvIHJlc2V0Tm9kZVRleHRSYW5nZVRvUHJldmVudER1cGxpY2F0ZUNvbW1lbnRzIGJlbG93KVxuICAgICAgICB0cy5zZXRTb3VyY2VNYXBSYW5nZShub2RlLCB7cG9zOiBub2RlLnBvcywgZW5kOiBub2RlLmVuZH0pO1xuICAgICAgICB0cy5zZXRUZXh0UmFuZ2Uobm9kZSwge3BvczogLTEsIGVuZDogLTF9KTtcbiAgICAgIH1cbiAgICAgIG5vZGVQYXRoLnB1c2gobm9kZSk7XG4gICAgICBub2RlLmZvckVhY2hDaGlsZCh2aXNpdE5vZGUpO1xuICAgICAgbm9kZVBhdGgucG9wKCk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBpc0NvbW1vbkpzUmVxdWlyZVN0YXRlbWVudChub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gIC8vIENvbW1vbkpTIHJlcXVpcmVzIGNhbiBiZSBlaXRoZXIgXCJ2YXIgeCA9IHJlcXVpcmUoJy4uLicpO1wiIG9yIChmb3Igc2lkZSBlZmZlY3QgaW1wb3J0cyksIGp1c3RcbiAgLy8gXCJyZXF1aXJlKCcuLi4nKTtcIi5cbiAgbGV0IGNhbGxFeHByOiB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgaWYgKHRzLmlzVmFyaWFibGVTdGF0ZW1lbnQobm9kZSkpIHtcbiAgICBjb25zdCB2YXJTdG10ID0gbm9kZSBhcyB0cy5WYXJpYWJsZVN0YXRlbWVudDtcbiAgICBjb25zdCBkZWNscyA9IHZhclN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucztcbiAgICBsZXQgaW5pdDogdHMuRXhwcmVzc2lvbnx1bmRlZmluZWQ7XG4gICAgaWYgKGRlY2xzLmxlbmd0aCAhPT0gMSB8fCAhKGluaXQgPSBkZWNsc1swXS5pbml0aWFsaXplcikgfHxcbiAgICAgICAgaW5pdC5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNhbGxFeHByID0gaW5pdCBhcyB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgfSBlbHNlIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSkgJiYgdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24pKSB7XG4gICAgY2FsbEV4cHIgPSBub2RlLmV4cHJlc3Npb247XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChjYWxsRXhwci5leHByZXNzaW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllciB8fFxuICAgICAgKGNhbGxFeHByLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikudGV4dCAhPT0gJ3JlcXVpcmUnIHx8XG4gICAgICBjYWxsRXhwci5hcmd1bWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IG1vZHVsZUV4cHIgPSBjYWxsRXhwci5hcmd1bWVudHNbMF07XG4gIHJldHVybiBtb2R1bGVFeHByLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDtcbn1cblxuZnVuY3Rpb24gbGFzdE5vZGVXaXRoKG5vZGVzOiB0cy5Ob2RlW10sIHByZWRpY2F0ZTogKG5vZGU6IHRzLk5vZGUpID0+IGJvb2xlYW4pOiB0cy5Ob2RlfG51bGwge1xuICBmb3IgKGxldCBpID0gbm9kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgaWYgKHByZWRpY2F0ZShub2RlKSkge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIENvbnZlcnQgY29tbWVudCB0ZXh0IHJhbmdlcyBiZWZvcmUgYW5kIGFmdGVyIGEgbm9kZVxuICogaW50byB0cy5TeW50aGVzaXplZENvbW1lbnRzIGZvciB0aGUgbm9kZSBhbmQgcHJldmVudCB0aGVcbiAqIGNvbW1lbnQgdGV4dCByYW5nZXMgdG8gYmUgZW1pdHRlZCwgdG8gYWxsb3dcbiAqIGNoYW5naW5nIHRoZXNlIGNvbW1lbnRzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSB2aXNpdG9yIHRvIGJlIGFibGUgdG8gZG8gc29tZVxuICogc3RhdGUgbWFuYWdlbWVudCBhZnRlciB0aGUgY2FsbGVyIGlzIGRvbmUgY2hhbmdpbmcgYSBub2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmlzaXROb2RlV2l0aFN5bnRoZXNpemVkQ29tbWVudHM8VCBleHRlbmRzIHRzLk5vZGU+KFxuICAgIGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZTogVCxcbiAgICB2aXNpdG9yOiAobm9kZTogVCkgPT4gVCk6IFQge1xuICBpZiAobm9kZS5mbGFncyAmIHRzLk5vZGVGbGFncy5TeW50aGVzaXplZCkge1xuICAgIHJldHVybiB2aXNpdG9yKG5vZGUpO1xuICB9XG4gIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQmxvY2spIHtcbiAgICBjb25zdCBibG9jayA9IG5vZGUgYXMgdHMuTm9kZSBhcyB0cy5CbG9jaztcbiAgICBub2RlID0gdmlzaXROb2RlU3RhdGVtZW50c1dpdGhTeW50aGVzaXplZENvbW1lbnRzKFxuICAgICAgICBjb250ZXh0LCBzb3VyY2VGaWxlLCBub2RlLCBibG9jay5zdGF0ZW1lbnRzLFxuICAgICAgICAobm9kZSwgc3RtdHMpID0+IHZpc2l0b3IodHMudXBkYXRlQmxvY2soYmxvY2ssIHN0bXRzKSBhcyB0cy5Ob2RlIGFzIFQpKTtcbiAgfSBlbHNlIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU291cmNlRmlsZSkge1xuICAgIG5vZGUgPSB2aXNpdE5vZGVTdGF0ZW1lbnRzV2l0aFN5bnRoZXNpemVkQ29tbWVudHMoXG4gICAgICAgIGNvbnRleHQsIHNvdXJjZUZpbGUsIG5vZGUsIHNvdXJjZUZpbGUuc3RhdGVtZW50cyxcbiAgICAgICAgKG5vZGUsIHN0bXRzKSA9PiB2aXNpdG9yKHVwZGF0ZVNvdXJjZUZpbGVOb2RlKHNvdXJjZUZpbGUsIHN0bXRzKSBhcyB0cy5Ob2RlIGFzIFQpKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBJbiBhcnJvdyBmdW5jdGlvbnMgd2l0aCBleHByZXNzaW9uIGJvZGllcyAoYCh4KSA9PiBleHByYCksIGRvIG5vdCBzeW50aGVzaXplIGNvbW1lbnQgbm9kZXNcbiAgICAvLyB0aGF0IHByZWNlZGUgdGhlIGJvZHkgZXhwcmVzc2lvbi4gV2hlbiBkb3dubGV2ZWxpbmcgdG8gRVM1LCBUeXBlU2NyaXB0IGluc2VydHMgYSByZXR1cm5cbiAgICAvLyBzdGF0ZW1lbnQgYW5kIG1vdmVzIHRoZSBjb21tZW50IGluIGZyb250IG9mIGl0LCBidXQgdGhlbiBzdGlsbCBlbWl0cyBhbnkgc3ludGVzaXplZCBjb21tZW50XG4gICAgLy8gd2UgY3JlYXRlIGhlcmUuIFRoYXQgY2FuIGNhdXNlIGEgbGluZSBjb21tZW50IHRvIGJlIGVtaXR0ZWQgYWZ0ZXIgdGhlIHJldHVybiwgd2hpY2ggY2F1c2VzXG4gICAgLy8gQXV0b21hdGljIFNlbWljb2xvbiBJbnNlcnRpb24sIHdoaWNoIHRoZW4gYnJlYWtzIHRoZSBjb2RlLiBTZWUgYXJyb3dfZm5fZXM1LnRzIGZvciBhblxuICAgIC8vIGV4YW1wbGUuXG4gICAgaWYgKG5vZGUucGFyZW50ICYmIChub2RlIGFzIHRzLk5vZGUpLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQmxvY2sgJiZcbiAgICAgICAgdHMuaXNBcnJvd0Z1bmN0aW9uKG5vZGUucGFyZW50KSAmJiAobm9kZSBhcyB0cy5Ob2RlKSA9PT0gbm9kZS5wYXJlbnQuYm9keSkge1xuICAgICAgcmV0dXJuIHZpc2l0b3Iobm9kZSk7XG4gICAgfVxuICAgIGNvbnN0IGZpbGVDb250ZXh0ID0gYXNzZXJ0RmlsZUNvbnRleHQoY29udGV4dCwgc291cmNlRmlsZSk7XG4gICAgY29uc3QgbGVhZGluZ0xhc3RDb21tZW50RW5kID1cbiAgICAgICAgc3ludGhlc2l6ZUxlYWRpbmdDb21tZW50cyhzb3VyY2VGaWxlLCBub2RlLCBmaWxlQ29udGV4dC5sYXN0Q29tbWVudEVuZCk7XG4gICAgY29uc3QgdHJhaWxpbmdMYXN0Q29tbWVudEVuZCA9IHN5bnRoZXNpemVUcmFpbGluZ0NvbW1lbnRzKHNvdXJjZUZpbGUsIG5vZGUpO1xuICAgIGlmIChsZWFkaW5nTGFzdENvbW1lbnRFbmQgIT09IC0xKSB7XG4gICAgICBmaWxlQ29udGV4dC5sYXN0Q29tbWVudEVuZCA9IGxlYWRpbmdMYXN0Q29tbWVudEVuZDtcbiAgICB9XG4gICAgbm9kZSA9IHZpc2l0b3Iobm9kZSk7XG4gICAgaWYgKHRyYWlsaW5nTGFzdENvbW1lbnRFbmQgIT09IC0xKSB7XG4gICAgICBmaWxlQ29udGV4dC5sYXN0Q29tbWVudEVuZCA9IHRyYWlsaW5nTGFzdENvbW1lbnRFbmQ7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXNldE5vZGVUZXh0UmFuZ2VUb1ByZXZlbnREdXBsaWNhdGVDb21tZW50cyhub2RlKTtcbn1cblxuLyoqXG4gKiBSZXNldCB0aGUgdGV4dCByYW5nZSBmb3Igc29tZSBzcGVjaWFsIG5vZGVzIGFzIG90aGVyd2lzZSBUeXBlU2NyaXB0XG4gKiB3b3VsZCBhbHdheXMgZW1pdCB0aGUgb3JpZ2luYWwgY29tbWVudHMgZm9yIHRoZW0uXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzU5NFxuICpcbiAqIEBwYXJhbSBub2RlXG4gKi9cbmZ1bmN0aW9uIHJlc2V0Tm9kZVRleHRSYW5nZVRvUHJldmVudER1cGxpY2F0ZUNvbW1lbnRzPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBUKTogVCB7XG4gIHRzLnNldEVtaXRGbGFncyhub2RlLCAodHMuZ2V0RW1pdEZsYWdzKG5vZGUpIHx8IDApIHwgdHMuRW1pdEZsYWdzLk5vQ29tbWVudHMpO1xuICAvLyBTZWUgYWxzbyBlbWl0TWlzc2luZ1N5bnRoZXRpY0NvbW1lbnRzQWZ0ZXJUeXBlc2NyaXB0VHJhbnNmb3JtLlxuICAvLyBOb3RlOiBEb24ndCByZXNldCB0aGUgdGV4dFJhbmdlIGZvciB0cy5FeHBvcnREZWNsYXJhdGlvbiAvIHRzLkltcG9ydERlY2xhcmF0aW9uXG4gIC8vIHVudGlsIGFmdGVyIHRoZSBUeXBlU2NyaXB0IHRyYW5zZm9ybWVyIGFzIHdlIG5lZWQgdGhlIHNvdXJjZSBsb2NhdGlvblxuICAvLyB0byBtYXAgdGhlIGdlbmVyYXRlZCBgcmVxdWlyZWAgY2FsbHMgYmFjayB0byB0aGUgb3JpZ2luYWxcbiAgLy8gdHMuRXhwb3J0RGVjbGFyYXRpb24gLyB0cy5JbXBvcnREZWNsYXJhdGlvbiBub2Rlcy5cbiAgbGV0IGFsbG93VGV4dFJhbmdlID0gbm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24gJiZcbiAgICAgIG5vZGUua2luZCAhPT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZURlY2xhcmF0aW9uICYmXG4gICAgICAhKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5WYXJpYWJsZVN0YXRlbWVudCAmJlxuICAgICAgICBoYXNNb2RpZmllckZsYWcobm9kZSwgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQpKSAmJlxuICAgICAgbm9kZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLk1vZHVsZURlY2xhcmF0aW9uO1xuICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb24pIHtcbiAgICBhbGxvd1RleHRSYW5nZSA9IGZhbHNlO1xuICAgIGNvbnN0IHBkID0gbm9kZSBhcyB0cy5Ob2RlIGFzIHRzLlByb3BlcnR5RGVjbGFyYXRpb247XG4gICAgbm9kZSA9IHRzLnVwZGF0ZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgcGQsIHBkLmRlY29yYXRvcnMsIHBkLm1vZGlmaWVycywgcmVzZXRUZXh0UmFuZ2UocGQubmFtZSkgYXMgdHMuUHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgICAgcGQucXVlc3Rpb25Ub2tlbiwgcGQudHlwZSwgcGQuaW5pdGlhbGl6ZXIpIGFzIHRzLk5vZGUgYXMgVDtcbiAgfVxuICBpZiAoIWFsbG93VGV4dFJhbmdlKSB7XG4gICAgbm9kZSA9IHJlc2V0VGV4dFJhbmdlKG5vZGUpO1xuICB9XG4gIHJldHVybiBub2RlO1xuXG4gIGZ1bmN0aW9uIHJlc2V0VGV4dFJhbmdlPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBUKTogVCB7XG4gICAgaWYgKCEobm9kZS5mbGFncyAmIHRzLk5vZGVGbGFncy5TeW50aGVzaXplZCkpIHtcbiAgICAgIC8vIG5lZWQgdG8gY2xvbmUgYXMgd2UgZG9uJ3Qgd2FudCB0byBtb2RpZnkgc291cmNlIG5vZGVzLFxuICAgICAgLy8gYXMgdGhlIHBhcnNlZCBTb3VyY2VGaWxlcyBjb3VsZCBiZSBjYWNoZWQhXG4gICAgICBub2RlID0gdHMuZ2V0TXV0YWJsZUNsb25lKG5vZGUpO1xuICAgIH1cbiAgICBjb25zdCB0ZXh0UmFuZ2UgPSB7cG9zOiBub2RlLnBvcywgZW5kOiBub2RlLmVuZH07XG4gICAgdHMuc2V0U291cmNlTWFwUmFuZ2Uobm9kZSwgdGV4dFJhbmdlKTtcbiAgICB0cy5zZXRUZXh0UmFuZ2Uobm9kZSwge3BvczogLTEsIGVuZDogLTF9KTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufVxuXG4vKipcbiAqIFJlYWRzIGluIHRoZSBsZWFkaW5nIGNvbW1lbnQgdGV4dCByYW5nZXMgb2YgdGhlIGdpdmVuIG5vZGUsXG4gKiBjb252ZXJ0cyB0aGVtIGludG8gYHRzLlN5bnRoZXRpY0NvbW1lbnRgcyBhbmQgc3RvcmVzIHRoZW0gb24gdGhlIG5vZGUuXG4gKlxuICogTm90ZTogVGhpcyB3b3VsZCBiZSBncmVhdGx5IHNpbXBsaWZpZWQgd2l0aCBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NjE1LlxuICpcbiAqIEBwYXJhbSBsYXN0Q29tbWVudEVuZCBUaGUgZW5kIG9mIHRoZSBsYXN0IGNvbW1lbnRcbiAqIEByZXR1cm4gVGhlIGVuZCBvZiB0aGUgbGFzdCBmb3VuZCBjb21tZW50LCAtMSBpZiBubyBjb21tZW50IHdhcyBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gc3ludGhlc2l6ZUxlYWRpbmdDb21tZW50cyhcbiAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBub2RlOiB0cy5Ob2RlLCBsYXN0Q29tbWVudEVuZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XG4gIGNvbnN0IHNoYXJlc1N0YXJ0V2l0aFBhcmVudCA9IHBhcmVudCAmJiBwYXJlbnQua2luZCAhPT0gdHMuU3ludGF4S2luZC5CbG9jayAmJlxuICAgICAgcGFyZW50LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuU291cmNlRmlsZSAmJiBwYXJlbnQuZ2V0RnVsbFN0YXJ0KCkgPT09IG5vZGUuZ2V0RnVsbFN0YXJ0KCk7XG4gIGlmIChzaGFyZXNTdGFydFdpdGhQYXJlbnQgfHwgbGFzdENvbW1lbnRFbmQgPj0gbm9kZS5nZXRTdGFydCgpKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGNvbnN0IGFkanVzdGVkTm9kZUZ1bGxTdGFydCA9IE1hdGgubWF4KGxhc3RDb21tZW50RW5kLCBub2RlLmdldEZ1bGxTdGFydCgpKTtcbiAgY29uc3QgbGVhZGluZ0NvbW1lbnRzID1cbiAgICAgIGdldEFsbExlYWRpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUsIGFkanVzdGVkTm9kZUZ1bGxTdGFydCwgbm9kZS5nZXRTdGFydCgpKTtcbiAgaWYgKGxlYWRpbmdDb21tZW50cyAmJiBsZWFkaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKG5vZGUsIHN5bnRoZXNpemVDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUsIGxlYWRpbmdDb21tZW50cykpO1xuICAgIHJldHVybiBub2RlLmdldFN0YXJ0KCk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIFJlYWRzIGluIHRoZSB0cmFpbGluZyBjb21tZW50IHRleHQgcmFuZ2VzIG9mIHRoZSBnaXZlbiBub2RlLFxuICogY29udmVydHMgdGhlbSBpbnRvIGB0cy5TeW50aGV0aWNDb21tZW50YHMgYW5kIHN0b3JlcyB0aGVtIG9uIHRoZSBub2RlLlxuICpcbiAqIE5vdGU6IFRoaXMgd291bGQgYmUgZ3JlYXRseSBzaW1wbGlmaWVkIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzYxNS5cbiAqXG4gKiBAcmV0dXJuIFRoZSBlbmQgb2YgdGhlIGxhc3QgZm91bmQgY29tbWVudCwgLTEgaWYgbm8gY29tbWVudCB3YXMgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVUcmFpbGluZ0NvbW1lbnRzKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG5vZGU6IHRzLk5vZGUpOiBudW1iZXIge1xuICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgY29uc3Qgc2hhcmVzRW5kV2l0aFBhcmVudCA9IHBhcmVudCAmJiBwYXJlbnQua2luZCAhPT0gdHMuU3ludGF4S2luZC5CbG9jayAmJlxuICAgICAgcGFyZW50LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuU291cmNlRmlsZSAmJiBwYXJlbnQuZ2V0RW5kKCkgPT09IG5vZGUuZ2V0RW5kKCk7XG4gIGlmIChzaGFyZXNFbmRXaXRoUGFyZW50KSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGNvbnN0IHRyYWlsaW5nQ29tbWVudHMgPSB0cy5nZXRUcmFpbGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZS50ZXh0LCBub2RlLmdldEVuZCgpKTtcbiAgaWYgKHRyYWlsaW5nQ29tbWVudHMgJiYgdHJhaWxpbmdDb21tZW50cy5sZW5ndGgpIHtcbiAgICB0cy5zZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzKG5vZGUsIHN5bnRoZXNpemVDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUsIHRyYWlsaW5nQ29tbWVudHMpKTtcbiAgICByZXR1cm4gdHJhaWxpbmdDb21tZW50c1t0cmFpbGluZ0NvbW1lbnRzLmxlbmd0aCAtIDFdLmVuZDtcbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGFycmF5T2Y8VD4odmFsdWU6IFR8dW5kZWZpbmVkfG51bGwpOiBUW10ge1xuICByZXR1cm4gdmFsdWUgPyBbdmFsdWVdIDogW107XG59XG5cbi8qKlxuICogQ29udmVydCBsZWFkaW5nL3RyYWlsaW5nIGRldGFjaGVkIGNvbW1lbnQgcmFuZ2VzIG9mIHN0YXRlbWVudCBhcnJheXNcbiAqIChlLmcuIHRoZSBzdGF0ZW1lbnRzIG9mIGEgdHMuU291cmNlRmlsZSBvciB0cy5CbG9jaykgaW50b1xuICogYHRzLk5vbkVtaXR0ZWRTdGF0ZW1lbnRgcyB3aXRoIGB0cy5TeW50aGVzaXplZENvbW1lbnRgcyBhbmRcbiAqIHByZXBlbmRzIC8gYXBwZW5kcyB0aGVtIHRvIHRoZSBnaXZlbiBzdGF0ZW1lbnQgYXJyYXkuXG4gKiBUaGlzIGlzIG5lZWRlZCB0byBhbGxvdyBjaGFuZ2luZyB0aGVzZSBjb21tZW50cy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHRha2VzIGEgdmlzaXRvciB0byBiZSBhYmxlIHRvIGRvIHNvbWVcbiAqIHN0YXRlIG1hbmFnZW1lbnQgYWZ0ZXIgdGhlIGNhbGxlciBpcyBkb25lIGNoYW5naW5nIGEgbm9kZS5cbiAqL1xuZnVuY3Rpb24gdmlzaXROb2RlU3RhdGVtZW50c1dpdGhTeW50aGVzaXplZENvbW1lbnRzPFQgZXh0ZW5kcyB0cy5Ob2RlPihcbiAgICBjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG5vZGU6IFQsXG4gICAgc3RhdGVtZW50czogdHMuTm9kZUFycmF5PHRzLlN0YXRlbWVudD4sXG4gICAgdmlzaXRvcjogKG5vZGU6IFQsIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+KSA9PiBUKTogVCB7XG4gIGNvbnN0IGxlYWRpbmcgPSBzeW50aGVzaXplRGV0YWNoZWRMZWFkaW5nQ29tbWVudHMoc291cmNlRmlsZSwgbm9kZSwgc3RhdGVtZW50cyk7XG4gIGNvbnN0IHRyYWlsaW5nID0gc3ludGhlc2l6ZURldGFjaGVkVHJhaWxpbmdDb21tZW50cyhzb3VyY2VGaWxlLCBub2RlLCBzdGF0ZW1lbnRzKTtcbiAgaWYgKGxlYWRpbmcuY29tbWVudFN0bXQgfHwgdHJhaWxpbmcuY29tbWVudFN0bXQpIHtcbiAgICBjb25zdCBuZXdTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9XG4gICAgICAgIFsuLi5hcnJheU9mKGxlYWRpbmcuY29tbWVudFN0bXQpLCAuLi5zdGF0ZW1lbnRzLCAuLi5hcnJheU9mKHRyYWlsaW5nLmNvbW1lbnRTdG10KV07XG4gICAgc3RhdGVtZW50cyA9IHRzLnNldFRleHRSYW5nZSh0cy5jcmVhdGVOb2RlQXJyYXkobmV3U3RhdGVtZW50cyksIHtwb3M6IC0xLCBlbmQ6IC0xfSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdmlzaXRvciBjcmVhdGVzIGEgbmV3IG5vZGUgd2l0aCB0aGUgbmV3IHN0YXRlbWVudHMuIEhvd2V2ZXIsIGRvaW5nIHNvXG4gICAgICogcmV2ZWFscyBhIFR5cGVTY3JpcHQgYnVnLlxuICAgICAqIFRvIHJlcHJvZHVjZSBjb21tZW50IG91dCB0aGUgbGluZSBiZWxvdyBhbmQgY29tcGlsZTpcbiAgICAgKlxuICAgICAqIC8vIC4uLi4uLlxuICAgICAqXG4gICAgICogYWJzdHJhY3QgY2xhc3MgQSB7XG4gICAgICogfVxuICAgICAqIGFic3RyYWN0IGNsYXNzIEIgZXh0ZW5kcyBBIHtcbiAgICAgKiAgIC8vIC4uLi4uLlxuICAgICAqIH1cbiAgICAgKlxuICAgICAqIE5vdGUgdGhhdCBuZXdsaW5lcyBhcmUgc2lnbmlmaWNhbnQuIFRoaXMgd291bGQgcmVzdWx0IGluIHRoZSBmb2xsb3dpbmc6XG4gICAgICogcnVudGltZSBlcnJvciBcIlR5cGVFcnJvcjogQ2Fubm90IHJlYWQgcHJvcGVydHkgJ21lbWJlcnMnIG9mIHVuZGVmaW5lZFwiLlxuICAgICAqXG4gICAgICogVGhlIGxpbmUgYmVsb3cgaXMgYSB3b3JrYXJvdW5kIHRoYXQgZW5zdXJlcyB0aGF0IHVwZGF0ZVNvdXJjZUZpbGVOb2RlIGFuZFxuICAgICAqIHVwZGF0ZUJsb2NrIG5ldmVyIGNyZWF0ZSBuZXcgTm9kZXMuXG4gICAgICogVE9ETygjNjM0KTogZmlsZSBhIGJ1ZyB3aXRoIFRTIHRlYW0uXG4gICAgICovXG4gICAgKG5vZGUgYXMgdHMuTm9kZSBhcyB0cy5Tb3VyY2VGaWxlKS5zdGF0ZW1lbnRzID0gc3RhdGVtZW50cztcblxuICAgIGNvbnN0IGZpbGVDb250ZXh0ID0gYXNzZXJ0RmlsZUNvbnRleHQoY29udGV4dCwgc291cmNlRmlsZSk7XG4gICAgaWYgKGxlYWRpbmcubGFzdENvbW1lbnRFbmQgIT09IC0xKSB7XG4gICAgICBmaWxlQ29udGV4dC5sYXN0Q29tbWVudEVuZCA9IGxlYWRpbmcubGFzdENvbW1lbnRFbmQ7XG4gICAgfVxuICAgIG5vZGUgPSB2aXNpdG9yKG5vZGUsIHN0YXRlbWVudHMpO1xuICAgIGlmICh0cmFpbGluZy5sYXN0Q29tbWVudEVuZCAhPT0gLTEpIHtcbiAgICAgIGZpbGVDb250ZXh0Lmxhc3RDb21tZW50RW5kID0gdHJhaWxpbmcubGFzdENvbW1lbnRFbmQ7XG4gICAgfVxuICAgIHRzLnNldE9yaWdpbmFsTm9kZSgobGVhZGluZy5jb21tZW50U3RtdCB8fCB0cmFpbGluZy5jb21tZW50U3RtdCkhLCBub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICByZXR1cm4gdmlzaXRvcihub2RlLCBzdGF0ZW1lbnRzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGxlYWRpbmcgZGV0YWNoZWQgY29tbWVudCByYW5nZXMgb2Ygc3RhdGVtZW50IGFycmF5c1xuICogKGUuZy4gdGhlIHN0YXRlbWVudHMgb2YgYSB0cy5Tb3VyY2VGaWxlIG9yIHRzLkJsb2NrKSBpbnRvIGFcbiAqIGB0cy5Ob25FbWl0dGVkU3RhdGVtZW50YCB3aXRoIGB0cy5TeW50aGVzaXplZENvbW1lbnRgcy5cbiAqXG4gKiBBIERldGFjaGVkIGxlYWRpbmcgY29tbWVudCBpcyB0aGUgZmlyc3QgY29tbWVudCBpbiBhIFNvdXJjZUZpbGUgLyBCbG9ja1xuICogdGhhdCBpcyBzZXBhcmF0ZWQgd2l0aCBhIG5ld2xpbmUgZnJvbSB0aGUgZmlyc3Qgc3RhdGVtZW50LlxuICpcbiAqIE5vdGU6IFRoaXMgd291bGQgYmUgZ3JlYXRseSBzaW1wbGlmaWVkIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzYxNS5cbiAqL1xuZnVuY3Rpb24gc3ludGhlc2l6ZURldGFjaGVkTGVhZGluZ0NvbW1lbnRzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG5vZGU6IHRzLk5vZGUsIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+KTpcbiAgICB7Y29tbWVudFN0bXQ6IHRzLlN0YXRlbWVudHxudWxsLCBsYXN0Q29tbWVudEVuZDogbnVtYmVyfSB7XG4gIGxldCB0cml2aWFFbmQgPSBzdGF0ZW1lbnRzLmVuZDtcbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoKSB7XG4gICAgdHJpdmlhRW5kID0gc3RhdGVtZW50c1swXS5nZXRTdGFydCgpO1xuICB9XG4gIGNvbnN0IGRldGFjaGVkQ29tbWVudHMgPSBnZXREZXRhY2hlZExlYWRpbmdDb21tZW50UmFuZ2VzKHNvdXJjZUZpbGUsIHN0YXRlbWVudHMucG9zLCB0cml2aWFFbmQpO1xuICBpZiAoIWRldGFjaGVkQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtjb21tZW50U3RtdDogbnVsbCwgbGFzdENvbW1lbnRFbmQ6IC0xfTtcbiAgfVxuICBjb25zdCBsYXN0Q29tbWVudEVuZCA9IGRldGFjaGVkQ29tbWVudHNbZGV0YWNoZWRDb21tZW50cy5sZW5ndGggLSAxXS5lbmQ7XG4gIGNvbnN0IGNvbW1lbnRTdG10ID0gY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzb3VyY2VGaWxlKTtcbiAgdHMuc2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhcbiAgICAgIGNvbW1lbnRTdG10LCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBkZXRhY2hlZENvbW1lbnRzKSk7XG4gIHJldHVybiB7Y29tbWVudFN0bXQsIGxhc3RDb21tZW50RW5kfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IHRyYWlsaW5nIGRldGFjaGVkIGNvbW1lbnQgcmFuZ2VzIG9mIHN0YXRlbWVudCBhcnJheXNcbiAqIChlLmcuIHRoZSBzdGF0ZW1lbnRzIG9mIGEgdHMuU291cmNlRmlsZSBvciB0cy5CbG9jaykgaW50byBhXG4gKiBgdHMuTm9uRW1pdHRlZFN0YXRlbWVudGAgd2l0aCBgdHMuU3ludGhlc2l6ZWRDb21tZW50YHMuXG4gKlxuICogQSBEZXRhY2hlZCB0cmFpbGluZyBjb21tZW50IGFyZSBhbGwgY29tbWVudHMgYWZ0ZXIgdGhlIGZpcnN0IG5ld2xpbmVcbiAqIHRoZSBmb2xsb3dzIHRoZSBsYXN0IHN0YXRlbWVudCBpbiBhIFNvdXJjZUZpbGUgLyBCbG9jay5cbiAqXG4gKiBOb3RlOiBUaGlzIHdvdWxkIGJlIGdyZWF0bHkgc2ltcGxpZmllZCB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTc2MTUuXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVEZXRhY2hlZFRyYWlsaW5nQ29tbWVudHMoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZTogdHMuTm9kZSwgc3RhdGVtZW50czogdHMuTm9kZUFycmF5PHRzLlN0YXRlbWVudD4pOlxuICAgIHtjb21tZW50U3RtdDogdHMuU3RhdGVtZW50fG51bGwsIGxhc3RDb21tZW50RW5kOiBudW1iZXJ9IHtcbiAgbGV0IHRyYWlsaW5nQ29tbWVudFN0YXJ0ID0gc3RhdGVtZW50cy5lbmQ7XG4gIGlmIChzdGF0ZW1lbnRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGxhc3RTdG10ID0gc3RhdGVtZW50c1tzdGF0ZW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGxhc3RTdG10VHJhaWxpbmdDb21tZW50cyA9IHRzLmdldFRyYWlsaW5nQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLnRleHQsIGxhc3RTdG10LmVuZCk7XG4gICAgaWYgKGxhc3RTdG10VHJhaWxpbmdDb21tZW50cyAmJiBsYXN0U3RtdFRyYWlsaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgICB0cmFpbGluZ0NvbW1lbnRTdGFydCA9IGxhc3RTdG10VHJhaWxpbmdDb21tZW50c1tsYXN0U3RtdFRyYWlsaW5nQ29tbWVudHMubGVuZ3RoIC0gMV0uZW5kO1xuICAgIH1cbiAgfVxuICBjb25zdCBkZXRhY2hlZENvbW1lbnRzID0gZ2V0QWxsTGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZSwgdHJhaWxpbmdDb21tZW50U3RhcnQsIG5vZGUuZW5kKTtcbiAgaWYgKCFkZXRhY2hlZENvbW1lbnRzIHx8ICFkZXRhY2hlZENvbW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiB7Y29tbWVudFN0bXQ6IG51bGwsIGxhc3RDb21tZW50RW5kOiAtMX07XG4gIH1cbiAgY29uc3QgbGFzdENvbW1lbnRFbmQgPSBkZXRhY2hlZENvbW1lbnRzW2RldGFjaGVkQ29tbWVudHMubGVuZ3RoIC0gMV0uZW5kO1xuICBjb25zdCBjb21tZW50U3RtdCA9IGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQoc291cmNlRmlsZSk7XG4gIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhcbiAgICAgIGNvbW1lbnRTdG10LCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCBkZXRhY2hlZENvbW1lbnRzKSk7XG4gIHJldHVybiB7Y29tbWVudFN0bXQsIGxhc3RDb21tZW50RW5kfTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSB0aGUgZGV0YWNoZWQgbGVhZGluZyBjb21tZW50IHJhbmdlcyBpbiBhbiBhcmVhIG9mIGEgU291cmNlRmlsZS5cbiAqIEBwYXJhbSBzb3VyY2VGaWxlIFRoZSBzb3VyY2UgZmlsZVxuICogQHBhcmFtIHN0YXJ0IFdoZXJlIHRvIHN0YXJ0IHNjYW5uaW5nXG4gKiBAcGFyYW0gZW5kIFdoZXJlIHRvIGVuZCBzY2FubmluZ1xuICovXG4vLyBOb3RlOiBUaGlzIGNvZGUgaXMgYmFzZWQgb24gY29tcGlsZXIvY29tbWVudHMudHMgaW4gVHlwZVNjcmlwdFxuZnVuY3Rpb24gZ2V0RGV0YWNoZWRMZWFkaW5nQ29tbWVudFJhbmdlcyhcbiAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IHRzLkNvbW1lbnRSYW5nZVtdIHtcbiAgY29uc3QgbGVhZGluZ0NvbW1lbnRzID0gZ2V0QWxsTGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZSwgc3RhcnQsIGVuZCk7XG4gIGlmICghbGVhZGluZ0NvbW1lbnRzIHx8ICFsZWFkaW5nQ29tbWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGRldGFjaGVkQ29tbWVudHM6IHRzLkNvbW1lbnRSYW5nZVtdID0gW107XG4gIGxldCBsYXN0Q29tbWVudDogdHMuQ29tbWVudFJhbmdlfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICBmb3IgKGNvbnN0IGNvbW1lbnQgb2YgbGVhZGluZ0NvbW1lbnRzKSB7XG4gICAgaWYgKGxhc3RDb21tZW50KSB7XG4gICAgICBjb25zdCBsYXN0Q29tbWVudExpbmUgPSBnZXRMaW5lT2ZQb3Moc291cmNlRmlsZSwgbGFzdENvbW1lbnQuZW5kKTtcbiAgICAgIGNvbnN0IGNvbW1lbnRMaW5lID0gZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGNvbW1lbnQucG9zKTtcblxuICAgICAgaWYgKGNvbW1lbnRMaW5lID49IGxhc3RDb21tZW50TGluZSArIDIpIHtcbiAgICAgICAgLy8gVGhlcmUgd2FzIGEgYmxhbmsgbGluZSBiZXR3ZWVuIHRoZSBsYXN0IGNvbW1lbnQgYW5kIHRoaXMgY29tbWVudC4gIFRoaXNcbiAgICAgICAgLy8gY29tbWVudCBpcyBub3QgcGFydCBvZiB0aGUgY29weXJpZ2h0IGNvbW1lbnRzLiAgUmV0dXJuIHdoYXQgd2UgaGF2ZSBzb1xuICAgICAgICAvLyBmYXIuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRldGFjaGVkQ29tbWVudHMucHVzaChjb21tZW50KTtcbiAgICBsYXN0Q29tbWVudCA9IGNvbW1lbnQ7XG4gIH1cblxuICBpZiAoZGV0YWNoZWRDb21tZW50cy5sZW5ndGgpIHtcbiAgICAvLyBBbGwgY29tbWVudHMgbG9vayBsaWtlIHRoZXkgY291bGQgaGF2ZSBiZWVuIHBhcnQgb2YgdGhlIGNvcHlyaWdodCBoZWFkZXIuICBNYWtlXG4gICAgLy8gc3VyZSB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgYmxhbmsgbGluZSBiZXR3ZWVuIGl0IGFuZCB0aGUgbm9kZS4gIElmIG5vdCwgaXQncyBub3RcbiAgICAvLyBhIGNvcHlyaWdodCBoZWFkZXIuXG4gICAgY29uc3QgbGFzdENvbW1lbnRMaW5lID1cbiAgICAgICAgZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGRldGFjaGVkQ29tbWVudHNbZGV0YWNoZWRDb21tZW50cy5sZW5ndGggLSAxXS5lbmQpO1xuICAgIGNvbnN0IG5vZGVMaW5lID0gZ2V0TGluZU9mUG9zKHNvdXJjZUZpbGUsIGVuZCk7XG4gICAgaWYgKG5vZGVMaW5lID49IGxhc3RDb21tZW50TGluZSArIDIpIHtcbiAgICAgIC8vIFZhbGlkIGRldGFjaGVkQ29tbWVudHNcbiAgICAgIHJldHVybiBkZXRhY2hlZENvbW1lbnRzO1xuICAgIH1cbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGdldExpbmVPZlBvcyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBwb3M6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzb3VyY2VGaWxlLCBwb3MpLmxpbmU7XG59XG5cbi8qKlxuICogdHMuY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudCB3aWxsIGNyZWF0ZSBhIG5vZGUgd2hvc2UgY29tbWVudHMgYXJlIG5ldmVyIGVtaXR0ZWQgZXhjZXB0IGZvciB2ZXJ5XG4gKiBzcGVjaWZpYyBzcGVjaWFsIGNhc2VzICgvLy8gY29tbWVudHMpLiBjcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50V2l0aENvbW1lbnRzIGNyZWF0ZXMgYSBub3RcbiAqIGVtaXR0ZWQgc3RhdGVtZW50IGFuZCBhZGRzIGNvbW1lbnQgcmFuZ2VzIGZyb20gdGhlIG9yaWdpbmFsIHN0YXRlbWVudCBhcyBzeW50aGV0aWMgY29tbWVudHMgdG9cbiAqIGl0LCBzbyB0aGF0IHRoZXkgZ2V0IHJldGFpbmVkIGluIHRoZSBvdXRwdXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50V2l0aENvbW1lbnRzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG9yaWdpbmFsOiB0cy5Ob2RlKTogdHMuU3RhdGVtZW50IHtcbiAgbGV0IHJlcGxhY2VtZW50ID0gdHMuY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChvcmlnaW5hbCk7XG4gIC8vIE5COiBzeW50aGV0aWMgbm9kZXMgY2FuIGhhdmUgcG9zL2VuZCA9PSAtMS4gVGhpcyBpcyBoYW5kbGVkIGJ5IHRoZSB1bmRlcmx5aW5nIGltcGxlbWVudGF0aW9uLlxuICBjb25zdCBsZWFkaW5nID0gdHMuZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZS50ZXh0LCBvcmlnaW5hbC5wb3MpIHx8IFtdO1xuICBjb25zdCB0cmFpbGluZyA9IHRzLmdldFRyYWlsaW5nQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLnRleHQsIG9yaWdpbmFsLmVuZCkgfHwgW107XG4gIHJlcGxhY2VtZW50ID1cbiAgICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhyZXBsYWNlbWVudCwgc3ludGhlc2l6ZUNvbW1lbnRSYW5nZXMoc291cmNlRmlsZSwgbGVhZGluZykpO1xuICByZXBsYWNlbWVudCA9XG4gICAgICB0cy5zZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzKHJlcGxhY2VtZW50LCBzeW50aGVzaXplQ29tbWVudFJhbmdlcyhzb3VyY2VGaWxlLCB0cmFpbGluZykpO1xuICByZXR1cm4gcmVwbGFjZW1lbnQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYHRzLkNvbW1lbnRSYW5nZWBzIGludG8gYHRzLlN5bnRoZXNpemVkQ29tbWVudGBzXG4gKiBAcGFyYW0gc291cmNlRmlsZVxuICogQHBhcmFtIHBhcnNlZENvbW1lbnRzXG4gKi9cbmZ1bmN0aW9uIHN5bnRoZXNpemVDb21tZW50UmFuZ2VzKFxuICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIHBhcnNlZENvbW1lbnRzOiB0cy5Db21tZW50UmFuZ2VbXSk6IHRzLlN5bnRoZXNpemVkQ29tbWVudFtdIHtcbiAgY29uc3Qgc3ludGhlc2l6ZWRDb21tZW50czogdHMuU3ludGhlc2l6ZWRDb21tZW50W10gPSBbXTtcbiAgcGFyc2VkQ29tbWVudHMuZm9yRWFjaCgoe2tpbmQsIHBvcywgZW5kLCBoYXNUcmFpbGluZ05ld0xpbmV9LCBjb21tZW50SWR4KSA9PiB7XG4gICAgbGV0IGNvbW1lbnRUZXh0ID0gc291cmNlRmlsZS50ZXh0LnN1YnN0cmluZyhwb3MsIGVuZCkudHJpbSgpO1xuICAgIGlmIChraW5kID09PSB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEpIHtcbiAgICAgIGNvbW1lbnRUZXh0ID0gY29tbWVudFRleHQucmVwbGFjZSgvKF5cXC9cXCopfChcXCpcXC8kKS9nLCAnJyk7XG4gICAgfSBlbHNlIGlmIChraW5kID09PSB0cy5TeW50YXhLaW5kLlNpbmdsZUxpbmVDb21tZW50VHJpdmlhKSB7XG4gICAgICBpZiAoY29tbWVudFRleHQuc3RhcnRzV2l0aCgnLy8vJykpIHtcbiAgICAgICAgLy8gdHJpcGxlLXNsYXNoIGNvbW1lbnRzIGFyZSB0eXBlc2NyaXB0IHNwZWNpZmljLCBpZ25vcmUgdGhlbSBpbiB0aGUgb3V0cHV0LlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb21tZW50VGV4dCA9IGNvbW1lbnRUZXh0LnJlcGxhY2UoLyheXFwvXFwvKS9nLCAnJyk7XG4gICAgfVxuICAgIHN5bnRoZXNpemVkQ29tbWVudHMucHVzaCh7a2luZCwgdGV4dDogY29tbWVudFRleHQsIGhhc1RyYWlsaW5nTmV3TGluZSwgcG9zOiAtMSwgZW5kOiAtMX0pO1xuICB9KTtcbiAgcmV0dXJuIHN5bnRoZXNpemVkQ29tbWVudHM7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5vbiBlbWl0dGVkIHN0YXRlbWVudCB0aGF0IGNhbiBiZSB1c2VkIHRvIHN0b3JlIHN5bnRoZXNpemVkIGNvbW1lbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogdHMuTm90RW1pdHRlZFN0YXRlbWVudCB7XG4gIGNvbnN0IHN0bXQgPSB0cy5jcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50KHNvdXJjZUZpbGUpO1xuICB0cy5zZXRPcmlnaW5hbE5vZGUoc3RtdCwgdW5kZWZpbmVkKTtcbiAgdHMuc2V0VGV4dFJhbmdlKHN0bXQsIHtwb3M6IDAsIGVuZDogMH0pO1xuICB0cy5zZXRFbWl0RmxhZ3Moc3RtdCwgdHMuRW1pdEZsYWdzLkN1c3RvbVByb2xvZ3VlKTtcbiAgcmV0dXJuIHN0bXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGVhZGluZyBjb21tZW50IHJhbmdlcyBpbiB0aGUgc291cmNlIGZpbGUgdGhhdCBzdGFydCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gKiBUaGlzIGlzIHRoZSBzYW1lIGFzIGB0cy5nZXRMZWFkaW5nQ29tbWVudFJhbmdlc2AsIGV4Y2VwdCB0aGF0IGl0IGRvZXMgbm90IHNraXBcbiAqIGNvbW1lbnRzIGJlZm9yZSB0aGUgZmlyc3QgbmV3bGluZSBpbiB0aGUgcmFuZ2UuXG4gKlxuICogQHBhcmFtIHNvdXJjZUZpbGVcbiAqIEBwYXJhbSBzdGFydCBXaGVyZSB0byBzdGFydCBzY2FubmluZ1xuICogQHBhcmFtIGVuZCBXaGVyZSB0byBlbmQgc2Nhbm5pbmdcbiAqL1xuZnVuY3Rpb24gZ2V0QWxsTGVhZGluZ0NvbW1lbnRSYW5nZXMoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiB0cy5Db21tZW50UmFuZ2VbXSB7XG4gIC8vIGV4ZXV0ZSB0cy5nZXRMZWFkaW5nQ29tbWVudFJhbmdlcyB3aXRoIHBvcyA9IDAgc28gdGhhdCBpdCBkb2VzIG5vdCBza2lwXG4gIC8vIGNvbW1lbnRzIHVudGlsIHRoZSBmaXJzdCBuZXdsaW5lLlxuICBjb25zdCBjb21tZW50UmFuZ2VzID0gdHMuZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXMoc291cmNlRmlsZS50ZXh0LnN1YnN0cmluZyhzdGFydCwgZW5kKSwgMCkgfHwgW107XG4gIHJldHVybiBjb21tZW50UmFuZ2VzLm1hcChjciA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNUcmFpbGluZ05ld0xpbmU6IGNyLmhhc1RyYWlsaW5nTmV3TGluZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogY3Iua2luZCBhcyBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvczogY3IucG9zICsgc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogY3IuZW5kICsgc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGEgdmVyc2lvbiBvZiBgdHMudmlzaXRFYWNoQ2hpbGRgIHRoYXQgd29ya3MgdGhhdCBjYWxscyBvdXIgdmVyc2lvblxuICogb2YgYHVwZGF0ZVNvdXJjZUZpbGVOb2RlYCwgc28gdGhhdCB0eXBlc2NyaXB0IGRvZXNuJ3QgbG9zZSB0eXBlIGluZm9ybWF0aW9uXG4gKiBmb3IgcHJvcGVydHkgZGVjb3JhdG9ycy5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3Mzg0XG4gKlxuICogQHBhcmFtIHNmXG4gKiBAcGFyYW0gc3RhdGVtZW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRFYWNoQ2hpbGQoXG4gICAgbm9kZTogdHMuTm9kZSwgdmlzaXRvcjogdHMuVmlzaXRvciwgY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KTogdHMuTm9kZSB7XG4gIGlmIChub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU291cmNlRmlsZSkge1xuICAgIGNvbnN0IHNmID0gbm9kZSBhcyB0cy5Tb3VyY2VGaWxlO1xuICAgIHJldHVybiB1cGRhdGVTb3VyY2VGaWxlTm9kZShzZiwgdHMudmlzaXRMZXhpY2FsRW52aXJvbm1lbnQoc2Yuc3RhdGVtZW50cywgdmlzaXRvciwgY29udGV4dCkpO1xuICB9XG5cbiAgcmV0dXJuIHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYSB2ZXJzaW9uIG9mIGB0cy51cGRhdGVTb3VyY2VGaWxlTm9kZWAgdGhhdCB3b3Jrc1xuICogd2VsbCB3aXRoIHByb3BlcnR5IGRlY29yYXRvcnMuXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzM4NFxuICogVE9ETygjNjM0KTogVGhpcyBoYXMgYmVlbiBmaXhlZCBpbiBUUyAyLjUuIEludmVzdGlnYXRlIHJlbW92YWwuXG4gKlxuICogQHBhcmFtIHNmXG4gKiBAcGFyYW0gc3RhdGVtZW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU291cmNlRmlsZU5vZGUoXG4gICAgc2Y6IHRzLlNvdXJjZUZpbGUsIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+KTogdHMuU291cmNlRmlsZSB7XG4gIGlmIChzdGF0ZW1lbnRzID09PSBzZi5zdGF0ZW1lbnRzKSB7XG4gICAgcmV0dXJuIHNmO1xuICB9XG4gIC8vIE5vdGU6IE5lZWQgdG8gY2xvbmUgdGhlIG9yaWdpbmFsIGZpbGUgKGFuZCBub3QgdXNlIGB0cy51cGRhdGVTb3VyY2VGaWxlTm9kZWApXG4gIC8vIGFzIG90aGVyd2lzZSBUUyBmYWlscyB3aGVuIHJlc29sdmluZyB0eXBlcyBmb3IgZGVjb3JhdG9ycy5cbiAgc2YgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoc2YpO1xuICBzZi5zdGF0ZW1lbnRzID0gc3RhdGVtZW50cztcbiAgcmV0dXJuIHNmO1xufVxuXG4vLyBDb3BpZWQgZnJvbSBUeXBlU2NyaXB0XG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlTm9kZUtpbmQoa2luZDogdHMuU3ludGF4S2luZCkge1xuICByZXR1cm4gKGtpbmQgPj0gdHMuU3ludGF4S2luZC5GaXJzdFR5cGVOb2RlICYmIGtpbmQgPD0gdHMuU3ludGF4S2luZC5MYXN0VHlwZU5vZGUpIHx8XG4gICAgICBraW5kID09PSB0cy5TeW50YXhLaW5kLkFueUtleXdvcmQgfHwga2luZCA9PT0gdHMuU3ludGF4S2luZC5OdW1iZXJLZXl3b3JkIHx8XG4gICAgICBraW5kID09PSB0cy5TeW50YXhLaW5kLk9iamVjdEtleXdvcmQgfHwga2luZCA9PT0gdHMuU3ludGF4S2luZC5Cb29sZWFuS2V5d29yZCB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5TdHJpbmdLZXl3b3JkIHx8IGtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3ltYm9sS2V5d29yZCB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5UaGlzS2V5d29yZCB8fCBraW5kID09PSB0cy5TeW50YXhLaW5kLlZvaWRLZXl3b3JkIHx8XG4gICAgICBraW5kID09PSB0cy5TeW50YXhLaW5kLlVuZGVmaW5lZEtleXdvcmQgfHwga2luZCA9PT0gdHMuU3ludGF4S2luZC5OdWxsS2V5d29yZCB8fFxuICAgICAga2luZCA9PT0gdHMuU3ludGF4S2luZC5OZXZlcktleXdvcmQgfHwga2luZCA9PT0gdHMuU3ludGF4S2luZC5FeHByZXNzaW9uV2l0aFR5cGVBcmd1bWVudHM7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0cmluZyBsaXRlcmFsIHRoYXQgdXNlcyBzaW5nbGUgcXVvdGVzLiBQdXJlbHkgY29zbWV0aWMsIGJ1dCBpbmNyZWFzZXMgZmlkZWxpdHkgdG8gdGhlXG4gKiBleGlzdGluZyB0ZXN0IHN1aXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2luZ2xlUXVvdGVTdHJpbmdMaXRlcmFsKHRleHQ6IHN0cmluZyk6IHRzLlN0cmluZ0xpdGVyYWwge1xuICBjb25zdCBzdHJpbmdMaXRlcmFsID0gdHMuY3JlYXRlTGl0ZXJhbCh0ZXh0KTtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueSBhY2Nlc3NpbmcgVFMgaW50ZXJuYWwgQVBJLlxuICAoc3RyaW5nTGl0ZXJhbCBhcyBhbnkpLnNpbmdsZVF1b3RlID0gdHJ1ZTtcbiAgcmV0dXJuIHN0cmluZ0xpdGVyYWw7XG59XG4iXX0=