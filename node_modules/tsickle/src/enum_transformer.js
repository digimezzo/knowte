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
        define("tsickle/src/enum_transformer", ["require", "exports", "typescript", "tsickle/src/transformer_util", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @fileoverview Transforms TypeScript enum declarations to Closure enum declarations, which
     * look like:
     *
     *     /.. @enum {number} ./
     *     const Foo = {BAR: 0, BAZ: 1, ...};
     *     export {Foo};  // even if originally exported on one line.
     *
     * This declares an enum type for Closure Compiler (and Closure JS users of this TS code).
     * Splitting the enum into declaration and export is required so that local references to the
     * type resolve ("@type {Foo}").
     */
    var ts = require("typescript");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var util_1 = require("tsickle/src/util");
    /** isInNamespace returns true if any of node's ancestors is a namespace (ModuleDeclaration). */
    function isInNamespace(node) {
        // Must use the original node because node might have already been transformed, with node.parent
        // no longer being set.
        var parent = ts.getOriginalNode(node).parent;
        while (parent) {
            if (parent.kind === ts.SyntaxKind.ModuleDeclaration) {
                return true;
            }
            parent = parent.parent;
        }
        return false;
    }
    /**
     * getEnumMemberType computes the type of an enum member by inspecting its initializer expression.
     */
    function getEnumMemberType(typeChecker, member) {
        // Enum members without initialization have type 'number'
        if (!member.initializer) {
            return 'number';
        }
        var type = typeChecker.getTypeAtLocation(member.initializer);
        // Note: checking against 'NumberLike' instead of just 'Number' means this code
        // handles both
        //   MEMBER = 3,  // TypeFlags.NumberLiteral
        // and
        //   MEMBER = someFunction(),  // TypeFlags.Number
        if (type.flags & ts.TypeFlags.NumberLike) {
            return 'number';
        }
        // If the value is not a number, it must be a string.
        // TypeScript does not allow enum members to have any other type.
        return 'string';
    }
    /**
     * getEnumType computes the Closure type of an enum, by iterating through the members and gathering
     * their types.
     */
    function getEnumType(typeChecker, enumDecl) {
        var e_1, _a;
        var hasNumber = false;
        var hasString = false;
        try {
            for (var _b = __values(enumDecl.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                var member = _c.value;
                var type = getEnumMemberType(typeChecker, member);
                if (type === 'string') {
                    hasString = true;
                }
                else if (type === 'number') {
                    hasNumber = true;
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
        if (hasNumber && hasString) {
            return '?'; // Closure's new type inference doesn't support enums of unions.
        }
        else if (hasNumber) {
            return 'number';
        }
        else if (hasString) {
            return 'string';
        }
        else {
            // Perhaps an empty enum?
            return '?';
        }
    }
    /**
     * Transformer factory for the enum transformer. See fileoverview for details.
     */
    function enumTransformer(typeChecker, diagnostics) {
        return function (context) {
            function visitor(node) {
                var e_2, _a, e_3, _b;
                if (!ts.isEnumDeclaration(node))
                    return ts.visitEachChild(node, visitor, context);
                // TODO(martinprobst): The enum transformer does not work for enums embedded in namespaces,
                // because TS does not support splitting export and declaration ("export {Foo};") in
                // namespaces. tsickle's emit for namespaces is unintelligible for Closure in any case, so
                // this is left to fix for another day.
                if (isInNamespace(node))
                    return ts.visitEachChild(node, visitor, context);
                var name = node.name.getText();
                var isExported = util_1.hasModifierFlag(node, ts.ModifierFlags.Export);
                var enumType = getEnumType(typeChecker, node);
                var values = [];
                var enumIndex = 0;
                try {
                    for (var _c = __values(node.members), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var member = _d.value;
                        var enumValue = void 0;
                        if (member.initializer) {
                            var enumConstValue = typeChecker.getConstantValue(member);
                            if (typeof enumConstValue === 'number') {
                                enumIndex = enumConstValue + 1;
                                enumValue = ts.createLiteral(enumConstValue);
                            }
                            else {
                                // Non-numeric enum value (string or an expression).
                                // Emit this initializer expression as-is.
                                // Note: if the member's initializer expression refers to another
                                // value within the enum (e.g. something like
                                //   enum Foo {
                                //     Field1,
                                //     Field2 = Field1 + something(),
                                //   }
                                // Then when we emit the initializer we produce invalid code because
                                // on the Closure side the reference to Field1 has to be namespaced,
                                // e.g. written "Foo.Field1 + something()".
                                // Hopefully this doesn't come up often -- if the enum instead has
                                // something like
                                //     Field2 = Field1 + 3,
                                // then it's still a constant expression and we inline the constant
                                // value in the above branch of this "if" statement.
                                enumValue = visitor(member.initializer);
                            }
                        }
                        else {
                            enumValue = ts.createLiteral(enumIndex);
                            enumIndex++;
                        }
                        var memberName = member.name.getText();
                        values.push(ts.setOriginalNode(ts.setTextRange(ts.createPropertyAssignment(memberName, enumValue), member), member));
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                var varDecl = ts.createVariableStatement([ts.createToken(ts.SyntaxKind.ConstKeyword)], [ts.createVariableDeclaration(name, undefined, ts.createObjectLiteral(ts.setTextRange(ts.createNodeArray(values, true), node.members), true))]);
                var comment = {
                    kind: ts.SyntaxKind.MultiLineCommentTrivia,
                    text: "* @enum {" + enumType + "} ",
                    hasTrailingNewLine: true,
                    pos: -1,
                    end: -1
                };
                ts.setSyntheticLeadingComments(varDecl, [comment]);
                var resultNodes = [varDecl];
                if (isExported) {
                    // Create a separate export {...} statement, so that the enum name can be used in local
                    // type annotations within the file.
                    resultNodes.push(ts.createExportDeclaration(undefined, undefined, ts.createNamedExports([ts.createExportSpecifier(undefined, name)])));
                }
                if (util_1.hasModifierFlag(node, ts.ModifierFlags.Const)) {
                    // By TypeScript semantics, const enums disappear after TS compilation.
                    // We still need to generate the runtime value above to make Closure Compiler's type system
                    // happy and allow refering to enums from JS code, but we should at least not emit string
                    // value mappings.
                    return resultNodes;
                }
                try {
                    // Emit the reverse mapping of foo[foo.BAR] = 'BAR'; lines for number enum members
                    for (var _e = __values(node.members), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var member = _f.value;
                        var memberName = member.name;
                        var memberType = getEnumMemberType(typeChecker, member);
                        if (memberType !== 'number')
                            continue;
                        // TypeScript enum members can have Identifier names or String names.
                        // We need to emit slightly different code to support these two syntaxes:
                        var nameExpr = void 0;
                        var memberAccess = void 0;
                        if (ts.isIdentifier(memberName)) {
                            // Foo[Foo.ABC] = "ABC";
                            nameExpr = transformer_util_1.createSingleQuoteStringLiteral(memberName.text);
                            memberAccess = ts.createPropertyAccess(ts.createIdentifier(name), memberName);
                        }
                        else {
                            // Foo[Foo["A B C"]] = "A B C"; or Foo[Foo[expression]] = expression;
                            nameExpr = ts.isComputedPropertyName(memberName) ? memberName.expression : memberName;
                            memberAccess = ts.createElementAccess(ts.createIdentifier(name), nameExpr);
                        }
                        resultNodes.push(ts.createStatement(ts.createAssignment(ts.createElementAccess(ts.createIdentifier(name), memberAccess), nameExpr)));
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                return resultNodes;
            }
            return function (sf) { return visitor(sf); };
        };
    }
    exports.enumTransformer = enumTransformer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bV90cmFuc2Zvcm1lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9lbnVtX3RyYW5zZm9ybWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVIOzs7Ozs7Ozs7OztPQVdHO0lBRUgsK0JBQWlDO0lBRWpDLGlFQUFrRTtJQUNsRSx5Q0FBdUM7SUFFdkMsZ0dBQWdHO0lBQ2hHLHVCQUF1QixJQUFhO1FBQ2xDLGdHQUFnRztRQUNoRyx1QkFBdUI7UUFDdkIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDN0MsT0FBTyxNQUFNLEVBQUU7WUFDYixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDbkQsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFDSCwyQkFBMkIsV0FBMkIsRUFBRSxNQUFxQjtRQUMzRSx5REFBeUQ7UUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDdkIsT0FBTyxRQUFRLENBQUM7U0FDakI7UUFDRCxJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9ELCtFQUErRTtRQUMvRSxlQUFlO1FBQ2YsNENBQTRDO1FBQzVDLE1BQU07UUFDTixrREFBa0Q7UUFDbEQsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFO1lBQ3hDLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO1FBQ0QscURBQXFEO1FBQ3JELGlFQUFpRTtRQUNqRSxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gscUJBQXFCLFdBQTJCLEVBQUUsUUFBNEI7O1FBRTVFLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7O1lBQ3RCLEtBQXFCLElBQUEsS0FBQSxTQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQWxDLElBQU0sTUFBTSxXQUFBO2dCQUNmLElBQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUNyQixTQUFTLEdBQUcsSUFBSSxDQUFDO2lCQUNsQjtxQkFBTSxJQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7b0JBQzVCLFNBQVMsR0FBRyxJQUFJLENBQUM7aUJBQ2xCO2FBQ0Y7Ozs7Ozs7OztRQUNELElBQUksU0FBUyxJQUFJLFNBQVMsRUFBRTtZQUMxQixPQUFPLEdBQUcsQ0FBQyxDQUFFLGdFQUFnRTtTQUM5RTthQUFNLElBQUksU0FBUyxFQUFFO1lBQ3BCLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO2FBQU0sSUFBSSxTQUFTLEVBQUU7WUFDcEIsT0FBTyxRQUFRLENBQUM7U0FDakI7YUFBTTtZQUNMLHlCQUF5QjtZQUN6QixPQUFPLEdBQUcsQ0FBQztTQUNaO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gseUJBQWdDLFdBQTJCLEVBQUUsV0FBNEI7UUFFdkYsT0FBTyxVQUFDLE9BQWlDO1lBQ3ZDLGlCQUFvQyxJQUFPOztnQkFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7b0JBQUUsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRWxGLDJGQUEyRjtnQkFDM0Ysb0ZBQW9GO2dCQUNwRiwwRkFBMEY7Z0JBQzFGLHVDQUF1QztnQkFDdkMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDO29CQUFFLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUUxRSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQyxJQUFNLFVBQVUsR0FBRyxzQkFBZSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNsRSxJQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVoRCxJQUFNLE1BQU0sR0FBNEIsRUFBRSxDQUFDO2dCQUMzQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7O29CQUNsQixLQUFxQixJQUFBLEtBQUEsU0FBQSxJQUFJLENBQUMsT0FBTyxDQUFBLGdCQUFBLDRCQUFFO3dCQUE5QixJQUFNLE1BQU0sV0FBQTt3QkFDZixJQUFJLFNBQVMsU0FBZSxDQUFDO3dCQUM3QixJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7NEJBQ3RCLElBQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDNUQsSUFBSSxPQUFPLGNBQWMsS0FBSyxRQUFRLEVBQUU7Z0NBQ3RDLFNBQVMsR0FBRyxjQUFjLEdBQUcsQ0FBQyxDQUFDO2dDQUMvQixTQUFTLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQzs2QkFDOUM7aUNBQU07Z0NBQ0wsb0RBQW9EO2dDQUNwRCwwQ0FBMEM7Z0NBQzFDLGlFQUFpRTtnQ0FDakUsNkNBQTZDO2dDQUM3QyxlQUFlO2dDQUNmLGNBQWM7Z0NBQ2QscUNBQXFDO2dDQUNyQyxNQUFNO2dDQUNOLG9FQUFvRTtnQ0FDcEUsb0VBQW9FO2dDQUNwRSwyQ0FBMkM7Z0NBQzNDLGtFQUFrRTtnQ0FDbEUsaUJBQWlCO2dDQUNqQiwyQkFBMkI7Z0NBQzNCLG1FQUFtRTtnQ0FDbkUsb0RBQW9EO2dDQUNwRCxTQUFTLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQWtCLENBQUM7NkJBQzFEO3lCQUNGOzZCQUFNOzRCQUNMLFNBQVMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUN4QyxTQUFTLEVBQUUsQ0FBQzt5QkFDYjt3QkFDRCxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQzFCLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO3FCQUMzRjs7Ozs7Ozs7O2dCQUVELElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyx1QkFBdUIsQ0FDdEMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsRUFDNUMsQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQ3pCLElBQUksRUFBRSxTQUFTLEVBQ2YsRUFBRSxDQUFDLG1CQUFtQixDQUNsQixFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEYsSUFBTSxPQUFPLEdBQTBCO29CQUNyQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0I7b0JBQzFDLElBQUksRUFBRSxjQUFZLFFBQVEsT0FBSTtvQkFDOUIsa0JBQWtCLEVBQUUsSUFBSTtvQkFDeEIsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDUCxHQUFHLEVBQUUsQ0FBQyxDQUFDO2lCQUNSLENBQUM7Z0JBQ0YsRUFBRSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRW5ELElBQU0sV0FBVyxHQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksVUFBVSxFQUFFO29CQUNkLHVGQUF1RjtvQkFDdkYsb0NBQW9DO29CQUNwQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FDdkMsU0FBUyxFQUFFLFNBQVMsRUFDcEIsRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMxRTtnQkFFRCxJQUFJLHNCQUFlLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2pELHVFQUF1RTtvQkFDdkUsMkZBQTJGO29CQUMzRix5RkFBeUY7b0JBQ3pGLGtCQUFrQjtvQkFDbEIsT0FBTyxXQUFXLENBQUM7aUJBQ3BCOztvQkFFRCxrRkFBa0Y7b0JBQ2xGLEtBQXFCLElBQUEsS0FBQSxTQUFBLElBQUksQ0FBQyxPQUFPLENBQUEsZ0JBQUEsNEJBQUU7d0JBQTlCLElBQU0sTUFBTSxXQUFBO3dCQUNmLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQy9CLElBQU0sVUFBVSxHQUFHLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDMUQsSUFBSSxVQUFVLEtBQUssUUFBUTs0QkFBRSxTQUFTO3dCQUV0QyxxRUFBcUU7d0JBQ3JFLHlFQUF5RTt3QkFDekUsSUFBSSxRQUFRLFNBQUEsQ0FBQzt3QkFDYixJQUFJLFlBQVksU0FBQSxDQUFDO3dCQUNqQixJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUU7NEJBQy9CLHdCQUF3Qjs0QkFDeEIsUUFBUSxHQUFHLGlEQUE4QixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDM0QsWUFBWSxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7eUJBQy9FOzZCQUFNOzRCQUNMLHFFQUFxRTs0QkFDckUsUUFBUSxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDOzRCQUN0RixZQUFZLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQzt5QkFDNUU7d0JBQ0QsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDbkQsRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxZQUFZLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2xGOzs7Ozs7Ozs7Z0JBQ0QsT0FBTyxXQUFXLENBQUM7WUFDckIsQ0FBQztZQUVELE9BQU8sVUFBQyxFQUFpQixJQUFLLE9BQUEsT0FBTyxDQUFDLEVBQUUsQ0FBa0IsRUFBNUIsQ0FBNEIsQ0FBQztRQUM3RCxDQUFDLENBQUM7SUFDSixDQUFDO0lBaEhELDBDQWdIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRyYW5zZm9ybXMgVHlwZVNjcmlwdCBlbnVtIGRlY2xhcmF0aW9ucyB0byBDbG9zdXJlIGVudW0gZGVjbGFyYXRpb25zLCB3aGljaFxuICogbG9vayBsaWtlOlxuICpcbiAqICAgICAvLi4gQGVudW0ge251bWJlcn0gLi9cbiAqICAgICBjb25zdCBGb28gPSB7QkFSOiAwLCBCQVo6IDEsIC4uLn07XG4gKiAgICAgZXhwb3J0IHtGb299OyAgLy8gZXZlbiBpZiBvcmlnaW5hbGx5IGV4cG9ydGVkIG9uIG9uZSBsaW5lLlxuICpcbiAqIFRoaXMgZGVjbGFyZXMgYW4gZW51bSB0eXBlIGZvciBDbG9zdXJlIENvbXBpbGVyIChhbmQgQ2xvc3VyZSBKUyB1c2VycyBvZiB0aGlzIFRTIGNvZGUpLlxuICogU3BsaXR0aW5nIHRoZSBlbnVtIGludG8gZGVjbGFyYXRpb24gYW5kIGV4cG9ydCBpcyByZXF1aXJlZCBzbyB0aGF0IGxvY2FsIHJlZmVyZW5jZXMgdG8gdGhlXG4gKiB0eXBlIHJlc29sdmUgKFwiQHR5cGUge0Zvb31cIikuXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Y3JlYXRlU2luZ2xlUXVvdGVTdHJpbmdMaXRlcmFsfSBmcm9tICcuL3RyYW5zZm9ybWVyX3V0aWwnO1xuaW1wb3J0IHtoYXNNb2RpZmllckZsYWd9IGZyb20gJy4vdXRpbCc7XG5cbi8qKiBpc0luTmFtZXNwYWNlIHJldHVybnMgdHJ1ZSBpZiBhbnkgb2Ygbm9kZSdzIGFuY2VzdG9ycyBpcyBhIG5hbWVzcGFjZSAoTW9kdWxlRGVjbGFyYXRpb24pLiAqL1xuZnVuY3Rpb24gaXNJbk5hbWVzcGFjZShub2RlOiB0cy5Ob2RlKSB7XG4gIC8vIE11c3QgdXNlIHRoZSBvcmlnaW5hbCBub2RlIGJlY2F1c2Ugbm9kZSBtaWdodCBoYXZlIGFscmVhZHkgYmVlbiB0cmFuc2Zvcm1lZCwgd2l0aCBub2RlLnBhcmVudFxuICAvLyBubyBsb25nZXIgYmVpbmcgc2V0LlxuICBsZXQgcGFyZW50ID0gdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpLnBhcmVudDtcbiAgd2hpbGUgKHBhcmVudCkge1xuICAgIGlmIChwYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIGdldEVudW1NZW1iZXJUeXBlIGNvbXB1dGVzIHRoZSB0eXBlIG9mIGFuIGVudW0gbWVtYmVyIGJ5IGluc3BlY3RpbmcgaXRzIGluaXRpYWxpemVyIGV4cHJlc3Npb24uXG4gKi9cbmZ1bmN0aW9uIGdldEVudW1NZW1iZXJUeXBlKHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgbWVtYmVyOiB0cy5FbnVtTWVtYmVyKTogJ251bWJlcid8J3N0cmluZycge1xuICAvLyBFbnVtIG1lbWJlcnMgd2l0aG91dCBpbml0aWFsaXphdGlvbiBoYXZlIHR5cGUgJ251bWJlcidcbiAgaWYgKCFtZW1iZXIuaW5pdGlhbGl6ZXIpIHtcbiAgICByZXR1cm4gJ251bWJlcic7XG4gIH1cbiAgY29uc3QgdHlwZSA9IHR5cGVDaGVja2VyLmdldFR5cGVBdExvY2F0aW9uKG1lbWJlci5pbml0aWFsaXplcik7XG4gIC8vIE5vdGU6IGNoZWNraW5nIGFnYWluc3QgJ051bWJlckxpa2UnIGluc3RlYWQgb2YganVzdCAnTnVtYmVyJyBtZWFucyB0aGlzIGNvZGVcbiAgLy8gaGFuZGxlcyBib3RoXG4gIC8vICAgTUVNQkVSID0gMywgIC8vIFR5cGVGbGFncy5OdW1iZXJMaXRlcmFsXG4gIC8vIGFuZFxuICAvLyAgIE1FTUJFUiA9IHNvbWVGdW5jdGlvbigpLCAgLy8gVHlwZUZsYWdzLk51bWJlclxuICBpZiAodHlwZS5mbGFncyAmIHRzLlR5cGVGbGFncy5OdW1iZXJMaWtlKSB7XG4gICAgcmV0dXJuICdudW1iZXInO1xuICB9XG4gIC8vIElmIHRoZSB2YWx1ZSBpcyBub3QgYSBudW1iZXIsIGl0IG11c3QgYmUgYSBzdHJpbmcuXG4gIC8vIFR5cGVTY3JpcHQgZG9lcyBub3QgYWxsb3cgZW51bSBtZW1iZXJzIHRvIGhhdmUgYW55IG90aGVyIHR5cGUuXG4gIHJldHVybiAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBnZXRFbnVtVHlwZSBjb21wdXRlcyB0aGUgQ2xvc3VyZSB0eXBlIG9mIGFuIGVudW0sIGJ5IGl0ZXJhdGluZyB0aHJvdWdoIHRoZSBtZW1iZXJzIGFuZCBnYXRoZXJpbmdcbiAqIHRoZWlyIHR5cGVzLlxuICovXG5mdW5jdGlvbiBnZXRFbnVtVHlwZSh0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGVudW1EZWNsOiB0cy5FbnVtRGVjbGFyYXRpb24pOiAnbnVtYmVyJ3wnc3RyaW5nJ3xcbiAgICAnPycge1xuICBsZXQgaGFzTnVtYmVyID0gZmFsc2U7XG4gIGxldCBoYXNTdHJpbmcgPSBmYWxzZTtcbiAgZm9yIChjb25zdCBtZW1iZXIgb2YgZW51bURlY2wubWVtYmVycykge1xuICAgIGNvbnN0IHR5cGUgPSBnZXRFbnVtTWVtYmVyVHlwZSh0eXBlQ2hlY2tlciwgbWVtYmVyKTtcbiAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGhhc1N0cmluZyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgaGFzTnVtYmVyID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgaWYgKGhhc051bWJlciAmJiBoYXNTdHJpbmcpIHtcbiAgICByZXR1cm4gJz8nOyAgLy8gQ2xvc3VyZSdzIG5ldyB0eXBlIGluZmVyZW5jZSBkb2Vzbid0IHN1cHBvcnQgZW51bXMgb2YgdW5pb25zLlxuICB9IGVsc2UgaWYgKGhhc051bWJlcikge1xuICAgIHJldHVybiAnbnVtYmVyJztcbiAgfSBlbHNlIGlmIChoYXNTdHJpbmcpIHtcbiAgICByZXR1cm4gJ3N0cmluZyc7XG4gIH0gZWxzZSB7XG4gICAgLy8gUGVyaGFwcyBhbiBlbXB0eSBlbnVtP1xuICAgIHJldHVybiAnPyc7XG4gIH1cbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1lciBmYWN0b3J5IGZvciB0aGUgZW51bSB0cmFuc2Zvcm1lci4gU2VlIGZpbGVvdmVydmlldyBmb3IgZGV0YWlscy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVudW1UcmFuc2Zvcm1lcih0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10pOlxuICAgIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHtcbiAgICBmdW5jdGlvbiB2aXNpdG9yPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBUKTogVHx0cy5Ob2RlW10ge1xuICAgICAgaWYgKCF0cy5pc0VudW1EZWNsYXJhdGlvbihub2RlKSkgcmV0dXJuIHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpO1xuXG4gICAgICAvLyBUT0RPKG1hcnRpbnByb2JzdCk6IFRoZSBlbnVtIHRyYW5zZm9ybWVyIGRvZXMgbm90IHdvcmsgZm9yIGVudW1zIGVtYmVkZGVkIGluIG5hbWVzcGFjZXMsXG4gICAgICAvLyBiZWNhdXNlIFRTIGRvZXMgbm90IHN1cHBvcnQgc3BsaXR0aW5nIGV4cG9ydCBhbmQgZGVjbGFyYXRpb24gKFwiZXhwb3J0IHtGb299O1wiKSBpblxuICAgICAgLy8gbmFtZXNwYWNlcy4gdHNpY2tsZSdzIGVtaXQgZm9yIG5hbWVzcGFjZXMgaXMgdW5pbnRlbGxpZ2libGUgZm9yIENsb3N1cmUgaW4gYW55IGNhc2UsIHNvXG4gICAgICAvLyB0aGlzIGlzIGxlZnQgdG8gZml4IGZvciBhbm90aGVyIGRheS5cbiAgICAgIGlmIChpc0luTmFtZXNwYWNlKG5vZGUpKSByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG5cbiAgICAgIGNvbnN0IG5hbWUgPSBub2RlLm5hbWUuZ2V0VGV4dCgpO1xuICAgICAgY29uc3QgaXNFeHBvcnRlZCA9IGhhc01vZGlmaWVyRmxhZyhub2RlLCB0cy5Nb2RpZmllckZsYWdzLkV4cG9ydCk7XG4gICAgICBjb25zdCBlbnVtVHlwZSA9IGdldEVudW1UeXBlKHR5cGVDaGVja2VyLCBub2RlKTtcblxuICAgICAgY29uc3QgdmFsdWVzOiB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnRbXSA9IFtdO1xuICAgICAgbGV0IGVudW1JbmRleCA9IDA7XG4gICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBub2RlLm1lbWJlcnMpIHtcbiAgICAgICAgbGV0IGVudW1WYWx1ZTogdHMuRXhwcmVzc2lvbjtcbiAgICAgICAgaWYgKG1lbWJlci5pbml0aWFsaXplcikge1xuICAgICAgICAgIGNvbnN0IGVudW1Db25zdFZhbHVlID0gdHlwZUNoZWNrZXIuZ2V0Q29uc3RhbnRWYWx1ZShtZW1iZXIpO1xuICAgICAgICAgIGlmICh0eXBlb2YgZW51bUNvbnN0VmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBlbnVtSW5kZXggPSBlbnVtQ29uc3RWYWx1ZSArIDE7XG4gICAgICAgICAgICBlbnVtVmFsdWUgPSB0cy5jcmVhdGVMaXRlcmFsKGVudW1Db25zdFZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTm9uLW51bWVyaWMgZW51bSB2YWx1ZSAoc3RyaW5nIG9yIGFuIGV4cHJlc3Npb24pLlxuICAgICAgICAgICAgLy8gRW1pdCB0aGlzIGluaXRpYWxpemVyIGV4cHJlc3Npb24gYXMtaXMuXG4gICAgICAgICAgICAvLyBOb3RlOiBpZiB0aGUgbWVtYmVyJ3MgaW5pdGlhbGl6ZXIgZXhwcmVzc2lvbiByZWZlcnMgdG8gYW5vdGhlclxuICAgICAgICAgICAgLy8gdmFsdWUgd2l0aGluIHRoZSBlbnVtIChlLmcuIHNvbWV0aGluZyBsaWtlXG4gICAgICAgICAgICAvLyAgIGVudW0gRm9vIHtcbiAgICAgICAgICAgIC8vICAgICBGaWVsZDEsXG4gICAgICAgICAgICAvLyAgICAgRmllbGQyID0gRmllbGQxICsgc29tZXRoaW5nKCksXG4gICAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAgIC8vIFRoZW4gd2hlbiB3ZSBlbWl0IHRoZSBpbml0aWFsaXplciB3ZSBwcm9kdWNlIGludmFsaWQgY29kZSBiZWNhdXNlXG4gICAgICAgICAgICAvLyBvbiB0aGUgQ2xvc3VyZSBzaWRlIHRoZSByZWZlcmVuY2UgdG8gRmllbGQxIGhhcyB0byBiZSBuYW1lc3BhY2VkLFxuICAgICAgICAgICAgLy8gZS5nLiB3cml0dGVuIFwiRm9vLkZpZWxkMSArIHNvbWV0aGluZygpXCIuXG4gICAgICAgICAgICAvLyBIb3BlZnVsbHkgdGhpcyBkb2Vzbid0IGNvbWUgdXAgb2Z0ZW4gLS0gaWYgdGhlIGVudW0gaW5zdGVhZCBoYXNcbiAgICAgICAgICAgIC8vIHNvbWV0aGluZyBsaWtlXG4gICAgICAgICAgICAvLyAgICAgRmllbGQyID0gRmllbGQxICsgMyxcbiAgICAgICAgICAgIC8vIHRoZW4gaXQncyBzdGlsbCBhIGNvbnN0YW50IGV4cHJlc3Npb24gYW5kIHdlIGlubGluZSB0aGUgY29uc3RhbnRcbiAgICAgICAgICAgIC8vIHZhbHVlIGluIHRoZSBhYm92ZSBicmFuY2ggb2YgdGhpcyBcImlmXCIgc3RhdGVtZW50LlxuICAgICAgICAgICAgZW51bVZhbHVlID0gdmlzaXRvcihtZW1iZXIuaW5pdGlhbGl6ZXIpIGFzIHRzLkV4cHJlc3Npb247XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudW1WYWx1ZSA9IHRzLmNyZWF0ZUxpdGVyYWwoZW51bUluZGV4KTtcbiAgICAgICAgICBlbnVtSW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtZW1iZXJOYW1lID0gbWVtYmVyLm5hbWUuZ2V0VGV4dCgpO1xuICAgICAgICB2YWx1ZXMucHVzaCh0cy5zZXRPcmlnaW5hbE5vZGUoXG4gICAgICAgICAgICB0cy5zZXRUZXh0UmFuZ2UodHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KG1lbWJlck5hbWUsIGVudW1WYWx1ZSksIG1lbWJlciksIG1lbWJlcikpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2YXJEZWNsID0gdHMuY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnQoXG4gICAgICAgICAgW3RzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuQ29uc3RLZXl3b3JkKV0sXG4gICAgICAgICAgW3RzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgICAgICAgIG5hbWUsIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChcbiAgICAgICAgICAgICAgICAgIHRzLnNldFRleHRSYW5nZSh0cy5jcmVhdGVOb2RlQXJyYXkodmFsdWVzLCB0cnVlKSwgbm9kZS5tZW1iZXJzKSwgdHJ1ZSkpXSk7XG4gICAgICBjb25zdCBjb21tZW50OiB0cy5TeW50aGVzaXplZENvbW1lbnQgPSB7XG4gICAgICAgIGtpbmQ6IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSxcbiAgICAgICAgdGV4dDogYCogQGVudW0geyR7ZW51bVR5cGV9fSBgLFxuICAgICAgICBoYXNUcmFpbGluZ05ld0xpbmU6IHRydWUsXG4gICAgICAgIHBvczogLTEsXG4gICAgICAgIGVuZDogLTFcbiAgICAgIH07XG4gICAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHModmFyRGVjbCwgW2NvbW1lbnRdKTtcblxuICAgICAgY29uc3QgcmVzdWx0Tm9kZXM6IHRzLk5vZGVbXSA9IFt2YXJEZWNsXTtcbiAgICAgIGlmIChpc0V4cG9ydGVkKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIHNlcGFyYXRlIGV4cG9ydCB7Li4ufSBzdGF0ZW1lbnQsIHNvIHRoYXQgdGhlIGVudW0gbmFtZSBjYW4gYmUgdXNlZCBpbiBsb2NhbFxuICAgICAgICAvLyB0eXBlIGFubm90YXRpb25zIHdpdGhpbiB0aGUgZmlsZS5cbiAgICAgICAgcmVzdWx0Tm9kZXMucHVzaCh0cy5jcmVhdGVFeHBvcnREZWNsYXJhdGlvbihcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHMuY3JlYXRlTmFtZWRFeHBvcnRzKFt0cy5jcmVhdGVFeHBvcnRTcGVjaWZpZXIodW5kZWZpbmVkLCBuYW1lKV0pKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNNb2RpZmllckZsYWcobm9kZSwgdHMuTW9kaWZpZXJGbGFncy5Db25zdCkpIHtcbiAgICAgICAgLy8gQnkgVHlwZVNjcmlwdCBzZW1hbnRpY3MsIGNvbnN0IGVudW1zIGRpc2FwcGVhciBhZnRlciBUUyBjb21waWxhdGlvbi5cbiAgICAgICAgLy8gV2Ugc3RpbGwgbmVlZCB0byBnZW5lcmF0ZSB0aGUgcnVudGltZSB2YWx1ZSBhYm92ZSB0byBtYWtlIENsb3N1cmUgQ29tcGlsZXIncyB0eXBlIHN5c3RlbVxuICAgICAgICAvLyBoYXBweSBhbmQgYWxsb3cgcmVmZXJpbmcgdG8gZW51bXMgZnJvbSBKUyBjb2RlLCBidXQgd2Ugc2hvdWxkIGF0IGxlYXN0IG5vdCBlbWl0IHN0cmluZ1xuICAgICAgICAvLyB2YWx1ZSBtYXBwaW5ncy5cbiAgICAgICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xuICAgICAgfVxuXG4gICAgICAvLyBFbWl0IHRoZSByZXZlcnNlIG1hcHBpbmcgb2YgZm9vW2Zvby5CQVJdID0gJ0JBUic7IGxpbmVzIGZvciBudW1iZXIgZW51bSBtZW1iZXJzXG4gICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBub2RlLm1lbWJlcnMpIHtcbiAgICAgICAgY29uc3QgbWVtYmVyTmFtZSA9IG1lbWJlci5uYW1lO1xuICAgICAgICBjb25zdCBtZW1iZXJUeXBlID0gZ2V0RW51bU1lbWJlclR5cGUodHlwZUNoZWNrZXIsIG1lbWJlcik7XG4gICAgICAgIGlmIChtZW1iZXJUeXBlICE9PSAnbnVtYmVyJykgY29udGludWU7XG5cbiAgICAgICAgLy8gVHlwZVNjcmlwdCBlbnVtIG1lbWJlcnMgY2FuIGhhdmUgSWRlbnRpZmllciBuYW1lcyBvciBTdHJpbmcgbmFtZXMuXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gZW1pdCBzbGlnaHRseSBkaWZmZXJlbnQgY29kZSB0byBzdXBwb3J0IHRoZXNlIHR3byBzeW50YXhlczpcbiAgICAgICAgbGV0IG5hbWVFeHByO1xuICAgICAgICBsZXQgbWVtYmVyQWNjZXNzO1xuICAgICAgICBpZiAodHMuaXNJZGVudGlmaWVyKG1lbWJlck5hbWUpKSB7XG4gICAgICAgICAgLy8gRm9vW0Zvby5BQkNdID0gXCJBQkNcIjtcbiAgICAgICAgICBuYW1lRXhwciA9IGNyZWF0ZVNpbmdsZVF1b3RlU3RyaW5nTGl0ZXJhbChtZW1iZXJOYW1lLnRleHQpO1xuICAgICAgICAgIG1lbWJlckFjY2VzcyA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzLmNyZWF0ZUlkZW50aWZpZXIobmFtZSksIG1lbWJlck5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZvb1tGb29bXCJBIEIgQ1wiXV0gPSBcIkEgQiBDXCI7IG9yIEZvb1tGb29bZXhwcmVzc2lvbl1dID0gZXhwcmVzc2lvbjtcbiAgICAgICAgICBuYW1lRXhwciA9IHRzLmlzQ29tcHV0ZWRQcm9wZXJ0eU5hbWUobWVtYmVyTmFtZSkgPyBtZW1iZXJOYW1lLmV4cHJlc3Npb24gOiBtZW1iZXJOYW1lO1xuICAgICAgICAgIG1lbWJlckFjY2VzcyA9IHRzLmNyZWF0ZUVsZW1lbnRBY2Nlc3ModHMuY3JlYXRlSWRlbnRpZmllcihuYW1lKSwgbmFtZUV4cHIpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdE5vZGVzLnB1c2godHMuY3JlYXRlU3RhdGVtZW50KHRzLmNyZWF0ZUFzc2lnbm1lbnQoXG4gICAgICAgICAgICB0cy5jcmVhdGVFbGVtZW50QWNjZXNzKHRzLmNyZWF0ZUlkZW50aWZpZXIobmFtZSksIG1lbWJlckFjY2VzcyksIG5hbWVFeHByKSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xuICAgIH1cblxuICAgIHJldHVybiAoc2Y6IHRzLlNvdXJjZUZpbGUpID0+IHZpc2l0b3Ioc2YpIGFzIHRzLlNvdXJjZUZpbGU7XG4gIH07XG59XG4iXX0=