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
        define("tsickle/src/decorator_downlevel_transformer", ["require", "exports", "tsickle/src/decorators", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var decorators_1 = require("tsickle/src/decorators");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * Returns true if the given decorator should be downleveled.
     *
     * Decorators that have JSDoc on them including the `@Annotation` tag are downleveled and converted
     * into properties on the class by this pass.
     */
    function shouldLower(decorator, typeChecker) {
        var e_1, _a, e_2, _b;
        try {
            for (var _c = __values(decorators_1.getDecoratorDeclarations(decorator, typeChecker)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var d = _d.value;
                // TODO(lucassloan):
                // Switch to the TS JSDoc parser in the future to avoid false positives here.
                // For example using '@Annotation' in a true comment.
                // However, a new TS API would be needed, track at
                // https://github.com/Microsoft/TypeScript/issues/7393.
                var commentNode = d;
                // Not handling PropertyAccess expressions here, because they are
                // filtered earlier.
                if (commentNode.kind === ts.SyntaxKind.VariableDeclaration) {
                    if (!commentNode.parent)
                        continue;
                    commentNode = commentNode.parent;
                }
                // Go up one more level to VariableDeclarationStatement, where usually
                // the comment lives. If the declaration has an 'export', the
                // VDList.getFullText will not contain the comment.
                if (commentNode.kind === ts.SyntaxKind.VariableDeclarationList) {
                    if (!commentNode.parent)
                        continue;
                    commentNode = commentNode.parent;
                }
                var range = ts.getLeadingCommentRanges(commentNode.getFullText(), 0);
                if (!range)
                    continue;
                try {
                    for (var range_1 = __values(range), range_1_1 = range_1.next(); !range_1_1.done; range_1_1 = range_1.next()) {
                        var _e = range_1_1.value, pos = _e.pos, end = _e.end;
                        var jsDocText = commentNode.getFullText().substring(pos, end);
                        if (jsDocText.includes('@Annotation'))
                            return true;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (range_1_1 && !range_1_1.done && (_b = range_1.return)) _b.call(range_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    }
    exports.shouldLower = shouldLower;
    /**
     * Creates the AST for the decorator field type annotation, which has the form
     *     { type: Function, args?: any[] }[]
     */
    function createDecoratorInvocationType() {
        var typeElements = [];
        typeElements.push(ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined));
        typeElements.push(ts.createPropertySignature(undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined));
        return ts.createArrayTypeNode(ts.createTypeLiteralNode(typeElements));
    }
    /**
     * Extracts the type of the decorator (the function or expression invoked), as well as all the
     * arguments passed to the decorator. Returns an AST with the form:
     *
     *     // For @decorator(arg1, arg2)
     *     { type: decorator, args: [arg1, arg2] }
     */
    function extractMetadataFromSingleDecorator(decorator, diagnostics) {
        var e_3, _a;
        var metadataProperties = [];
        var expr = decorator.expression;
        switch (expr.kind) {
            case ts.SyntaxKind.Identifier:
                // The decorator was a plain @Foo.
                metadataProperties.push(ts.createPropertyAssignment('type', expr));
                break;
            case ts.SyntaxKind.CallExpression:
                // The decorator was a call, like @Foo(bar).
                var call = expr;
                metadataProperties.push(ts.createPropertyAssignment('type', call.expression));
                if (call.arguments.length) {
                    var args = [];
                    try {
                        for (var _b = __values(call.arguments), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var arg = _c.value;
                            args.push(arg);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    var argsArrayLiteral = ts.createArrayLiteral(args);
                    argsArrayLiteral.elements.hasTrailingComma = true;
                    metadataProperties.push(ts.createPropertyAssignment('args', argsArrayLiteral));
                }
                break;
            default:
                diagnostics.push({
                    file: decorator.getSourceFile(),
                    start: decorator.getStart(),
                    length: decorator.getEnd() - decorator.getStart(),
                    messageText: ts.SyntaxKind[decorator.kind] + " not implemented in gathering decorator metadata",
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                });
                break;
        }
        return ts.createObjectLiteral(metadataProperties);
    }
    /**
     * Takes a list of decorator metadata object ASTs and produces an AST for a
     * static class property of an array of those metadata objects.
     */
    function createDecoratorClassProperty(decoratorList) {
        var modifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
        var type = createDecoratorInvocationType();
        var initializer = ts.createArrayLiteral(decoratorList, true);
        initializer.elements.hasTrailingComma = true;
        var prop = ts.createProperty(undefined, [modifier], 'decorators', undefined, type, initializer);
        // NB: the .decorators property does not get a @nocollapse property. There is
        // no good reason why - it means .decorators is not runtime accessible if you
        // compile with collapse properties, whereas propDecorators is, which doesn't
        // follow any stringent logic. However this has been the case previously, and
        // adding it back in leads to substantial code size increases as Closure fails
        // to tree shake these props without @nocollapse.
        return prop;
    }
    /**
     * Creates the AST for the 'ctorParameters' field type annotation:
     *   () => ({ type: any, decorators?: {type: Function, args?: any[]}[] }|null)[]
     */
    function createCtorParametersClassPropertyType() {
        // Sorry about this. Try reading just the string literals below.
        var typeElements = [];
        typeElements.push(ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined), undefined));
        typeElements.push(ts.createPropertySignature(undefined, 'decorators', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createTypeLiteralNode([
            ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined),
            ts.createPropertySignature(undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined)), undefined),
        ])), undefined));
        return ts.createFunctionTypeNode(undefined, [], ts.createArrayTypeNode(ts.createUnionTypeNode([ts.createTypeLiteralNode(typeElements), ts.createNull()])));
    }
    /**
     * Sets a Closure \@nocollapse synthetic comment on the given node. This prevents Closure Compiler
     * from collapsing the apparently static property, which would make it impossible to find for code
     * trying to detect it at runtime.
     */
    function addNoCollapseComment(n) {
        ts.setSyntheticLeadingComments(n, [{
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                text: '* @nocollapse ',
                pos: -1,
                end: -1,
                hasTrailingNewLine: true
            }]);
    }
    /**
     * createCtorParametersClassProperty creates a static 'ctorParameters' property containing
     * downleveled decorator information.
     *
     * The property contains an arrow function that returns an array of object literals of the shape:
     *     static ctorParameters = () => [{
     *       type: SomeClass|undefined,  // the type of the param that's decorated, if it's a value.
     *       decorators: [{
     *         type: DecoratorFn,  // the type of the decorator that's invoked.
     *         args: [ARGS],       // the arguments passed to the decorator.
     *       }]
     *     }];
     */
    function createCtorParametersClassProperty(diagnostics, entityNameToExpression, ctorParameters) {
        var e_4, _a, e_5, _b;
        var params = [];
        try {
            for (var ctorParameters_1 = __values(ctorParameters), ctorParameters_1_1 = ctorParameters_1.next(); !ctorParameters_1_1.done; ctorParameters_1_1 = ctorParameters_1.next()) {
                var ctorParam = ctorParameters_1_1.value;
                if (!ctorParam.type && ctorParam.decorators.length === 0) {
                    params.push(ts.createNull());
                    continue;
                }
                var paramType = ctorParam.type ?
                    typeReferenceToExpression(entityNameToExpression, ctorParam.type) :
                    undefined;
                var members = [ts.createPropertyAssignment('type', paramType || ts.createIdentifier('undefined'))];
                var decorators = [];
                try {
                    for (var _c = __values(ctorParam.decorators), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var deco = _d.value;
                        decorators.push(extractMetadataFromSingleDecorator(deco, diagnostics));
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                if (decorators.length) {
                    members.push(ts.createPropertyAssignment('decorators', ts.createArrayLiteral(decorators)));
                }
                params.push(ts.createObjectLiteral(members));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (ctorParameters_1_1 && !ctorParameters_1_1.done && (_a = ctorParameters_1.return)) _a.call(ctorParameters_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        var initializer = ts.createArrowFunction(undefined, undefined, [], undefined, ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), ts.createArrayLiteral(params, true));
        var type = createCtorParametersClassPropertyType();
        var ctorProp = ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'ctorParameters', undefined, type, initializer);
        addNoCollapseComment(ctorProp);
        return ctorProp;
    }
    /**
     * createPropDecoratorsClassProperty creates a static 'propDecorators' property containing type
     * information for every property that has a decorator applied.
     *
     *     static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
     *       propA: [{type: MyDecorator, args: [1, 2]}, ...],
     *       ...
     *     };
     */
    function createPropDecoratorsClassProperty(diagnostics, properties) {
        var e_6, _a;
        //  `static propDecorators: {[key: string]: ` + {type: Function, args?: any[]}[] + `} = {\n`);
        var entries = [];
        try {
            for (var _b = __values(properties.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), name_1 = _d[0], decorators = _d[1];
                entries.push(ts.createPropertyAssignment(name_1, ts.createArrayLiteral(decorators.map(function (deco) { return extractMetadataFromSingleDecorator(deco, diagnostics); }))));
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        var initializer = ts.createObjectLiteral(entries, true);
        var type = ts.createTypeLiteralNode([ts.createIndexSignature(undefined, undefined, [ts.createParameter(undefined, undefined, undefined, 'key', undefined, ts.createTypeReferenceNode('string', undefined), undefined)], createDecoratorInvocationType())]);
        return ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'propDecorators', undefined, type, initializer);
    }
    function isNameEqual(classMember, name) {
        if (classMember.name === undefined) {
            return false;
        }
        var id = classMember.name;
        return id.text === name;
    }
    /**
     * Returns an expression representing the (potentially) value part for the given node.
     *
     * This is a partial re-implementation of TypeScript's serializeTypeReferenceNode. This is a
     * workaround for https://github.com/Microsoft/TypeScript/issues/17516 (serializeTypeReferenceNode
     * not being exposed). In practice this implementation is sufficient for Angular's use of type
     * metadata.
     */
    function typeReferenceToExpression(entityNameToExpression, node) {
        var kind = node.kind;
        if (ts.isLiteralTypeNode(node)) {
            // Treat literal types like their base type (boolean, string, number).
            kind = node.literal.kind;
        }
        switch (kind) {
            case ts.SyntaxKind.FunctionType:
            case ts.SyntaxKind.ConstructorType:
                return ts.createIdentifier('Function');
            case ts.SyntaxKind.ArrayType:
            case ts.SyntaxKind.TupleType:
                return ts.createIdentifier('Array');
            case ts.SyntaxKind.TypePredicate:
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
            case ts.SyntaxKind.BooleanKeyword:
                return ts.createIdentifier('Boolean');
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.StringKeyword:
                return ts.createIdentifier('String');
            case ts.SyntaxKind.ObjectKeyword:
                return ts.createIdentifier('Object');
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.NumericLiteral:
                return ts.createIdentifier('Number');
            case ts.SyntaxKind.TypeReference:
                var typeRef = node;
                // Ignore any generic types, just return the base type.
                return entityNameToExpression(typeRef.typeName);
            default:
                return undefined;
        }
    }
    /**
     * Transformer factory for the decorator downlevel transformer. See fileoverview for details.
     */
    function decoratorDownlevelTransformer(typeChecker, diagnostics) {
        return function (context) {
            /** A map from symbols to the identifier of an import, reset per SourceFile. */
            var importNamesBySymbol = new Map();
            /**
             * Converts an EntityName (from a type annotation) to an expression (accessing a value).
             *
             * For a given ts.EntityName, this walks depth first to find the leftmost ts.Identifier, then
             * converts the path into property accesses.
             *
             * This generally works, but TypeScript's emit pipeline does not serialize identifiers that are
             * only used in a type location (such as identifiers in a TypeNode), even if the identifier
             * itself points to a value (e.g. a class). To avoid that problem, this method finds the symbol
             * representing the identifier (using typeChecker), then looks up where it was imported (using
             * importNamesBySymbol), and then uses the imported name instead of the identifier from the type
             * expression, if any. Otherwise it'll use the identifier unchanged. This makes sure the
             * identifier is not marked as stemming from a "type only" expression, causing it to be emitted
             * and causing the import to be retained.
             */
            function entityNameToExpression(name) {
                var sym = typeChecker.getSymbolAtLocation(name);
                if (!sym)
                    return undefined;
                // Check if the entity name references a symbol that is an actual value. If it is not, it
                // cannot be referenced by an expression, so return undefined.
                var symToCheck = sym;
                if (symToCheck.flags & ts.SymbolFlags.Alias) {
                    symToCheck = typeChecker.getAliasedSymbol(symToCheck);
                }
                if (!(symToCheck.flags & ts.SymbolFlags.Value))
                    return undefined;
                if (ts.isIdentifier(name)) {
                    // If there's a known import name for this symbol, use it so that the import will be
                    // retained and the value can be referenced.
                    if (importNamesBySymbol.has(sym))
                        return importNamesBySymbol.get(sym);
                    // Otherwise this will be a locally declared name, just return that.
                    return name;
                }
                var ref = entityNameToExpression(name.left);
                if (!ref)
                    return undefined;
                return ts.createPropertyAccess(ref, name.right);
            }
            /**
             * Transforms a class element. Returns a three tuple of name, transformed element, and
             * decorators found. Returns an undefined name if there are no decorators to lower on the
             * element, or the element has an exotic name.
             */
            function transformClassElement(element) {
                var e_7, _a;
                element = ts.visitEachChild(element, visitor, context);
                var decoratorsToKeep = [];
                var toLower = [];
                try {
                    for (var _b = __values(element.decorators || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var decorator = _c.value;
                        if (!shouldLower(decorator, typeChecker)) {
                            decoratorsToKeep.push(decorator);
                            continue;
                        }
                        toLower.push(decorator);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                if (!toLower.length)
                    return [undefined, element, []];
                if (!element.name || element.name.kind !== ts.SyntaxKind.Identifier) {
                    // Method has a weird name, e.g.
                    //   [Symbol.foo]() {...}
                    diagnostics.push({
                        file: element.getSourceFile(),
                        start: element.getStart(),
                        length: element.getEnd() - element.getStart(),
                        messageText: "cannot process decorators on strangely named method",
                        category: ts.DiagnosticCategory.Error,
                        code: 0,
                    });
                    return [undefined, element, []];
                }
                var name = element.name.text;
                var mutable = ts.getMutableClone(element);
                mutable.decorators = decoratorsToKeep.length ?
                    ts.setTextRange(ts.createNodeArray(decoratorsToKeep), mutable.decorators) :
                    undefined;
                return [name, mutable, toLower];
            }
            /**
             * Transforms a constructor. Returns the transformed constructor and the list of parameter
             * information collected, consisting of decorators and optional type.
             */
            function transformConstructor(ctor) {
                var e_8, _a, e_9, _b;
                ctor = ts.visitEachChild(ctor, visitor, context);
                var newParameters = [];
                var oldParameters = ts.visitParameterList(ctor.parameters, visitor, context);
                var parametersInfo = [];
                try {
                    for (var oldParameters_1 = __values(oldParameters), oldParameters_1_1 = oldParameters_1.next(); !oldParameters_1_1.done; oldParameters_1_1 = oldParameters_1.next()) {
                        var param = oldParameters_1_1.value;
                        var decoratorsToKeep = [];
                        var paramInfo = { decorators: [], type: null };
                        try {
                            for (var _c = __values(param.decorators || []), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var decorator = _d.value;
                                if (!shouldLower(decorator, typeChecker)) {
                                    decoratorsToKeep.push(decorator);
                                    continue;
                                }
                                paramInfo.decorators.push(decorator);
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        if (param.type) {
                            paramInfo.type = param.type;
                            // param has a type provided, e.g. "foo: Bar".
                            // The type will be emitted as a value expression later on, so verify that "Bar" is a
                            // value (e.g. a constructor) and not just a type.
                            // let sym = typeChecker.getTypeAtLocation(param.type).getSymbol();
                            // if (sym) {
                            //   // Symbol might be an alias for a non-value symbol, in which case we cannot reify it
                            //   // later and emit an appropriate expression. Note: the code here handles a parameter
                            //   // whose type is not a value (and potentially an alias). See
                            //   typeReferenceToExpression
                            //   // for code handling a local, in-file type alias.
                            //   if (sym.flags & ts.SymbolFlags.Alias) {
                            //     sym = typeChecker.getAliasedSymbol(sym);
                            //   }
                            //   if (sym.flags & ts.SymbolFlags.Value) {
                            //     paramInfo!.type = param.type;
                            //   }
                            // }
                        }
                        parametersInfo.push(paramInfo);
                        var newParam = ts.updateParameter(param, 
                        // Must pass 'undefined' to avoid emitting decorator metadata.
                        decoratorsToKeep.length ? decoratorsToKeep : undefined, param.modifiers, param.dotDotDotToken, param.name, param.questionToken, param.type, param.initializer);
                        newParameters.push(newParam);
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (oldParameters_1_1 && !oldParameters_1_1.done && (_a = oldParameters_1.return)) _a.call(oldParameters_1);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                var updated = ts.updateConstructor(ctor, ctor.decorators, ctor.modifiers, newParameters, ts.visitFunctionBody(ctor.body, visitor, context));
                return [updated, parametersInfo];
            }
            /**
             * Transforms a single class declaration:
             * - dispatches to strip decorators on members
             * - converts decorators on the class to annotations
             * - creates a ctorParameters property
             * - creates a propDecorators property
             */
            function transformClassDeclaration(classDecl) {
                var e_10, _a, e_11, _b;
                classDecl = ts.getMutableClone(classDecl);
                var newMembers = [];
                var decoratedProperties = new Map();
                var classParameters = null;
                try {
                    for (var _c = __values(classDecl.members), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var member = _d.value;
                        switch (member.kind) {
                            case ts.SyntaxKind.PropertyDeclaration:
                            case ts.SyntaxKind.GetAccessor:
                            case ts.SyntaxKind.SetAccessor:
                            case ts.SyntaxKind.MethodDeclaration: {
                                var _e = __read(transformClassElement(member), 3), name_2 = _e[0], newMember = _e[1], decorators_3 = _e[2];
                                newMembers.push(newMember);
                                if (name_2)
                                    decoratedProperties.set(name_2, decorators_3);
                                continue;
                            }
                            case ts.SyntaxKind.Constructor: {
                                var ctor = member;
                                if (!ctor.body)
                                    break;
                                var _f = __read(transformConstructor(member), 2), newMember = _f[0], parametersInfo = _f[1];
                                classParameters = parametersInfo;
                                newMembers.push(newMember);
                                continue;
                            }
                            default:
                                break;
                        }
                        newMembers.push(ts.visitEachChild(member, visitor, context));
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
                var decorators = classDecl.decorators || [];
                var decoratorsToLower = [];
                var decoratorsToKeep = [];
                try {
                    for (var decorators_2 = __values(decorators), decorators_2_1 = decorators_2.next(); !decorators_2_1.done; decorators_2_1 = decorators_2.next()) {
                        var decorator = decorators_2_1.value;
                        if (shouldLower(decorator, typeChecker)) {
                            decoratorsToLower.push(extractMetadataFromSingleDecorator(decorator, diagnostics));
                        }
                        else {
                            decoratorsToKeep.push(decorator);
                        }
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (decorators_2_1 && !decorators_2_1.done && (_b = decorators_2.return)) _b.call(decorators_2);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
                var newClassDeclaration = ts.getMutableClone(classDecl);
                if (decoratorsToLower.length) {
                    newMembers.push(createDecoratorClassProperty(decoratorsToLower));
                }
                if (classParameters) {
                    if ((decoratorsToLower.length) || classParameters.some(function (p) { return !!p.decorators.length; })) {
                        // emit ctorParameters if the class was decoratored at all, or if any of its ctors
                        // were classParameters
                        newMembers.push(createCtorParametersClassProperty(diagnostics, entityNameToExpression, classParameters));
                    }
                }
                if (decoratedProperties.size) {
                    newMembers.push(createPropDecoratorsClassProperty(diagnostics, decoratedProperties));
                }
                newClassDeclaration.members = ts.setTextRange(ts.createNodeArray(newMembers, newClassDeclaration.members.hasTrailingComma), classDecl.members);
                newClassDeclaration.decorators =
                    decoratorsToKeep.length ? ts.createNodeArray(decoratorsToKeep) : undefined;
                return newClassDeclaration;
            }
            function visitor(node) {
                var e_12, _a;
                switch (node.kind) {
                    case ts.SyntaxKind.SourceFile: {
                        importNamesBySymbol = new Map();
                        return ts.visitEachChild(node, visitor, context);
                    }
                    case ts.SyntaxKind.ImportDeclaration: {
                        var impDecl = node;
                        if (impDecl.importClause) {
                            var importClause = impDecl.importClause;
                            var names = [];
                            if (importClause.name) {
                                names.push(importClause.name);
                            }
                            if (importClause.namedBindings &&
                                importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
                                var namedImports = importClause.namedBindings;
                                names.push.apply(names, __spread(namedImports.elements.map(function (e) { return e.name; })));
                            }
                            try {
                                for (var names_1 = __values(names), names_1_1 = names_1.next(); !names_1_1.done; names_1_1 = names_1.next()) {
                                    var name_3 = names_1_1.value;
                                    var sym = typeChecker.getSymbolAtLocation(name_3);
                                    importNamesBySymbol.set(sym, name_3);
                                }
                            }
                            catch (e_12_1) { e_12 = { error: e_12_1 }; }
                            finally {
                                try {
                                    if (names_1_1 && !names_1_1.done && (_a = names_1.return)) _a.call(names_1);
                                }
                                finally { if (e_12) throw e_12.error; }
                            }
                        }
                        return ts.visitEachChild(node, visitor, context);
                    }
                    case ts.SyntaxKind.ClassDeclaration: {
                        return transformClassDeclaration(node);
                    }
                    default:
                        return transformer_util_1.visitEachChild(node, visitor, context);
                }
            }
            return function (sf) { return visitor(sf); };
        };
    }
    exports.decoratorDownlevelTransformer = decoratorDownlevelTransformer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9yX2Rvd25sZXZlbF90cmFuc2Zvcm1lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kZWNvcmF0b3JfZG93bmxldmVsX3RyYW5zZm9ybWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBeUJILHFEQUFzRDtJQUN0RCxpRUFBa0Q7SUFDbEQsMkNBQW1DO0lBRW5DOzs7OztPQUtHO0lBQ0gscUJBQTRCLFNBQXVCLEVBQUUsV0FBMkI7OztZQUM5RSxLQUFnQixJQUFBLEtBQUEsU0FBQSxxQ0FBd0IsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQTdELElBQU0sQ0FBQyxXQUFBO2dCQUNWLG9CQUFvQjtnQkFDcEIsNkVBQTZFO2dCQUM3RSxxREFBcUQ7Z0JBQ3JELGtEQUFrRDtnQkFDbEQsdURBQXVEO2dCQUN2RCxJQUFJLFdBQVcsR0FBWSxDQUFDLENBQUM7Z0JBQzdCLGlFQUFpRTtnQkFDakUsb0JBQW9CO2dCQUNwQixJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDMUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNO3dCQUFFLFNBQVM7b0JBQ2xDLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO2lCQUNsQztnQkFDRCxzRUFBc0U7Z0JBQ3RFLDZEQUE2RDtnQkFDN0QsbURBQW1EO2dCQUNuRCxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRTtvQkFDOUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNO3dCQUFFLFNBQVM7b0JBQ2xDLFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO2lCQUNsQztnQkFDRCxJQUFNLEtBQUssR0FBRyxFQUFFLENB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QUNsRSxJQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsYUFBZ0MsQ0FBQztnQ0FDbkUsS0FBSyxDQUFDLElBQUksT0FBVixLQUFLLFdBQVMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxHQUFFOzZCQUN2RDs7Z0NBQ0QsS0FBbUIsSUFBQSxVQUFBLFNBQUEsS0FBSyxDQUFBLDRCQUFBLCtDQUFFO29DQUFyQixJQUFNLE1BQUksa0JBQUE7b0NBQ2IsSUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLE1BQUksQ0FBRSxDQUFDO29DQUNuRCxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQUksQ0FBQyxDQUFDO2lDQUNwQzs7Ozs7Ozs7O3lCQUNGO3dCQUNELE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3FCQUNsRDtvQkFDRCxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDbkMsT0FBTyx5QkFBeUIsQ0FBQyxJQUEyQixDQUFDLENBQUM7cUJBQy9EO29CQUNEO3dCQUNFLE9BQU8saUNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUNqRDtZQUNILENBQUM7WUFFRCxPQUFPLFVBQUMsRUFBaUIsSUFBSyxPQUFBLE9BQU8sQ0FBQyxFQUFFLENBQWtCLEVBQTVCLENBQTRCLENBQUM7UUFDN0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQTdQRCxzRUE2UEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBEZWNvcmF0b3IgZG93bmxldmVsaW5nIHN1cHBvcnQuIHRzaWNrbGUgY2FuIG9wdGlvbmFsbHkgY29udmVydCBkZWNvcmF0b3IgY2FsbHNcbiAqIGludG8gYW5ub3RhdGlvbnMuIEZvciBleGFtcGxlLCBhIGRlY29yYXRvciBhcHBsaWNhdGlvbiBvbiBhIG1ldGhvZDpcbiAqICAgY2xhc3MgWCB7XG4gKiAgICAgQEZvbygxLCAyKVxuICogICAgIGJhcigpIHsgLi4uIH1cbiAqICAgfVxuICogV2lsbCBnZXQgY29udmVydGVkIHRvOlxuICogICBjbGFzcyBYIHtcbiAqICAgICBiYXIoKSB7IC4uLiB9XG4gKiAgICAgc3RhdGljIHByb3BEZWNvcmF0b3JzID0ge1xuICogICAgICAgYmFyOiB7dHlwZTogRm9vLCBhcmdzOiBbMSwgMl19XG4gKiAgICAgfVxuICogICB9XG4gKiBTaW1pbGFybHkgZm9yIGRlY29yYXRvcnMgb24gdGhlIGNsYXNzIChwcm9wZXJ0eSAnZGVjb3JhdG9ycycpIGFuZCBkZWNvcmF0b3JzIG9uIHRoZSBjb25zdHJ1Y3RvclxuICogKHByb3BlcnR5ICdjdG9yUGFyYW1ldGVycycsIGluY2x1ZGluZyB0aGUgdHlwZXMgb2YgYWxsIGFyZ3VtZW50cyBvZiB0aGUgY29uc3RydWN0b3IpLlxuICpcbiAqIFRoaXMgaXMgdXNlZCBieSwgYW1vbmcgb3RoZXIgc29mdHdhcmUsIEFuZ3VsYXIgaW4gaXRzIFwibm9uLUFvVFwiIG1vZGUgdG8gaW5zcGVjdCBkZWNvcmF0b3JcbiAqIGludm9jYXRpb25zLlxuICovXG5cbmltcG9ydCB7Y3JlYXRlQXJyb3dGdW5jdGlvbiwgaXNRdWFsaWZpZWROYW1lLCBpc1R5cGVSZWZlcmVuY2VOb2RlfSBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXREZWNvcmF0b3JEZWNsYXJhdGlvbnN9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5pbXBvcnQge3Zpc2l0RWFjaENoaWxkfSBmcm9tICcuL3RyYW5zZm9ybWVyX3V0aWwnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGRlY29yYXRvciBzaG91bGQgYmUgZG93bmxldmVsZWQuXG4gKlxuICogRGVjb3JhdG9ycyB0aGF0IGhhdmUgSlNEb2Mgb24gdGhlbSBpbmNsdWRpbmcgdGhlIGBAQW5ub3RhdGlvbmAgdGFnIGFyZSBkb3dubGV2ZWxlZCBhbmQgY29udmVydGVkXG4gKiBpbnRvIHByb3BlcnRpZXMgb24gdGhlIGNsYXNzIGJ5IHRoaXMgcGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZExvd2VyKGRlY29yYXRvcjogdHMuRGVjb3JhdG9yLCB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpIHtcbiAgZm9yIChjb25zdCBkIG9mIGdldERlY29yYXRvckRlY2xhcmF0aW9ucyhkZWNvcmF0b3IsIHR5cGVDaGVja2VyKSkge1xuICAgIC8vIFRPRE8obHVjYXNzbG9hbik6XG4gICAgLy8gU3dpdGNoIHRvIHRoZSBUUyBKU0RvYyBwYXJzZXIgaW4gdGhlIGZ1dHVyZSB0byBhdm9pZCBmYWxzZSBwb3NpdGl2ZXMgaGVyZS5cbiAgICAvLyBGb3IgZXhhbXBsZSB1c2luZyAnQEFubm90YXRpb24nIGluIGEgdHJ1ZSBjb21tZW50LlxuICAgIC8vIEhvd2V2ZXIsIGEgbmV3IFRTIEFQSSB3b3VsZCBiZSBuZWVkZWQsIHRyYWNrIGF0XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy83MzkzLlxuICAgIGxldCBjb21tZW50Tm9kZTogdHMuTm9kZSA9IGQ7XG4gICAgLy8gTm90IGhhbmRsaW5nIFByb3BlcnR5QWNjZXNzIGV4cHJlc3Npb25zIGhlcmUsIGJlY2F1c2UgdGhleSBhcmVcbiAgICAvLyBmaWx0ZXJlZCBlYXJsaWVyLlxuICAgIGlmIChjb21tZW50Tm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb24pIHtcbiAgICAgIGlmICghY29tbWVudE5vZGUucGFyZW50KSBjb250aW51ZTtcbiAgICAgIGNvbW1lbnROb2RlID0gY29tbWVudE5vZGUucGFyZW50O1xuICAgIH1cbiAgICAvLyBHbyB1cCBvbmUgbW9yZSBsZXZlbCB0byBWYXJpYWJsZURlY2xhcmF0aW9uU3RhdGVtZW50LCB3aGVyZSB1c3VhbGx5XG4gICAgLy8gdGhlIGNvbW1lbnQgbGl2ZXMuIElmIHRoZSBkZWNsYXJhdGlvbiBoYXMgYW4gJ2V4cG9ydCcsIHRoZVxuICAgIC8vIFZETGlzdC5nZXRGdWxsVGV4dCB3aWxsIG5vdCBjb250YWluIHRoZSBjb21tZW50LlxuICAgIGlmIChjb21tZW50Tm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KSB7XG4gICAgICBpZiAoIWNvbW1lbnROb2RlLnBhcmVudCkgY29udGludWU7XG4gICAgICBjb21tZW50Tm9kZSA9IGNvbW1lbnROb2RlLnBhcmVudDtcbiAgICB9XG4gICAgY29uc3QgcmFuZ2UgPSB0cy5nZXRMZWFkaW5nQ29tbWVudFJhbmdlcyhjb21tZW50Tm9kZS5nZXRGdWxsVGV4dCgpLCAwKTtcbiAgICBpZiAoIXJhbmdlKSBjb250aW51ZTtcbiAgICBmb3IgKGNvbnN0IHtwb3MsIGVuZH0gb2YgcmFuZ2UpIHtcbiAgICAgIGNvbnN0IGpzRG9jVGV4dCA9IGNvbW1lbnROb2RlLmdldEZ1bGxUZXh0KCkuc3Vic3RyaW5nKHBvcywgZW5kKTtcbiAgICAgIGlmIChqc0RvY1RleHQuaW5jbHVkZXMoJ0BBbm5vdGF0aW9uJykpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgQVNUIGZvciB0aGUgZGVjb3JhdG9yIGZpZWxkIHR5cGUgYW5ub3RhdGlvbiwgd2hpY2ggaGFzIHRoZSBmb3JtXG4gKiAgICAgeyB0eXBlOiBGdW5jdGlvbiwgYXJncz86IGFueVtdIH1bXVxuICovXG5mdW5jdGlvbiBjcmVhdGVEZWNvcmF0b3JJbnZvY2F0aW9uVHlwZSgpOiB0cy5UeXBlTm9kZSB7XG4gIGNvbnN0IHR5cGVFbGVtZW50czogdHMuVHlwZUVsZW1lbnRbXSA9IFtdO1xuICB0eXBlRWxlbWVudHMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgIHVuZGVmaW5lZCwgJ3R5cGUnLCB1bmRlZmluZWQsXG4gICAgICB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSh0cy5jcmVhdGVJZGVudGlmaWVyKCdGdW5jdGlvbicpLCB1bmRlZmluZWQpLCB1bmRlZmluZWQpKTtcbiAgdHlwZUVsZW1lbnRzLnB1c2godHMuY3JlYXRlUHJvcGVydHlTaWduYXR1cmUoXG4gICAgICB1bmRlZmluZWQsICdhcmdzJywgdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5RdWVzdGlvblRva2VuKSxcbiAgICAgIHRzLmNyZWF0ZUFycmF5VHlwZU5vZGUodHMuY3JlYXRlS2V5d29yZFR5cGVOb2RlKHRzLlN5bnRheEtpbmQuQW55S2V5d29yZCkpLCB1bmRlZmluZWQpKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZUFycmF5VHlwZU5vZGUodHMuY3JlYXRlVHlwZUxpdGVyYWxOb2RlKHR5cGVFbGVtZW50cykpO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSB0eXBlIG9mIHRoZSBkZWNvcmF0b3IgKHRoZSBmdW5jdGlvbiBvciBleHByZXNzaW9uIGludm9rZWQpLCBhcyB3ZWxsIGFzIGFsbCB0aGVcbiAqIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGRlY29yYXRvci4gUmV0dXJucyBhbiBBU1Qgd2l0aCB0aGUgZm9ybTpcbiAqXG4gKiAgICAgLy8gRm9yIEBkZWNvcmF0b3IoYXJnMSwgYXJnMilcbiAqICAgICB7IHR5cGU6IGRlY29yYXRvciwgYXJnczogW2FyZzEsIGFyZzJdIH1cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdE1ldGFkYXRhRnJvbVNpbmdsZURlY29yYXRvcihcbiAgICBkZWNvcmF0b3I6IHRzLkRlY29yYXRvciwgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSk6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uIHtcbiAgY29uc3QgbWV0YWRhdGFQcm9wZXJ0aWVzOiB0cy5PYmplY3RMaXRlcmFsRWxlbWVudExpa2VbXSA9IFtdO1xuICBjb25zdCBleHByID0gZGVjb3JhdG9yLmV4cHJlc3Npb247XG4gIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAvLyBUaGUgZGVjb3JhdG9yIHdhcyBhIHBsYWluIEBGb28uXG4gICAgICBtZXRhZGF0YVByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ3R5cGUnLCBleHByKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb246XG4gICAgICAvLyBUaGUgZGVjb3JhdG9yIHdhcyBhIGNhbGwsIGxpa2UgQEZvbyhiYXIpLlxuICAgICAgY29uc3QgY2FsbCA9IGV4cHIgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gICAgICBtZXRhZGF0YVByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ3R5cGUnLCBjYWxsLmV4cHJlc3Npb24pKTtcbiAgICAgIGlmIChjYWxsLmFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYXJnczogdHMuRXhwcmVzc2lvbltdID0gW107XG4gICAgICAgIGZvciAoY29uc3QgYXJnIG9mIGNhbGwuYXJndW1lbnRzKSB7XG4gICAgICAgICAgYXJncy5wdXNoKGFyZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXJnc0FycmF5TGl0ZXJhbCA9IHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChhcmdzKTtcbiAgICAgICAgYXJnc0FycmF5TGl0ZXJhbC5lbGVtZW50cy5oYXNUcmFpbGluZ0NvbW1hID0gdHJ1ZTtcbiAgICAgICAgbWV0YWRhdGFQcm9wZXJ0aWVzLnB1c2godHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCdhcmdzJywgYXJnc0FycmF5TGl0ZXJhbCkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goe1xuICAgICAgICBmaWxlOiBkZWNvcmF0b3IuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgICBzdGFydDogZGVjb3JhdG9yLmdldFN0YXJ0KCksXG4gICAgICAgIGxlbmd0aDogZGVjb3JhdG9yLmdldEVuZCgpIC0gZGVjb3JhdG9yLmdldFN0YXJ0KCksXG4gICAgICAgIG1lc3NhZ2VUZXh0OlxuICAgICAgICAgICAgYCR7dHMuU3ludGF4S2luZFtkZWNvcmF0b3Iua2luZF19IG5vdCBpbXBsZW1lbnRlZCBpbiBnYXRoZXJpbmcgZGVjb3JhdG9yIG1ldGFkYXRhYCxcbiAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgY29kZTogMCxcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRzLmNyZWF0ZU9iamVjdExpdGVyYWwobWV0YWRhdGFQcm9wZXJ0aWVzKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhIGxpc3Qgb2YgZGVjb3JhdG9yIG1ldGFkYXRhIG9iamVjdCBBU1RzIGFuZCBwcm9kdWNlcyBhbiBBU1QgZm9yIGFcbiAqIHN0YXRpYyBjbGFzcyBwcm9wZXJ0eSBvZiBhbiBhcnJheSBvZiB0aG9zZSBtZXRhZGF0YSBvYmplY3RzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVEZWNvcmF0b3JDbGFzc1Byb3BlcnR5KGRlY29yYXRvckxpc3Q6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uW10pIHtcbiAgY29uc3QgbW9kaWZpZXIgPSB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpO1xuICBjb25zdCB0eXBlID0gY3JlYXRlRGVjb3JhdG9ySW52b2NhdGlvblR5cGUoKTtcbiAgY29uc3QgaW5pdGlhbGl6ZXIgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwoZGVjb3JhdG9yTGlzdCwgdHJ1ZSk7XG4gIGluaXRpYWxpemVyLmVsZW1lbnRzLmhhc1RyYWlsaW5nQ29tbWEgPSB0cnVlO1xuICBjb25zdCBwcm9wID0gdHMuY3JlYXRlUHJvcGVydHkodW5kZWZpbmVkLCBbbW9kaWZpZXJdLCAnZGVjb3JhdG9ycycsIHVuZGVmaW5lZCwgdHlwZSwgaW5pdGlhbGl6ZXIpO1xuICAvLyBOQjogdGhlIC5kZWNvcmF0b3JzIHByb3BlcnR5IGRvZXMgbm90IGdldCBhIEBub2NvbGxhcHNlIHByb3BlcnR5LiBUaGVyZSBpc1xuICAvLyBubyBnb29kIHJlYXNvbiB3aHkgLSBpdCBtZWFucyAuZGVjb3JhdG9ycyBpcyBub3QgcnVudGltZSBhY2Nlc3NpYmxlIGlmIHlvdVxuICAvLyBjb21waWxlIHdpdGggY29sbGFwc2UgcHJvcGVydGllcywgd2hlcmVhcyBwcm9wRGVjb3JhdG9ycyBpcywgd2hpY2ggZG9lc24ndFxuICAvLyBmb2xsb3cgYW55IHN0cmluZ2VudCBsb2dpYy4gSG93ZXZlciB0aGlzIGhhcyBiZWVuIHRoZSBjYXNlIHByZXZpb3VzbHksIGFuZFxuICAvLyBhZGRpbmcgaXQgYmFjayBpbiBsZWFkcyB0byBzdWJzdGFudGlhbCBjb2RlIHNpemUgaW5jcmVhc2VzIGFzIENsb3N1cmUgZmFpbHNcbiAgLy8gdG8gdHJlZSBzaGFrZSB0aGVzZSBwcm9wcyB3aXRob3V0IEBub2NvbGxhcHNlLlxuICByZXR1cm4gcHJvcDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBBU1QgZm9yIHRoZSAnY3RvclBhcmFtZXRlcnMnIGZpZWxkIHR5cGUgYW5ub3RhdGlvbjpcbiAqICAgKCkgPT4gKHsgdHlwZTogYW55LCBkZWNvcmF0b3JzPzoge3R5cGU6IEZ1bmN0aW9uLCBhcmdzPzogYW55W119W10gfXxudWxsKVtdXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUN0b3JQYXJhbWV0ZXJzQ2xhc3NQcm9wZXJ0eVR5cGUoKTogdHMuVHlwZU5vZGUge1xuICAvLyBTb3JyeSBhYm91dCB0aGlzLiBUcnkgcmVhZGluZyBqdXN0IHRoZSBzdHJpbmcgbGl0ZXJhbHMgYmVsb3cuXG4gIGNvbnN0IHR5cGVFbGVtZW50czogdHMuVHlwZUVsZW1lbnRbXSA9IFtdO1xuICB0eXBlRWxlbWVudHMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgIHVuZGVmaW5lZCwgJ3R5cGUnLCB1bmRlZmluZWQsXG4gICAgICB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSh0cy5jcmVhdGVJZGVudGlmaWVyKCdhbnknKSwgdW5kZWZpbmVkKSwgdW5kZWZpbmVkKSk7XG4gIHR5cGVFbGVtZW50cy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlKFxuICAgICAgdW5kZWZpbmVkLCAnZGVjb3JhdG9ycycsIHRzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuUXVlc3Rpb25Ub2tlbiksXG4gICAgICB0cy5jcmVhdGVBcnJheVR5cGVOb2RlKHRzLmNyZWF0ZVR5cGVMaXRlcmFsTm9kZShbXG4gICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlKFxuICAgICAgICAgICAgdW5kZWZpbmVkLCAndHlwZScsIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKHRzLmNyZWF0ZUlkZW50aWZpZXIoJ0Z1bmN0aW9uJyksIHVuZGVmaW5lZCksIHVuZGVmaW5lZCksXG4gICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlKFxuICAgICAgICAgICAgdW5kZWZpbmVkLCAnYXJncycsIHRzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuUXVlc3Rpb25Ub2tlbiksXG4gICAgICAgICAgICB0cy5jcmVhdGVBcnJheVR5cGVOb2RlKFxuICAgICAgICAgICAgICAgIHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKHRzLmNyZWF0ZUlkZW50aWZpZXIoJ2FueScpLCB1bmRlZmluZWQpKSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCksXG4gICAgICBdKSksXG4gICAgICB1bmRlZmluZWQpKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZUZ1bmN0aW9uVHlwZU5vZGUoXG4gICAgICB1bmRlZmluZWQsIFtdLFxuICAgICAgdHMuY3JlYXRlQXJyYXlUeXBlTm9kZShcbiAgICAgICAgICB0cy5jcmVhdGVVbmlvblR5cGVOb2RlKFt0cy5jcmVhdGVUeXBlTGl0ZXJhbE5vZGUodHlwZUVsZW1lbnRzKSwgdHMuY3JlYXRlTnVsbCgpXSkpKTtcbn1cblxuLyoqXG4gKiBTZXRzIGEgQ2xvc3VyZSBcXEBub2NvbGxhcHNlIHN5bnRoZXRpYyBjb21tZW50IG9uIHRoZSBnaXZlbiBub2RlLiBUaGlzIHByZXZlbnRzIENsb3N1cmUgQ29tcGlsZXJcbiAqIGZyb20gY29sbGFwc2luZyB0aGUgYXBwYXJlbnRseSBzdGF0aWMgcHJvcGVydHksIHdoaWNoIHdvdWxkIG1ha2UgaXQgaW1wb3NzaWJsZSB0byBmaW5kIGZvciBjb2RlXG4gKiB0cnlpbmcgdG8gZGV0ZWN0IGl0IGF0IHJ1bnRpbWUuXG4gKi9cbmZ1bmN0aW9uIGFkZE5vQ29sbGFwc2VDb21tZW50KG46IHRzLk5vZGUpIHtcbiAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKG4sIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJyogQG5vY29sbGFwc2UgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzVHJhaWxpbmdOZXdMaW5lOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XSk7XG59XG5cbi8qKlxuICogY3JlYXRlQ3RvclBhcmFtZXRlcnNDbGFzc1Byb3BlcnR5IGNyZWF0ZXMgYSBzdGF0aWMgJ2N0b3JQYXJhbWV0ZXJzJyBwcm9wZXJ0eSBjb250YWluaW5nXG4gKiBkb3dubGV2ZWxlZCBkZWNvcmF0b3IgaW5mb3JtYXRpb24uXG4gKlxuICogVGhlIHByb3BlcnR5IGNvbnRhaW5zIGFuIGFycm93IGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3QgbGl0ZXJhbHMgb2YgdGhlIHNoYXBlOlxuICogICAgIHN0YXRpYyBjdG9yUGFyYW1ldGVycyA9ICgpID0+IFt7XG4gKiAgICAgICB0eXBlOiBTb21lQ2xhc3N8dW5kZWZpbmVkLCAgLy8gdGhlIHR5cGUgb2YgdGhlIHBhcmFtIHRoYXQncyBkZWNvcmF0ZWQsIGlmIGl0J3MgYSB2YWx1ZS5cbiAqICAgICAgIGRlY29yYXRvcnM6IFt7XG4gKiAgICAgICAgIHR5cGU6IERlY29yYXRvckZuLCAgLy8gdGhlIHR5cGUgb2YgdGhlIGRlY29yYXRvciB0aGF0J3MgaW52b2tlZC5cbiAqICAgICAgICAgYXJnczogW0FSR1NdLCAgICAgICAvLyB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZGVjb3JhdG9yLlxuICogICAgICAgfV1cbiAqICAgICB9XTtcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ3RvclBhcmFtZXRlcnNDbGFzc1Byb3BlcnR5KFxuICAgIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10sXG4gICAgZW50aXR5TmFtZVRvRXhwcmVzc2lvbjogKG46IHRzLkVudGl0eU5hbWUpID0+IHRzLkV4cHJlc3Npb24gfCB1bmRlZmluZWQsXG5cbiAgICBjdG9yUGFyYW1ldGVyczogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm9bXSk6IHRzLlByb3BlcnR5RGVjbGFyYXRpb24ge1xuICBjb25zdCBwYXJhbXM6IHRzLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgY3RvclBhcmFtIG9mIGN0b3JQYXJhbWV0ZXJzKSB7XG4gICAgaWYgKCFjdG9yUGFyYW0udHlwZSAmJiBjdG9yUGFyYW0uZGVjb3JhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHBhcmFtcy5wdXNoKHRzLmNyZWF0ZU51bGwoKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbVR5cGUgPSBjdG9yUGFyYW0udHlwZSA/XG4gICAgICAgIHR5cGVSZWZlcmVuY2VUb0V4cHJlc3Npb24oZW50aXR5TmFtZVRvRXhwcmVzc2lvbiwgY3RvclBhcmFtLnR5cGUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIGNvbnN0IG1lbWJlcnMgPVxuICAgICAgICBbdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCd0eXBlJywgcGFyYW1UeXBlIHx8IHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3VuZGVmaW5lZCcpKV07XG5cbiAgICBjb25zdCBkZWNvcmF0b3JzOiB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbltdID0gW107XG4gICAgZm9yIChjb25zdCBkZWNvIG9mIGN0b3JQYXJhbS5kZWNvcmF0b3JzKSB7XG4gICAgICBkZWNvcmF0b3JzLnB1c2goZXh0cmFjdE1ldGFkYXRhRnJvbVNpbmdsZURlY29yYXRvcihkZWNvLCBkaWFnbm9zdGljcykpO1xuICAgIH1cbiAgICBpZiAoZGVjb3JhdG9ycy5sZW5ndGgpIHtcbiAgICAgIG1lbWJlcnMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ2RlY29yYXRvcnMnLCB0cy5jcmVhdGVBcnJheUxpdGVyYWwoZGVjb3JhdG9ycykpKTtcbiAgICB9XG4gICAgcGFyYW1zLnB1c2godHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChtZW1iZXJzKSk7XG4gIH1cblxuICBjb25zdCBpbml0aWFsaXplciA9IHRzLmNyZWF0ZUFycm93RnVuY3Rpb24oXG4gICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgW10sIHVuZGVmaW5lZCwgdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5FcXVhbHNHcmVhdGVyVGhhblRva2VuKSxcbiAgICAgIHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChwYXJhbXMsIHRydWUpKTtcbiAgY29uc3QgdHlwZSA9IGNyZWF0ZUN0b3JQYXJhbWV0ZXJzQ2xhc3NQcm9wZXJ0eVR5cGUoKTtcbiAgY29uc3QgY3RvclByb3AgPSB0cy5jcmVhdGVQcm9wZXJ0eShcbiAgICAgIHVuZGVmaW5lZCwgW3RzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZCldLCAnY3RvclBhcmFtZXRlcnMnLCB1bmRlZmluZWQsIHR5cGUsXG4gICAgICBpbml0aWFsaXplcik7XG4gIGFkZE5vQ29sbGFwc2VDb21tZW50KGN0b3JQcm9wKTtcbiAgcmV0dXJuIGN0b3JQcm9wO1xufVxuXG4vKipcbiAqIGNyZWF0ZVByb3BEZWNvcmF0b3JzQ2xhc3NQcm9wZXJ0eSBjcmVhdGVzIGEgc3RhdGljICdwcm9wRGVjb3JhdG9ycycgcHJvcGVydHkgY29udGFpbmluZyB0eXBlXG4gKiBpbmZvcm1hdGlvbiBmb3IgZXZlcnkgcHJvcGVydHkgdGhhdCBoYXMgYSBkZWNvcmF0b3IgYXBwbGllZC5cbiAqXG4gKiAgICAgc3RhdGljIHByb3BEZWNvcmF0b3JzOiB7W2tleTogc3RyaW5nXToge3R5cGU6IEZ1bmN0aW9uLCBhcmdzPzogYW55W119W119ID0ge1xuICogICAgICAgcHJvcEE6IFt7dHlwZTogTXlEZWNvcmF0b3IsIGFyZ3M6IFsxLCAyXX0sIC4uLl0sXG4gKiAgICAgICAuLi5cbiAqICAgICB9O1xuICovXG5mdW5jdGlvbiBjcmVhdGVQcm9wRGVjb3JhdG9yc0NsYXNzUHJvcGVydHkoXG4gICAgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSwgcHJvcGVydGllczogTWFwPHN0cmluZywgdHMuRGVjb3JhdG9yW10+KTogdHMuUHJvcGVydHlEZWNsYXJhdGlvbiB7XG4gIC8vICBgc3RhdGljIHByb3BEZWNvcmF0b3JzOiB7W2tleTogc3RyaW5nXTogYCArIHt0eXBlOiBGdW5jdGlvbiwgYXJncz86IGFueVtdfVtdICsgYH0gPSB7XFxuYCk7XG4gIGNvbnN0IGVudHJpZXM6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZVtdID0gW107XG4gIGZvciAoY29uc3QgW25hbWUsIGRlY29yYXRvcnNdIG9mIHByb3BlcnRpZXMuZW50cmllcygpKSB7XG4gICAgZW50cmllcy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudChcbiAgICAgICAgbmFtZSxcbiAgICAgICAgdHMuY3JlYXRlQXJyYXlMaXRlcmFsKFxuICAgICAgICAgICAgZGVjb3JhdG9ycy5tYXAoZGVjbyA9PiBleHRyYWN0TWV0YWRhdGFGcm9tU2luZ2xlRGVjb3JhdG9yKGRlY28sIGRpYWdub3N0aWNzKSkpKSk7XG4gIH1cbiAgY29uc3QgaW5pdGlhbGl6ZXIgPSB0cy5jcmVhdGVPYmplY3RMaXRlcmFsKGVudHJpZXMsIHRydWUpO1xuICBjb25zdCB0eXBlID0gdHMuY3JlYXRlVHlwZUxpdGVyYWxOb2RlKFt0cy5jcmVhdGVJbmRleFNpZ25hdHVyZShcbiAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBbdHMuY3JlYXRlUGFyYW1ldGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCAna2V5JywgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSgnc3RyaW5nJywgdW5kZWZpbmVkKSwgdW5kZWZpbmVkKV0sXG4gICAgICBjcmVhdGVEZWNvcmF0b3JJbnZvY2F0aW9uVHlwZSgpKV0pO1xuICByZXR1cm4gdHMuY3JlYXRlUHJvcGVydHkoXG4gICAgICB1bmRlZmluZWQsIFt0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpXSwgJ3Byb3BEZWNvcmF0b3JzJywgdW5kZWZpbmVkLCB0eXBlLFxuICAgICAgaW5pdGlhbGl6ZXIpO1xufVxuXG5mdW5jdGlvbiBpc05hbWVFcXVhbChjbGFzc01lbWJlcjogdHMuQ2xhc3NFbGVtZW50LCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKGNsYXNzTWVtYmVyLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBpZCA9IGNsYXNzTWVtYmVyLm5hbWUgYXMgdHMuSWRlbnRpZmllcjtcbiAgcmV0dXJuIGlkLnRleHQgPT09IG5hbWU7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgKHBvdGVudGlhbGx5KSB2YWx1ZSBwYXJ0IGZvciB0aGUgZ2l2ZW4gbm9kZS5cbiAqXG4gKiBUaGlzIGlzIGEgcGFydGlhbCByZS1pbXBsZW1lbnRhdGlvbiBvZiBUeXBlU2NyaXB0J3Mgc2VyaWFsaXplVHlwZVJlZmVyZW5jZU5vZGUuIFRoaXMgaXMgYVxuICogd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzUxNiAoc2VyaWFsaXplVHlwZVJlZmVyZW5jZU5vZGVcbiAqIG5vdCBiZWluZyBleHBvc2VkKS4gSW4gcHJhY3RpY2UgdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBzdWZmaWNpZW50IGZvciBBbmd1bGFyJ3MgdXNlIG9mIHR5cGVcbiAqIG1ldGFkYXRhLlxuICovXG5mdW5jdGlvbiB0eXBlUmVmZXJlbmNlVG9FeHByZXNzaW9uKFxuICAgIGVudGl0eU5hbWVUb0V4cHJlc3Npb246IChuOiB0cy5FbnRpdHlOYW1lKSA9PiB0cy5FeHByZXNzaW9uIHwgdW5kZWZpbmVkLFxuICAgIG5vZGU6IHRzLlR5cGVOb2RlKTogdHMuRXhwcmVzc2lvbnx1bmRlZmluZWQge1xuICBsZXQga2luZCA9IG5vZGUua2luZDtcbiAgaWYgKHRzLmlzTGl0ZXJhbFR5cGVOb2RlKG5vZGUpKSB7XG4gICAgLy8gVHJlYXQgbGl0ZXJhbCB0eXBlcyBsaWtlIHRoZWlyIGJhc2UgdHlwZSAoYm9vbGVhbiwgc3RyaW5nLCBudW1iZXIpLlxuICAgIGtpbmQgPSBub2RlLmxpdGVyYWwua2luZDtcbiAgfVxuICBzd2l0Y2ggKGtpbmQpIHtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnVuY3Rpb25UeXBlOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db25zdHJ1Y3RvclR5cGU6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignRnVuY3Rpb24nKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlUeXBlOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5UdXBsZVR5cGU6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignQXJyYXknKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZVByZWRpY2F0ZTpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQ6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQm9vbGVhbktleXdvcmQ6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignQm9vbGVhbicpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdLZXl3b3JkOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ1N0cmluZycpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5PYmplY3RLZXl3b3JkOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ09iamVjdCcpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5OdW1iZXJLZXl3b3JkOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5OdW1lcmljTGl0ZXJhbDpcbiAgICAgIHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKCdOdW1iZXInKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZVJlZmVyZW5jZTpcbiAgICAgIGNvbnN0IHR5cGVSZWYgPSBub2RlIGFzIHRzLlR5cGVSZWZlcmVuY2VOb2RlO1xuICAgICAgLy8gSWdub3JlIGFueSBnZW5lcmljIHR5cGVzLCBqdXN0IHJldHVybiB0aGUgYmFzZSB0eXBlLlxuICAgICAgcmV0dXJuIGVudGl0eU5hbWVUb0V4cHJlc3Npb24odHlwZVJlZi50eXBlTmFtZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqIFBhcmFtZXRlckRlY29yYXRpb25JbmZvIGRlc2NyaWJlcyB0aGUgaW5mb3JtYXRpb24gZm9yIGEgc2luZ2xlIGNvbnN0cnVjdG9yIHBhcmFtZXRlci4gKi9cbmludGVyZmFjZSBQYXJhbWV0ZXJEZWNvcmF0aW9uSW5mbyB7XG4gIC8qKlxuICAgKiBUaGUgdHlwZSBkZWNsYXJhdGlvbiBmb3IgdGhlIHBhcmFtZXRlci4gT25seSBzZXQgaWYgdGhlIHR5cGUgaXMgYSB2YWx1ZSAoZS5nLiBhIGNsYXNzLCBub3QgYW5cbiAgICogaW50ZXJmYWNlKS5cbiAgICovXG4gIHR5cGU6IHRzLlR5cGVOb2RlfG51bGw7XG4gIC8qKiBUaGUgbGlzdCBvZiBkZWNvcmF0b3JzIGZvdW5kIG9uIHRoZSBwYXJhbWV0ZXIsIG51bGwgaWYgbm9uZS4gKi9cbiAgZGVjb3JhdG9yczogdHMuRGVjb3JhdG9yW107XG59XG5cbi8qKlxuICogVHJhbnNmb3JtZXIgZmFjdG9yeSBmb3IgdGhlIGRlY29yYXRvciBkb3dubGV2ZWwgdHJhbnNmb3JtZXIuIFNlZSBmaWxlb3ZlcnZpZXcgZm9yIGRldGFpbHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0b3JEb3dubGV2ZWxUcmFuc2Zvcm1lcihcbiAgICB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10pOlxuICAgIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHtcbiAgICAvKiogQSBtYXAgZnJvbSBzeW1ib2xzIHRvIHRoZSBpZGVudGlmaWVyIG9mIGFuIGltcG9ydCwgcmVzZXQgcGVyIFNvdXJjZUZpbGUuICovXG4gICAgbGV0IGltcG9ydE5hbWVzQnlTeW1ib2wgPSBuZXcgTWFwPHRzLlN5bWJvbCwgdHMuSWRlbnRpZmllcj4oKTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGFuIEVudGl0eU5hbWUgKGZyb20gYSB0eXBlIGFubm90YXRpb24pIHRvIGFuIGV4cHJlc3Npb24gKGFjY2Vzc2luZyBhIHZhbHVlKS5cbiAgICAgKlxuICAgICAqIEZvciBhIGdpdmVuIHRzLkVudGl0eU5hbWUsIHRoaXMgd2Fsa3MgZGVwdGggZmlyc3QgdG8gZmluZCB0aGUgbGVmdG1vc3QgdHMuSWRlbnRpZmllciwgdGhlblxuICAgICAqIGNvbnZlcnRzIHRoZSBwYXRoIGludG8gcHJvcGVydHkgYWNjZXNzZXMuXG4gICAgICpcbiAgICAgKiBUaGlzIGdlbmVyYWxseSB3b3JrcywgYnV0IFR5cGVTY3JpcHQncyBlbWl0IHBpcGVsaW5lIGRvZXMgbm90IHNlcmlhbGl6ZSBpZGVudGlmaWVycyB0aGF0IGFyZVxuICAgICAqIG9ubHkgdXNlZCBpbiBhIHR5cGUgbG9jYXRpb24gKHN1Y2ggYXMgaWRlbnRpZmllcnMgaW4gYSBUeXBlTm9kZSksIGV2ZW4gaWYgdGhlIGlkZW50aWZpZXJcbiAgICAgKiBpdHNlbGYgcG9pbnRzIHRvIGEgdmFsdWUgKGUuZy4gYSBjbGFzcykuIFRvIGF2b2lkIHRoYXQgcHJvYmxlbSwgdGhpcyBtZXRob2QgZmluZHMgdGhlIHN5bWJvbFxuICAgICAqIHJlcHJlc2VudGluZyB0aGUgaWRlbnRpZmllciAodXNpbmcgdHlwZUNoZWNrZXIpLCB0aGVuIGxvb2tzIHVwIHdoZXJlIGl0IHdhcyBpbXBvcnRlZCAodXNpbmdcbiAgICAgKiBpbXBvcnROYW1lc0J5U3ltYm9sKSwgYW5kIHRoZW4gdXNlcyB0aGUgaW1wb3J0ZWQgbmFtZSBpbnN0ZWFkIG9mIHRoZSBpZGVudGlmaWVyIGZyb20gdGhlIHR5cGVcbiAgICAgKiBleHByZXNzaW9uLCBpZiBhbnkuIE90aGVyd2lzZSBpdCdsbCB1c2UgdGhlIGlkZW50aWZpZXIgdW5jaGFuZ2VkLiBUaGlzIG1ha2VzIHN1cmUgdGhlXG4gICAgICogaWRlbnRpZmllciBpcyBub3QgbWFya2VkIGFzIHN0ZW1taW5nIGZyb20gYSBcInR5cGUgb25seVwiIGV4cHJlc3Npb24sIGNhdXNpbmcgaXQgdG8gYmUgZW1pdHRlZFxuICAgICAqIGFuZCBjYXVzaW5nIHRoZSBpbXBvcnQgdG8gYmUgcmV0YWluZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZW50aXR5TmFtZVRvRXhwcmVzc2lvbihuYW1lOiB0cy5FbnRpdHlOYW1lKTogdHMuRXhwcmVzc2lvbnx1bmRlZmluZWQge1xuICAgICAgY29uc3Qgc3ltID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihuYW1lKTtcbiAgICAgIGlmICghc3ltKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGVudGl0eSBuYW1lIHJlZmVyZW5jZXMgYSBzeW1ib2wgdGhhdCBpcyBhbiBhY3R1YWwgdmFsdWUuIElmIGl0IGlzIG5vdCwgaXRcbiAgICAgIC8vIGNhbm5vdCBiZSByZWZlcmVuY2VkIGJ5IGFuIGV4cHJlc3Npb24sIHNvIHJldHVybiB1bmRlZmluZWQuXG4gICAgICBsZXQgc3ltVG9DaGVjayA9IHN5bTtcbiAgICAgIGlmIChzeW1Ub0NoZWNrLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuQWxpYXMpIHtcbiAgICAgICAgc3ltVG9DaGVjayA9IHR5cGVDaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltVG9DaGVjayk7XG4gICAgICB9XG4gICAgICBpZiAoIShzeW1Ub0NoZWNrLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuVmFsdWUpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAodHMuaXNJZGVudGlmaWVyKG5hbWUpKSB7XG4gICAgICAgIC8vIElmIHRoZXJlJ3MgYSBrbm93biBpbXBvcnQgbmFtZSBmb3IgdGhpcyBzeW1ib2wsIHVzZSBpdCBzbyB0aGF0IHRoZSBpbXBvcnQgd2lsbCBiZVxuICAgICAgICAvLyByZXRhaW5lZCBhbmQgdGhlIHZhbHVlIGNhbiBiZSByZWZlcmVuY2VkLlxuICAgICAgICBpZiAoaW1wb3J0TmFtZXNCeVN5bWJvbC5oYXMoc3ltKSkgcmV0dXJuIGltcG9ydE5hbWVzQnlTeW1ib2wuZ2V0KHN5bSkhO1xuICAgICAgICAvLyBPdGhlcndpc2UgdGhpcyB3aWxsIGJlIGEgbG9jYWxseSBkZWNsYXJlZCBuYW1lLCBqdXN0IHJldHVybiB0aGF0LlxuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlZiA9IGVudGl0eU5hbWVUb0V4cHJlc3Npb24obmFtZS5sZWZ0KTtcbiAgICAgIGlmICghcmVmKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHJlZiwgbmFtZS5yaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtcyBhIGNsYXNzIGVsZW1lbnQuIFJldHVybnMgYSB0aHJlZSB0dXBsZSBvZiBuYW1lLCB0cmFuc2Zvcm1lZCBlbGVtZW50LCBhbmRcbiAgICAgKiBkZWNvcmF0b3JzIGZvdW5kLiBSZXR1cm5zIGFuIHVuZGVmaW5lZCBuYW1lIGlmIHRoZXJlIGFyZSBubyBkZWNvcmF0b3JzIHRvIGxvd2VyIG9uIHRoZVxuICAgICAqIGVsZW1lbnQsIG9yIHRoZSBlbGVtZW50IGhhcyBhbiBleG90aWMgbmFtZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1DbGFzc0VsZW1lbnQoZWxlbWVudDogdHMuQ2xhc3NFbGVtZW50KTpcbiAgICAgICAgW3N0cmluZ3x1bmRlZmluZWQsIHRzLkNsYXNzRWxlbWVudCwgdHMuRGVjb3JhdG9yW11dIHtcbiAgICAgIGVsZW1lbnQgPSB0cy52aXNpdEVhY2hDaGlsZChlbGVtZW50LCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgIGNvbnN0IGRlY29yYXRvcnNUb0tlZXA6IHRzLkRlY29yYXRvcltdID0gW107XG4gICAgICBjb25zdCB0b0xvd2VyOiB0cy5EZWNvcmF0b3JbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgZWxlbWVudC5kZWNvcmF0b3JzIHx8IFtdKSB7XG4gICAgICAgIGlmICghc2hvdWxkTG93ZXIoZGVjb3JhdG9yLCB0eXBlQ2hlY2tlcikpIHtcbiAgICAgICAgICBkZWNvcmF0b3JzVG9LZWVwLnB1c2goZGVjb3JhdG9yKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0b0xvd2VyLnB1c2goZGVjb3JhdG9yKTtcbiAgICAgIH1cbiAgICAgIGlmICghdG9Mb3dlci5sZW5ndGgpIHJldHVybiBbdW5kZWZpbmVkLCBlbGVtZW50LCBbXV07XG5cbiAgICAgIGlmICghZWxlbWVudC5uYW1lIHx8IGVsZW1lbnQubmFtZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgLy8gTWV0aG9kIGhhcyBhIHdlaXJkIG5hbWUsIGUuZy5cbiAgICAgICAgLy8gICBbU3ltYm9sLmZvb10oKSB7Li4ufVxuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKHtcbiAgICAgICAgICBmaWxlOiBlbGVtZW50LmdldFNvdXJjZUZpbGUoKSxcbiAgICAgICAgICBzdGFydDogZWxlbWVudC5nZXRTdGFydCgpLFxuICAgICAgICAgIGxlbmd0aDogZWxlbWVudC5nZXRFbmQoKSAtIGVsZW1lbnQuZ2V0U3RhcnQoKSxcbiAgICAgICAgICBtZXNzYWdlVGV4dDogYGNhbm5vdCBwcm9jZXNzIGRlY29yYXRvcnMgb24gc3RyYW5nZWx5IG5hbWVkIG1ldGhvZGAsXG4gICAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgICBjb2RlOiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWQsIGVsZW1lbnQsIFtdXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmFtZSA9IChlbGVtZW50Lm5hbWUgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICAgIGNvbnN0IG11dGFibGUgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoZWxlbWVudCk7XG4gICAgICBtdXRhYmxlLmRlY29yYXRvcnMgPSBkZWNvcmF0b3JzVG9LZWVwLmxlbmd0aCA/XG4gICAgICAgICAgdHMuc2V0VGV4dFJhbmdlKHRzLmNyZWF0ZU5vZGVBcnJheShkZWNvcmF0b3JzVG9LZWVwKSwgbXV0YWJsZS5kZWNvcmF0b3JzKSA6XG4gICAgICAgICAgdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIFtuYW1lLCBtdXRhYmxlLCB0b0xvd2VyXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1zIGEgY29uc3RydWN0b3IuIFJldHVybnMgdGhlIHRyYW5zZm9ybWVkIGNvbnN0cnVjdG9yIGFuZCB0aGUgbGlzdCBvZiBwYXJhbWV0ZXJcbiAgICAgKiBpbmZvcm1hdGlvbiBjb2xsZWN0ZWQsIGNvbnNpc3Rpbmcgb2YgZGVjb3JhdG9ycyBhbmQgb3B0aW9uYWwgdHlwZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1Db25zdHJ1Y3RvcihjdG9yOiB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTpcbiAgICAgICAgW3RzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb24sIFBhcmFtZXRlckRlY29yYXRpb25JbmZvW11dIHtcbiAgICAgIGN0b3IgPSB0cy52aXNpdEVhY2hDaGlsZChjdG9yLCB2aXNpdG9yLCBjb250ZXh0KTtcblxuICAgICAgY29uc3QgbmV3UGFyYW1ldGVyczogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb25bXSA9IFtdO1xuICAgICAgY29uc3Qgb2xkUGFyYW1ldGVycyA9IHRzLnZpc2l0UGFyYW1ldGVyTGlzdChjdG9yLnBhcmFtZXRlcnMsIHZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgY29uc3QgcGFyYW1ldGVyc0luZm86IFBhcmFtZXRlckRlY29yYXRpb25JbmZvW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgcGFyYW0gb2Ygb2xkUGFyYW1ldGVycykge1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzVG9LZWVwOiB0cy5EZWNvcmF0b3JbXSA9IFtdO1xuICAgICAgICBjb25zdCBwYXJhbUluZm86IFBhcmFtZXRlckRlY29yYXRpb25JbmZvID0ge2RlY29yYXRvcnM6IFtdLCB0eXBlOiBudWxsfTtcblxuICAgICAgICBmb3IgKGNvbnN0IGRlY29yYXRvciBvZiBwYXJhbS5kZWNvcmF0b3JzIHx8IFtdKSB7XG4gICAgICAgICAgaWYgKCFzaG91bGRMb3dlcihkZWNvcmF0b3IsIHR5cGVDaGVja2VyKSkge1xuICAgICAgICAgICAgZGVjb3JhdG9yc1RvS2VlcC5wdXNoKGRlY29yYXRvcik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyYW1JbmZvIS5kZWNvcmF0b3JzLnB1c2goZGVjb3JhdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW0udHlwZSkge1xuICAgICAgICAgIHBhcmFtSW5mbyEudHlwZSA9IHBhcmFtLnR5cGU7XG4gICAgICAgICAgLy8gcGFyYW0gaGFzIGEgdHlwZSBwcm92aWRlZCwgZS5nLiBcImZvbzogQmFyXCIuXG4gICAgICAgICAgLy8gVGhlIHR5cGUgd2lsbCBiZSBlbWl0dGVkIGFzIGEgdmFsdWUgZXhwcmVzc2lvbiBsYXRlciBvbiwgc28gdmVyaWZ5IHRoYXQgXCJCYXJcIiBpcyBhXG4gICAgICAgICAgLy8gdmFsdWUgKGUuZy4gYSBjb25zdHJ1Y3RvcikgYW5kIG5vdCBqdXN0IGEgdHlwZS5cbiAgICAgICAgICAvLyBsZXQgc3ltID0gdHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24ocGFyYW0udHlwZSkuZ2V0U3ltYm9sKCk7XG4gICAgICAgICAgLy8gaWYgKHN5bSkge1xuICAgICAgICAgIC8vICAgLy8gU3ltYm9sIG1pZ2h0IGJlIGFuIGFsaWFzIGZvciBhIG5vbi12YWx1ZSBzeW1ib2wsIGluIHdoaWNoIGNhc2Ugd2UgY2Fubm90IHJlaWZ5IGl0XG4gICAgICAgICAgLy8gICAvLyBsYXRlciBhbmQgZW1pdCBhbiBhcHByb3ByaWF0ZSBleHByZXNzaW9uLiBOb3RlOiB0aGUgY29kZSBoZXJlIGhhbmRsZXMgYSBwYXJhbWV0ZXJcbiAgICAgICAgICAvLyAgIC8vIHdob3NlIHR5cGUgaXMgbm90IGEgdmFsdWUgKGFuZCBwb3RlbnRpYWxseSBhbiBhbGlhcykuIFNlZVxuICAgICAgICAgIC8vICAgdHlwZVJlZmVyZW5jZVRvRXhwcmVzc2lvblxuICAgICAgICAgIC8vICAgLy8gZm9yIGNvZGUgaGFuZGxpbmcgYSBsb2NhbCwgaW4tZmlsZSB0eXBlIGFsaWFzLlxuICAgICAgICAgIC8vICAgaWYgKHN5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICAgICAgLy8gICAgIHN5bSA9IHR5cGVDaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltKTtcbiAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAvLyAgIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZSkge1xuICAgICAgICAgIC8vICAgICBwYXJhbUluZm8hLnR5cGUgPSBwYXJhbS50eXBlO1xuICAgICAgICAgIC8vICAgfVxuICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgICAgICBwYXJhbWV0ZXJzSW5mby5wdXNoKHBhcmFtSW5mbyk7XG4gICAgICAgIGNvbnN0IG5ld1BhcmFtID0gdHMudXBkYXRlUGFyYW1ldGVyKFxuICAgICAgICAgICAgcGFyYW0sXG4gICAgICAgICAgICAvLyBNdXN0IHBhc3MgJ3VuZGVmaW5lZCcgdG8gYXZvaWQgZW1pdHRpbmcgZGVjb3JhdG9yIG1ldGFkYXRhLlxuICAgICAgICAgICAgZGVjb3JhdG9yc1RvS2VlcC5sZW5ndGggPyBkZWNvcmF0b3JzVG9LZWVwIDogdW5kZWZpbmVkLCBwYXJhbS5tb2RpZmllcnMsXG4gICAgICAgICAgICBwYXJhbS5kb3REb3REb3RUb2tlbiwgcGFyYW0ubmFtZSwgcGFyYW0ucXVlc3Rpb25Ub2tlbiwgcGFyYW0udHlwZSwgcGFyYW0uaW5pdGlhbGl6ZXIpO1xuICAgICAgICBuZXdQYXJhbWV0ZXJzLnB1c2gobmV3UGFyYW0pO1xuICAgICAgfVxuICAgICAgY29uc3QgdXBkYXRlZCA9IHRzLnVwZGF0ZUNvbnN0cnVjdG9yKFxuICAgICAgICAgIGN0b3IsIGN0b3IuZGVjb3JhdG9ycywgY3Rvci5tb2RpZmllcnMsIG5ld1BhcmFtZXRlcnMsXG4gICAgICAgICAgdHMudmlzaXRGdW5jdGlvbkJvZHkoY3Rvci5ib2R5LCB2aXNpdG9yLCBjb250ZXh0KSk7XG4gICAgICByZXR1cm4gW3VwZGF0ZWQsIHBhcmFtZXRlcnNJbmZvXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1zIGEgc2luZ2xlIGNsYXNzIGRlY2xhcmF0aW9uOlxuICAgICAqIC0gZGlzcGF0Y2hlcyB0byBzdHJpcCBkZWNvcmF0b3JzIG9uIG1lbWJlcnNcbiAgICAgKiAtIGNvbnZlcnRzIGRlY29yYXRvcnMgb24gdGhlIGNsYXNzIHRvIGFubm90YXRpb25zXG4gICAgICogLSBjcmVhdGVzIGEgY3RvclBhcmFtZXRlcnMgcHJvcGVydHlcbiAgICAgKiAtIGNyZWF0ZXMgYSBwcm9wRGVjb3JhdG9ycyBwcm9wZXJ0eVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybUNsYXNzRGVjbGFyYXRpb24oY2xhc3NEZWNsOiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogdHMuQ2xhc3NEZWNsYXJhdGlvbiB7XG4gICAgICBjbGFzc0RlY2wgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoY2xhc3NEZWNsKTtcblxuICAgICAgY29uc3QgbmV3TWVtYmVyczogdHMuQ2xhc3NFbGVtZW50W10gPSBbXTtcbiAgICAgIGNvbnN0IGRlY29yYXRlZFByb3BlcnRpZXMgPSBuZXcgTWFwPHN0cmluZywgdHMuRGVjb3JhdG9yW10+KCk7XG4gICAgICBsZXQgY2xhc3NQYXJhbWV0ZXJzOiBQYXJhbWV0ZXJEZWNvcmF0aW9uSW5mb1tdfG51bGwgPSBudWxsO1xuXG4gICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBjbGFzc0RlY2wubWVtYmVycykge1xuICAgICAgICBzd2l0Y2ggKG1lbWJlci5raW5kKSB7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkdldEFjY2Vzc29yOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TZXRBY2Nlc3NvcjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTWV0aG9kRGVjbGFyYXRpb246IHtcbiAgICAgICAgICAgIGNvbnN0IFtuYW1lLCBuZXdNZW1iZXIsIGRlY29yYXRvcnNdID0gdHJhbnNmb3JtQ2xhc3NFbGVtZW50KG1lbWJlcik7XG4gICAgICAgICAgICBuZXdNZW1iZXJzLnB1c2gobmV3TWVtYmVyKTtcbiAgICAgICAgICAgIGlmIChuYW1lKSBkZWNvcmF0ZWRQcm9wZXJ0aWVzLnNldChuYW1lLCBkZWNvcmF0b3JzKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3I6IHtcbiAgICAgICAgICAgIGNvbnN0IGN0b3IgPSBtZW1iZXIgYXMgdHMuQ29uc3RydWN0b3JEZWNsYXJhdGlvbjtcbiAgICAgICAgICAgIGlmICghY3Rvci5ib2R5KSBicmVhaztcbiAgICAgICAgICAgIGNvbnN0IFtuZXdNZW1iZXIsIHBhcmFtZXRlcnNJbmZvXSA9XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtQ29uc3RydWN0b3IobWVtYmVyIGFzIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgY2xhc3NQYXJhbWV0ZXJzID0gcGFyYW1ldGVyc0luZm87XG4gICAgICAgICAgICBuZXdNZW1iZXJzLnB1c2gobmV3TWVtYmVyKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbmV3TWVtYmVycy5wdXNoKHRzLnZpc2l0RWFjaENoaWxkKG1lbWJlciwgdmlzaXRvciwgY29udGV4dCkpO1xuICAgICAgfVxuICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IGNsYXNzRGVjbC5kZWNvcmF0b3JzIHx8IFtdO1xuXG4gICAgICBjb25zdCBkZWNvcmF0b3JzVG9Mb3dlciA9IFtdO1xuICAgICAgY29uc3QgZGVjb3JhdG9yc1RvS2VlcDogdHMuRGVjb3JhdG9yW10gPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIGRlY29yYXRvcnMpIHtcbiAgICAgICAgaWYgKHNob3VsZExvd2VyKGRlY29yYXRvciwgdHlwZUNoZWNrZXIpKSB7XG4gICAgICAgICAgZGVjb3JhdG9yc1RvTG93ZXIucHVzaChleHRyYWN0TWV0YWRhdGFGcm9tU2luZ2xlRGVjb3JhdG9yKGRlY29yYXRvciwgZGlhZ25vc3RpY3MpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWNvcmF0b3JzVG9LZWVwLnB1c2goZGVjb3JhdG9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBuZXdDbGFzc0RlY2xhcmF0aW9uID0gdHMuZ2V0TXV0YWJsZUNsb25lKGNsYXNzRGVjbCk7XG5cbiAgICAgIGlmIChkZWNvcmF0b3JzVG9Mb3dlci5sZW5ndGgpIHtcbiAgICAgICAgbmV3TWVtYmVycy5wdXNoKGNyZWF0ZURlY29yYXRvckNsYXNzUHJvcGVydHkoZGVjb3JhdG9yc1RvTG93ZXIpKTtcbiAgICAgIH1cbiAgICAgIGlmIChjbGFzc1BhcmFtZXRlcnMpIHtcbiAgICAgICAgaWYgKChkZWNvcmF0b3JzVG9Mb3dlci5sZW5ndGgpIHx8IGNsYXNzUGFyYW1ldGVycy5zb21lKHAgPT4gISFwLmRlY29yYXRvcnMubGVuZ3RoKSkge1xuICAgICAgICAgIC8vIGVtaXQgY3RvclBhcmFtZXRlcnMgaWYgdGhlIGNsYXNzIHdhcyBkZWNvcmF0b3JlZCBhdCBhbGwsIG9yIGlmIGFueSBvZiBpdHMgY3RvcnNcbiAgICAgICAgICAvLyB3ZXJlIGNsYXNzUGFyYW1ldGVyc1xuICAgICAgICAgIG5ld01lbWJlcnMucHVzaChjcmVhdGVDdG9yUGFyYW1ldGVyc0NsYXNzUHJvcGVydHkoXG4gICAgICAgICAgICAgIGRpYWdub3N0aWNzLCBlbnRpdHlOYW1lVG9FeHByZXNzaW9uLCBjbGFzc1BhcmFtZXRlcnMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRlY29yYXRlZFByb3BlcnRpZXMuc2l6ZSkge1xuICAgICAgICBuZXdNZW1iZXJzLnB1c2goY3JlYXRlUHJvcERlY29yYXRvcnNDbGFzc1Byb3BlcnR5KGRpYWdub3N0aWNzLCBkZWNvcmF0ZWRQcm9wZXJ0aWVzKSk7XG4gICAgICB9XG4gICAgICBuZXdDbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMgPSB0cy5zZXRUZXh0UmFuZ2UoXG4gICAgICAgICAgdHMuY3JlYXRlTm9kZUFycmF5KG5ld01lbWJlcnMsIG5ld0NsYXNzRGVjbGFyYXRpb24ubWVtYmVycy5oYXNUcmFpbGluZ0NvbW1hKSxcbiAgICAgICAgICBjbGFzc0RlY2wubWVtYmVycyk7XG4gICAgICBuZXdDbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMgPVxuICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAubGVuZ3RoID8gdHMuY3JlYXRlTm9kZUFycmF5KGRlY29yYXRvcnNUb0tlZXApIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIG5ld0NsYXNzRGVjbGFyYXRpb247XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmlzaXRvcihub2RlOiB0cy5Ob2RlKTogdHMuTm9kZSB7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU291cmNlRmlsZToge1xuICAgICAgICAgIGltcG9ydE5hbWVzQnlTeW1ib2wgPSBuZXcgTWFwPHRzLlN5bWJvbCwgdHMuSWRlbnRpZmllcj4oKTtcbiAgICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uOiB7XG4gICAgICAgICAgY29uc3QgaW1wRGVjbCA9IG5vZGUgYXMgdHMuSW1wb3J0RGVjbGFyYXRpb247XG4gICAgICAgICAgaWYgKGltcERlY2wuaW1wb3J0Q2xhdXNlKSB7XG4gICAgICAgICAgICBjb25zdCBpbXBvcnRDbGF1c2UgPSBpbXBEZWNsLmltcG9ydENsYXVzZTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVzID0gW107XG4gICAgICAgICAgICBpZiAoaW1wb3J0Q2xhdXNlLm5hbWUpIHtcbiAgICAgICAgICAgICAgbmFtZXMucHVzaChpbXBvcnRDbGF1c2UubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3MgJiZcbiAgICAgICAgICAgICAgICBpbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncy5raW5kID09PSB0cy5TeW50YXhLaW5kLk5hbWVkSW1wb3J0cykge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lZEltcG9ydHMgPSBpbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncyBhcyB0cy5OYW1lZEltcG9ydHM7XG4gICAgICAgICAgICAgIG5hbWVzLnB1c2goLi4ubmFtZWRJbXBvcnRzLmVsZW1lbnRzLm1hcChlID0+IGUubmFtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIG5hbWVzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHN5bSA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obmFtZSkhO1xuICAgICAgICAgICAgICBpbXBvcnROYW1lc0J5U3ltYm9sLnNldChzeW0sIG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb246IHtcbiAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2xhc3NEZWNsYXJhdGlvbihub2RlIGFzIHRzLkNsYXNzRGVjbGFyYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIHZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoc2Y6IHRzLlNvdXJjZUZpbGUpID0+IHZpc2l0b3Ioc2YpIGFzIHRzLlNvdXJjZUZpbGU7XG4gIH07XG59XG4iXX0=