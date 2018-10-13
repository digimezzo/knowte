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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/typescript", ["require", "exports", "typescript", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @fileoverview Abstraction over the TypeScript API that makes multiple
     * versions of TypeScript appear to be interoperable. Any time a breaking change
     * in TypeScript affects Tsickle code, we should extend this shim to present an
     * unbroken API.
     * All code in tsickle should import from this location, not from 'typescript'.
     */
    // tslint:disable:no-any We need to do various unsafe casts between TS versions
    var ts = require("typescript");
    var typescript_1 = require("typescript");
    exports.addSyntheticTrailingComment = typescript_1.addSyntheticTrailingComment;
    exports.createArrayLiteral = typescript_1.createArrayLiteral;
    exports.createArrayTypeNode = typescript_1.createArrayTypeNode;
    exports.createArrowFunction = typescript_1.createArrowFunction;
    exports.createAssignment = typescript_1.createAssignment;
    exports.createBinary = typescript_1.createBinary;
    exports.createCall = typescript_1.createCall;
    exports.createCompilerHost = typescript_1.createCompilerHost;
    exports.createFunctionTypeNode = typescript_1.createFunctionTypeNode;
    exports.createIdentifier = typescript_1.createIdentifier;
    exports.createIndexSignature = typescript_1.createIndexSignature;
    exports.createKeywordTypeNode = typescript_1.createKeywordTypeNode;
    exports.createLiteral = typescript_1.createLiteral;
    exports.createLiteralTypeNode = typescript_1.createLiteralTypeNode;
    exports.createNodeArray = typescript_1.createNodeArray;
    exports.createNotEmittedStatement = typescript_1.createNotEmittedStatement;
    exports.createNull = typescript_1.createNull;
    exports.createObjectLiteral = typescript_1.createObjectLiteral;
    exports.createParameter = typescript_1.createParameter;
    exports.createProgram = typescript_1.createProgram;
    exports.createProperty = typescript_1.createProperty;
    exports.createPropertyAccess = typescript_1.createPropertyAccess;
    exports.createPropertyAssignment = typescript_1.createPropertyAssignment;
    exports.createPropertySignature = typescript_1.createPropertySignature;
    exports.createSourceFile = typescript_1.createSourceFile;
    exports.createStatement = typescript_1.createStatement;
    exports.createToken = typescript_1.createToken;
    exports.createTypeLiteralNode = typescript_1.createTypeLiteralNode;
    exports.createTypeReferenceNode = typescript_1.createTypeReferenceNode;
    exports.createUnionTypeNode = typescript_1.createUnionTypeNode;
    exports.createVariableDeclaration = typescript_1.createVariableDeclaration;
    exports.createVariableDeclarationList = typescript_1.createVariableDeclarationList;
    exports.createVariableStatement = typescript_1.createVariableStatement;
    exports.DiagnosticCategory = typescript_1.DiagnosticCategory;
    exports.EmitFlags = typescript_1.EmitFlags;
    exports.flattenDiagnosticMessageText = typescript_1.flattenDiagnosticMessageText;
    exports.forEachChild = typescript_1.forEachChild;
    exports.formatDiagnostics = typescript_1.formatDiagnostics;
    exports.getCombinedModifierFlags = typescript_1.getCombinedModifierFlags;
    exports.getLeadingCommentRanges = typescript_1.getLeadingCommentRanges;
    exports.getLineAndCharacterOfPosition = typescript_1.getLineAndCharacterOfPosition;
    exports.getMutableClone = typescript_1.getMutableClone;
    exports.getOriginalNode = typescript_1.getOriginalNode;
    exports.getPreEmitDiagnostics = typescript_1.getPreEmitDiagnostics;
    exports.getSyntheticLeadingComments = typescript_1.getSyntheticLeadingComments;
    exports.getSyntheticTrailingComments = typescript_1.getSyntheticTrailingComments;
    exports.getTrailingCommentRanges = typescript_1.getTrailingCommentRanges;
    exports.IndexKind = typescript_1.IndexKind;
    exports.isArrowFunction = typescript_1.isArrowFunction;
    exports.isBinaryExpression = typescript_1.isBinaryExpression;
    exports.isCallExpression = typescript_1.isCallExpression;
    exports.isExportDeclaration = typescript_1.isExportDeclaration;
    exports.isExpressionStatement = typescript_1.isExpressionStatement;
    exports.isExternalModule = typescript_1.isExternalModule;
    exports.isIdentifier = typescript_1.isIdentifier;
    exports.isImportDeclaration = typescript_1.isImportDeclaration;
    exports.isLiteralExpression = typescript_1.isLiteralExpression;
    exports.isLiteralTypeNode = typescript_1.isLiteralTypeNode;
    exports.isObjectLiteralExpression = typescript_1.isObjectLiteralExpression;
    exports.isPropertyAccessExpression = typescript_1.isPropertyAccessExpression;
    exports.isPropertyAssignment = typescript_1.isPropertyAssignment;
    exports.isQualifiedName = typescript_1.isQualifiedName;
    exports.isStringLiteral = typescript_1.isStringLiteral;
    exports.isTypeReferenceNode = typescript_1.isTypeReferenceNode;
    exports.isVariableStatement = typescript_1.isVariableStatement;
    exports.ModifierFlags = typescript_1.ModifierFlags;
    exports.ModuleKind = typescript_1.ModuleKind;
    exports.NodeFlags = typescript_1.NodeFlags;
    exports.ObjectFlags = typescript_1.ObjectFlags;
    exports.parseCommandLine = typescript_1.parseCommandLine;
    exports.parseJsonConfigFileContent = typescript_1.parseJsonConfigFileContent;
    exports.readConfigFile = typescript_1.readConfigFile;
    exports.resolveModuleName = typescript_1.resolveModuleName;
    exports.ScriptTarget = typescript_1.ScriptTarget;
    exports.setCommentRange = typescript_1.setCommentRange;
    exports.setEmitFlags = typescript_1.setEmitFlags;
    exports.setOriginalNode = typescript_1.setOriginalNode;
    exports.setSourceMapRange = typescript_1.setSourceMapRange;
    exports.setSyntheticLeadingComments = typescript_1.setSyntheticLeadingComments;
    exports.setSyntheticTrailingComments = typescript_1.setSyntheticTrailingComments;
    exports.setTextRange = typescript_1.setTextRange;
    exports.SignatureKind = typescript_1.SignatureKind;
    exports.SymbolFlags = typescript_1.SymbolFlags;
    exports.SyntaxKind = typescript_1.SyntaxKind;
    exports.sys = typescript_1.sys;
    exports.TypeFlags = typescript_1.TypeFlags;
    exports.updateBlock = typescript_1.updateBlock;
    exports.updateConstructor = typescript_1.updateConstructor;
    exports.updateGetAccessor = typescript_1.updateGetAccessor;
    exports.updateMethod = typescript_1.updateMethod;
    exports.updateParameter = typescript_1.updateParameter;
    exports.updateSetAccessor = typescript_1.updateSetAccessor;
    exports.updateSourceFileNode = typescript_1.updateSourceFileNode;
    exports.visitEachChild = typescript_1.visitEachChild;
    exports.visitFunctionBody = typescript_1.visitFunctionBody;
    exports.visitLexicalEnvironment = typescript_1.visitLexicalEnvironment;
    exports.visitNode = typescript_1.visitNode;
    exports.visitParameterList = typescript_1.visitParameterList;
    // tslint:disable-next-line:variable-name Re-exporting JSDocSignature for backwards compat.
    exports.SyntaxKindJSDocSignature = ts.SyntaxKind.JSDocSignature;
    // getEmitFlags is now private starting in TS 2.5.
    // So we define our own method that calls through to TypeScript to defeat the
    // visibility constraint.
    function getEmitFlags(node) {
        return ts.getEmitFlags(node);
    }
    exports.getEmitFlags = getEmitFlags;
    // Between TypeScript 2.4 and 2.5 updateProperty was modified. If called with 2.4 re-order the
    // parameters.
    exports.updateProperty = ts.updateProperty;
    var _a = __read(ts.version.split('.'), 2), major = _a[0], minor = _a[1];
    if (major === '2' && minor === '4') {
        var updateProperty24_1 = ts.updateProperty;
        exports.updateProperty = function (node, decorators, modifiers, name, questionToken, type, initializer) {
            return updateProperty24_1(node, decorators, modifiers, name, type, initializer);
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVIOzs7Ozs7T0FNRztJQUVILCtFQUErRTtJQUUvRSwrQkFBaUM7SUFLakMseUNBQXN5RztJQUFweEcsbURBQUEsMkJBQTJCLENBQUE7SUFBOE0sMENBQUEsa0JBQWtCLENBQUE7SUFBRSwyQ0FBQSxtQkFBbUIsQ0FBQTtJQUFFLDJDQUFBLG1CQUFtQixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSxvQ0FBQSxZQUFZLENBQUE7SUFBRSxrQ0FBQSxVQUFVLENBQUE7SUFBRSwwQ0FBQSxrQkFBa0IsQ0FBQTtJQUFFLDhDQUFBLHNCQUFzQixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSw0Q0FBQSxvQkFBb0IsQ0FBQTtJQUFFLDZDQUFBLHFCQUFxQixDQUFBO0lBQUUscUNBQUEsYUFBYSxDQUFBO0lBQUUsNkNBQUEscUJBQXFCLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSxpREFBQSx5QkFBeUIsQ0FBQTtJQUFFLGtDQUFBLFVBQVUsQ0FBQTtJQUFFLDJDQUFBLG1CQUFtQixDQUFBO0lBQUUsdUNBQUEsZUFBZSxDQUFBO0lBQUUscUNBQUEsYUFBYSxDQUFBO0lBQUUsc0NBQUEsY0FBYyxDQUFBO0lBQUUsNENBQUEsb0JBQW9CLENBQUE7SUFBRSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSxtQ0FBQSxXQUFXLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUsMkNBQUEsbUJBQW1CLENBQUE7SUFBRSxpREFBQSx5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QUUsYUFBSyxDQUEwQjtJQUM3QyxJQUFJLEtBQUssS0FBSyxHQUFHLElBQUksS0FBSyxLQUFLLEdBQUcsRUFBRTtRQUNsQyxJQUFNLGtCQUFnQixHQUFHLEVBQUUsQ0FBQyxjQUFtRCxDQUFDO1FBQ2hGLHNCQUFjLEdBQUcsVUFBQyxJQUE0QixFQUFFLFVBQWlELEVBQy9FLFNBQStDLEVBQUUsSUFBNEIsRUFDN0UsYUFBeUMsRUFBRSxJQUEyQixFQUN0RSxXQUFvQztZQUNwRCxPQUFPLGtCQUFnQixDQUNaLElBQXVDLEVBQUUsVUFBcUMsRUFDOUUsU0FBZ0IsRUFBRSxJQUFXLEVBQUUsSUFBVyxFQUFFLFdBQWtCLENBQVEsQ0FBQztRQUNwRixDQUFDLENBQUM7S0FDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEFic3RyYWN0aW9uIG92ZXIgdGhlIFR5cGVTY3JpcHQgQVBJIHRoYXQgbWFrZXMgbXVsdGlwbGVcbiAqIHZlcnNpb25zIG9mIFR5cGVTY3JpcHQgYXBwZWFyIHRvIGJlIGludGVyb3BlcmFibGUuIEFueSB0aW1lIGEgYnJlYWtpbmcgY2hhbmdlXG4gKiBpbiBUeXBlU2NyaXB0IGFmZmVjdHMgVHNpY2tsZSBjb2RlLCB3ZSBzaG91bGQgZXh0ZW5kIHRoaXMgc2hpbSB0byBwcmVzZW50IGFuXG4gKiB1bmJyb2tlbiBBUEkuXG4gKiBBbGwgY29kZSBpbiB0c2lja2xlIHNob3VsZCBpbXBvcnQgZnJvbSB0aGlzIGxvY2F0aW9uLCBub3QgZnJvbSAndHlwZXNjcmlwdCcuXG4gKi9cblxuLy8gdHNsaW50OmRpc2FibGU6bm8tYW55IFdlIG5lZWQgdG8gZG8gdmFyaW91cyB1bnNhZmUgY2FzdHMgYmV0d2VlbiBUUyB2ZXJzaW9uc1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLy8gTm90ZSwgdGhpcyBpbXBvcnQgZGVwZW5kcyBvbiBhIGdlbnJ1bGUgY29weWluZyB0aGUgLmQudHMgZmlsZSB0byB0aGlzIHBhY2thZ2VcbmltcG9ydCAqIGFzIHRzMjQgZnJvbSAnLi90eXBlc2NyaXB0LTIuNCc7XG5cbmV4cG9ydCB7X19TdHJpbmcsIGFkZFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudCwgQXNzZXJ0aW9uRXhwcmVzc2lvbiwgQmluYXJ5RXhwcmVzc2lvbiwgQmxvY2ssIENhbGxFeHByZXNzaW9uLCBDYW5jZWxsYXRpb25Ub2tlbiwgQ2xhc3NEZWNsYXJhdGlvbiwgQ2xhc3NFbGVtZW50LCBDbGFzc0xpa2VEZWNsYXJhdGlvbiwgQ29tbWVudFJhbmdlLCBDb21waWxlckhvc3QsIENvbXBpbGVyT3B0aW9ucywgQ29uc3RydWN0b3JEZWNsYXJhdGlvbiwgY3JlYXRlQXJyYXlMaXRlcmFsLCBjcmVhdGVBcnJheVR5cGVOb2RlLCBjcmVhdGVBcnJvd0Z1bmN0aW9uLCBjcmVhdGVBc3NpZ25tZW50LCBjcmVhdGVCaW5hcnksIGNyZWF0ZUNhbGwsIGNyZWF0ZUNvbXBpbGVySG9zdCwgY3JlYXRlRnVuY3Rpb25UeXBlTm9kZSwgY3JlYXRlSWRlbnRpZmllciwgY3JlYXRlSW5kZXhTaWduYXR1cmUsIGNyZWF0ZUtleXdvcmRUeXBlTm9kZSwgY3JlYXRlTGl0ZXJhbCwgY3JlYXRlTGl0ZXJhbFR5cGVOb2RlLCBjcmVhdGVOb2RlQXJyYXksIGNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQsIGNyZWF0ZU51bGwsIGNyZWF0ZU9iamVjdExpdGVyYWwsIGNyZWF0ZVBhcmFtZXRlciwgY3JlYXRlUHJvZ3JhbSwgY3JlYXRlUHJvcGVydHksIGNyZWF0ZVByb3BlcnR5QWNjZXNzLCBjcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQsIGNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlLCBjcmVhdGVTb3VyY2VGaWxlLCBjcmVhdGVTdGF0ZW1lbnQsIGNyZWF0ZVRva2VuLCBjcmVhdGVUeXBlTGl0ZXJhbE5vZGUsIGNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlLCBjcmVhdGVVbmlvblR5cGVOb2RlLCBjcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uLCBjcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uTGlzdCwgY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnQsIEN1c3RvbVRyYW5zZm9ybWVycywgRGVjbGFyYXRpb24sIERlY2xhcmF0aW9uU3RhdGVtZW50LCBEZWNsYXJhdGlvbldpdGhUeXBlUGFyYW1ldGVycywgRGVjb3JhdG9yLCBEaWFnbm9zdGljLCBEaWFnbm9zdGljQ2F0ZWdvcnksIEVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uLCBFbWl0RmxhZ3MsIEVtaXRSZXN1bHQsIEVudGl0eU5hbWUsIEVudW1EZWNsYXJhdGlvbiwgRW51bU1lbWJlciwgRXhwb3J0RGVjbGFyYXRpb24sIEV4cG9ydFNwZWNpZmllciwgRXhwcmVzc2lvbiwgRXhwcmVzc2lvblN0YXRlbWVudCwgZmxhdHRlbkRpYWdub3N0aWNNZXNzYWdlVGV4dCwgZm9yRWFjaENoaWxkLCBmb3JtYXREaWFnbm9zdGljcywgRm9ybWF0RGlhZ25vc3RpY3NIb3N0LCBGdW5jdGlvbkRlY2xhcmF0aW9uLCBGdW5jdGlvbkxpa2VEZWNsYXJhdGlvbiwgR2V0QWNjZXNzb3JEZWNsYXJhdGlvbiwgZ2V0Q29tYmluZWRNb2RpZmllckZsYWdzLCBnZXRMZWFkaW5nQ29tbWVudFJhbmdlcywgZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24sIGdldE11dGFibGVDbG9uZSwgZ2V0T3JpZ2luYWxOb2RlLCBnZXRQcmVFbWl0RGlhZ25vc3RpY3MsIGdldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cywgZ2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cywgZ2V0VHJhaWxpbmdDb21tZW50UmFuZ2VzLCBJZGVudGlmaWVyLCBJbXBvcnREZWNsYXJhdGlvbiwgSW1wb3J0RXF1YWxzRGVjbGFyYXRpb24sIEltcG9ydFNwZWNpZmllciwgSW5kZXhLaW5kLCBJbnRlcmZhY2VEZWNsYXJhdGlvbiwgaXNBcnJvd0Z1bmN0aW9uLCBpc0JpbmFyeUV4cHJlc3Npb24sIGlzQ2FsbEV4cHJlc3Npb24sIGlzRXhwb3J0RGVjbGFyYXRpb24sIGlzRXhwcmVzc2lvblN0YXRlbWVudCwgaXNFeHRlcm5hbE1vZHVsZSwgaXNJZGVudGlmaWVyLCBpc0ltcG9ydERlY2xhcmF0aW9uLCBpc0xpdGVyYWxFeHByZXNzaW9uLCBpc0xpdGVyYWxUeXBlTm9kZSwgaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbiwgaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24sIGlzUHJvcGVydHlBc3NpZ25tZW50LCBpc1F1YWxpZmllZE5hbWUsIGlzU3RyaW5nTGl0ZXJhbCwgaXNUeXBlUmVmZXJlbmNlTm9kZSwgaXNWYXJpYWJsZVN0YXRlbWVudCwgTWV0aG9kRGVjbGFyYXRpb24sIE1vZGlmaWVyRmxhZ3MsIE1vZHVsZUJsb2NrLCBNb2R1bGVEZWNsYXJhdGlvbiwgTW9kdWxlS2luZCwgTW9kdWxlUmVzb2x1dGlvbkhvc3QsIE5hbWVkRGVjbGFyYXRpb24sIE5hbWVkSW1wb3J0cywgTm9kZSwgTm9kZUFycmF5LCBOb2RlRmxhZ3MsIE5vbk51bGxFeHByZXNzaW9uLCBOb3RFbWl0dGVkU3RhdGVtZW50LCBPYmplY3RGbGFncywgT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlLCBPYmplY3RMaXRlcmFsRXhwcmVzc2lvbiwgT2JqZWN0VHlwZSwgUGFyYW1ldGVyRGVjbGFyYXRpb24sIHBhcnNlQ29tbWFuZExpbmUsIHBhcnNlSnNvbkNvbmZpZ0ZpbGVDb250ZW50LCBQcm9ncmFtLCBQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24sIFByb3BlcnR5QXNzaWdubWVudCwgUHJvcGVydHlEZWNsYXJhdGlvbiwgUHJvcGVydHlOYW1lLCBQcm9wZXJ0eVNpZ25hdHVyZSwgUXVhbGlmaWVkTmFtZSwgcmVhZENvbmZpZ0ZpbGUsIHJlc29sdmVNb2R1bGVOYW1lLCBTY3JpcHRUYXJnZXQsIFNldEFjY2Vzc29yRGVjbGFyYXRpb24sIHNldENvbW1lbnRSYW5nZSwgc2V0RW1pdEZsYWdzLCBzZXRPcmlnaW5hbE5vZGUsIHNldFNvdXJjZU1hcFJhbmdlLCBzZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMsIHNldFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudHMsIHNldFRleHRSYW5nZSwgU2lnbmF0dXJlLCBTaWduYXR1cmVEZWNsYXJhdGlvbiwgU2lnbmF0dXJlS2luZCwgU291cmNlRmlsZSwgU3RhdGVtZW50LCBTdHJpbmdMaXRlcmFsLCBTeW1ib2wsIFN5bWJvbEZsYWdzLCBTeW1ib2xXcml0ZXIsIFN5bnRheEtpbmQsIFN5bnRoZXNpemVkQ29tbWVudCwgc3lzLCBUb2tlbiwgVHJhbnNmb3JtYXRpb25Db250ZXh0LCBUcmFuc2Zvcm1lciwgVHJhbnNmb3JtZXJGYWN0b3J5LCBUeXBlLCBUeXBlQWxpYXNEZWNsYXJhdGlvbiwgVHlwZUNoZWNrZXIsIFR5cGVFbGVtZW50LCBUeXBlRmxhZ3MsIFR5cGVOb2RlLCBUeXBlUGFyYW1ldGVyRGVjbGFyYXRpb24sIFR5cGVSZWZlcmVuY2UsIFR5cGVSZWZlcmVuY2VOb2RlLCBVbmlvblR5cGUsIHVwZGF0ZUJsb2NrLCB1cGRhdGVDb25zdHJ1Y3RvciwgdXBkYXRlR2V0QWNjZXNzb3IsIHVwZGF0ZU1ldGhvZCwgdXBkYXRlUGFyYW1ldGVyLCB1cGRhdGVTZXRBY2Nlc3NvciwgdXBkYXRlU291cmNlRmlsZU5vZGUsIFZhcmlhYmxlRGVjbGFyYXRpb24sIFZhcmlhYmxlU3RhdGVtZW50LCB2aXNpdEVhY2hDaGlsZCwgdmlzaXRGdW5jdGlvbkJvZHksIHZpc2l0TGV4aWNhbEVudmlyb25tZW50LCB2aXNpdE5vZGUsIFZpc2l0b3IsIHZpc2l0UGFyYW1ldGVyTGlzdCwgV3JpdGVGaWxlQ2FsbGJhY2t9IGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFyaWFibGUtbmFtZSBSZS1leHBvcnRpbmcgSlNEb2NTaWduYXR1cmUgZm9yIGJhY2t3YXJkcyBjb21wYXQuXG5leHBvcnQgY29uc3QgU3ludGF4S2luZEpTRG9jU2lnbmF0dXJlID0gdHMuU3ludGF4S2luZC5KU0RvY1NpZ25hdHVyZTtcblxuLy8gZ2V0RW1pdEZsYWdzIGlzIG5vdyBwcml2YXRlIHN0YXJ0aW5nIGluIFRTIDIuNS5cbi8vIFNvIHdlIGRlZmluZSBvdXIgb3duIG1ldGhvZCB0aGF0IGNhbGxzIHRocm91Z2ggdG8gVHlwZVNjcmlwdCB0byBkZWZlYXQgdGhlXG4vLyB2aXNpYmlsaXR5IGNvbnN0cmFpbnQuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW1pdEZsYWdzKG5vZGU6IHRzLk5vZGUpOiB0cy5FbWl0RmxhZ3N8dW5kZWZpbmVkIHtcbiAgcmV0dXJuICh0cyBhcyBhbnkpLmdldEVtaXRGbGFncyhub2RlKTtcbn1cblxuLy8gQmV0d2VlbiBUeXBlU2NyaXB0IDIuNCBhbmQgMi41IHVwZGF0ZVByb3BlcnR5IHdhcyBtb2RpZmllZC4gSWYgY2FsbGVkIHdpdGggMi40IHJlLW9yZGVyIHRoZVxuLy8gcGFyYW1ldGVycy5cbmV4cG9ydCBsZXQgdXBkYXRlUHJvcGVydHkgPSB0cy51cGRhdGVQcm9wZXJ0eTtcblxuY29uc3QgW21ham9yLCBtaW5vcl0gPSB0cy52ZXJzaW9uLnNwbGl0KCcuJyk7XG5pZiAobWFqb3IgPT09ICcyJyAmJiBtaW5vciA9PT0gJzQnKSB7XG4gIGNvbnN0IHVwZGF0ZVByb3BlcnR5MjQgPSB0cy51cGRhdGVQcm9wZXJ0eSBhcyBhbnkgYXMgdHlwZW9mIHRzMjQudXBkYXRlUHJvcGVydHk7XG4gIHVwZGF0ZVByb3BlcnR5ID0gKG5vZGU6IHRzLlByb3BlcnR5RGVjbGFyYXRpb24sIGRlY29yYXRvcnM6IFJlYWRvbmx5QXJyYXk8dHMuRGVjb3JhdG9yPnx1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyczogUmVhZG9ubHlBcnJheTx0cy5Nb2RpZmllcj58dW5kZWZpbmVkLCBuYW1lOiBzdHJpbmd8dHMuUHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvblRva2VuOiB0cy5RdWVzdGlvblRva2VufHVuZGVmaW5lZCwgdHlwZTogdHMuVHlwZU5vZGV8dW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplcjogdHMuRXhwcmVzc2lvbnx1bmRlZmluZWQpOiB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uID0+IHtcbiAgICByZXR1cm4gdXBkYXRlUHJvcGVydHkyNChcbiAgICAgICAgICAgICAgIG5vZGUgYXMgYW55IGFzIHRzMjQuUHJvcGVydHlEZWNsYXJhdGlvbiwgZGVjb3JhdG9ycyBhcyBhbnkgYXMgdHMyNC5EZWNvcmF0b3JbXSxcbiAgICAgICAgICAgICAgIG1vZGlmaWVycyBhcyBhbnksIG5hbWUgYXMgYW55LCB0eXBlIGFzIGFueSzCoGluaXRpYWxpemVyIGFzIGFueSkgYXMgYW55O1xuICB9O1xufVxuIl19