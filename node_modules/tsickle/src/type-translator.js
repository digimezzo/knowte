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
        define("tsickle/src/type-translator", ["require", "exports", "path", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var ts = require("tsickle/src/typescript");
    /**
     * Determines if fileName refers to a builtin lib.d.ts file.
     * This is a terrible hack but it mirrors a similar thing done in Clutz.
     */
    function isBuiltinLibDTS(fileName) {
        return fileName.match(/\blib\.(?:[^/]+\.)?d\.ts$/) != null;
    }
    exports.isBuiltinLibDTS = isBuiltinLibDTS;
    /**
     * @return True if the named type is considered compatible with the Closure-defined
     *     type of the same name, e.g. "Array".  Note that we don't actually enforce
     *     that the types are actually compatible, but mostly just hope that they are due
     *     to being derived from the same HTML specs.
     */
    function isClosureProvidedType(symbol) {
        return symbol.declarations != null &&
            symbol.declarations.some(function (n) { return isBuiltinLibDTS(n.getSourceFile().fileName); });
    }
    function typeToDebugString(type) {
        var e_1, _a, e_2, _b;
        var debugString = "flags:0x" + type.flags.toString(16);
        if (type.aliasSymbol) {
            debugString += " alias:" + symbolToDebugString(type.aliasSymbol);
        }
        if (type.aliasTypeArguments) {
            debugString += " aliasArgs:<" + type.aliasTypeArguments.map(typeToDebugString).join(',') + ">";
        }
        // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
        var basicTypes = [
            ts.TypeFlags.Any, ts.TypeFlags.String, ts.TypeFlags.Number,
            ts.TypeFlags.Boolean, ts.TypeFlags.Enum, ts.TypeFlags.StringLiteral,
            ts.TypeFlags.NumberLiteral, ts.TypeFlags.BooleanLiteral, ts.TypeFlags.EnumLiteral,
            ts.TypeFlags.ESSymbol, ts.TypeFlags.Void, ts.TypeFlags.Undefined,
            ts.TypeFlags.Null, ts.TypeFlags.Never, ts.TypeFlags.TypeParameter,
            ts.TypeFlags.Object, ts.TypeFlags.Union, ts.TypeFlags.Intersection,
            ts.TypeFlags.Index, ts.TypeFlags.IndexedAccess, ts.TypeFlags.NonPrimitive,
        ];
        try {
            for (var basicTypes_1 = __values(basicTypes), basicTypes_1_1 = basicTypes_1.next(); !basicTypes_1_1.done; basicTypes_1_1 = basicTypes_1.next()) {
                var flag = basicTypes_1_1.value;
                if ((type.flags & flag) !== 0) {
                    debugString += " " + ts.TypeFlags[flag];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (basicTypes_1_1 && !basicTypes_1_1.done && (_a = basicTypes_1.return)) _a.call(basicTypes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (type.flags === ts.TypeFlags.Object) {
            var objType = type;
            // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
            var objectFlags = [
                ts.ObjectFlags.Class,
                ts.ObjectFlags.Interface,
                ts.ObjectFlags.Reference,
                ts.ObjectFlags.Tuple,
                ts.ObjectFlags.Anonymous,
                ts.ObjectFlags.Mapped,
                ts.ObjectFlags.Instantiated,
                ts.ObjectFlags.ObjectLiteral,
                ts.ObjectFlags.EvolvingArray,
                ts.ObjectFlags.ObjectLiteralPatternWithComputedProperties,
            ];
            try {
                for (var objectFlags_1 = __values(objectFlags), objectFlags_1_1 = objectFlags_1.next(); !objectFlags_1_1.done; objectFlags_1_1 = objectFlags_1.next()) {
                    var flag = objectFlags_1_1.value;
                    if ((objType.objectFlags & flag) !== 0) {
                        debugString += " object:" + ts.ObjectFlags[flag];
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (objectFlags_1_1 && !objectFlags_1_1.done && (_b = objectFlags_1.return)) _b.call(objectFlags_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        if (type.symbol && type.symbol.name !== '__type') {
            debugString += " symbol.name:" + JSON.stringify(type.symbol.name);
        }
        if (type.pattern) {
            debugString += " destructuring:true";
        }
        return "{type " + debugString + "}";
    }
    exports.typeToDebugString = typeToDebugString;
    function symbolToDebugString(sym) {
        var e_3, _a;
        var debugString = JSON.stringify(sym.name) + " flags:0x" + sym.flags.toString(16);
        // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
        var symbolFlags = [
            ts.SymbolFlags.FunctionScopedVariable,
            ts.SymbolFlags.BlockScopedVariable,
            ts.SymbolFlags.Property,
            ts.SymbolFlags.EnumMember,
            ts.SymbolFlags.Function,
            ts.SymbolFlags.Class,
            ts.SymbolFlags.Interface,
            ts.SymbolFlags.ConstEnum,
            ts.SymbolFlags.RegularEnum,
            ts.SymbolFlags.ValueModule,
            ts.SymbolFlags.NamespaceModule,
            ts.SymbolFlags.TypeLiteral,
            ts.SymbolFlags.ObjectLiteral,
            ts.SymbolFlags.Method,
            ts.SymbolFlags.Constructor,
            ts.SymbolFlags.GetAccessor,
            ts.SymbolFlags.SetAccessor,
            ts.SymbolFlags.Signature,
            ts.SymbolFlags.TypeParameter,
            ts.SymbolFlags.TypeAlias,
            ts.SymbolFlags.ExportValue,
            ts.SymbolFlags.Alias,
            ts.SymbolFlags.Prototype,
            ts.SymbolFlags.ExportStar,
            ts.SymbolFlags.Optional,
            ts.SymbolFlags.Transient,
        ];
        try {
            for (var symbolFlags_1 = __values(symbolFlags), symbolFlags_1_1 = symbolFlags_1.next(); !symbolFlags_1_1.done; symbolFlags_1_1 = symbolFlags_1.next()) {
                var flag = symbolFlags_1_1.value;
                if ((sym.flags & flag) !== 0) {
                    debugString += " " + ts.SymbolFlags[flag];
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (symbolFlags_1_1 && !symbolFlags_1_1.done && (_a = symbolFlags_1.return)) _a.call(symbolFlags_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return debugString;
    }
    exports.symbolToDebugString = symbolToDebugString;
    /** TypeTranslator translates TypeScript types to Closure types. */
    var TypeTranslator = /** @class */ (function () {
        /**
         * @param node is the source AST ts.Node the type comes from.  This is used
         *     in some cases (e.g. anonymous types) for looking up field names.
         * @param pathBlackList is a set of paths that should never get typed;
         *     any reference to symbols defined in these paths should by typed
         *     as {?}.
         * @param symbolsToAliasedNames a mapping from symbols (`Foo`) to a name in scope they should be
         *     emitted as (e.g. `tsickle_forward_declare_1.Foo`). Can be augmented during type
         *     translation, e.g. to blacklist a symbol.
         */
        function TypeTranslator(typeChecker, node, pathBlackList, symbolsToAliasedNames, ensureSymbolDeclared) {
            if (symbolsToAliasedNames === void 0) { symbolsToAliasedNames = new Map(); }
            if (ensureSymbolDeclared === void 0) { ensureSymbolDeclared = function () { }; }
            this.typeChecker = typeChecker;
            this.node = node;
            this.pathBlackList = pathBlackList;
            this.symbolsToAliasedNames = symbolsToAliasedNames;
            this.ensureSymbolDeclared = ensureSymbolDeclared;
            /**
             * A list of type literals we've encountered while emitting; used to avoid getting stuck in
             * recursive types.
             */
            this.seenAnonymousTypes = new Set();
            /**
             * Whether to write types suitable for an \@externs file. Externs types must not refer to
             * non-externs types (i.e. non ambient types) and need to use fully qualified names.
             */
            this.isForExterns = false;
            // Normalize paths to not break checks on Windows.
            if (this.pathBlackList != null) {
                this.pathBlackList =
                    new Set(Array.from(this.pathBlackList.values()).map(function (p) { return path.normalize(p); }));
            }
        }
        /**
         * Converts a ts.Symbol to a string.
         * Other approaches that don't work:
         * - TypeChecker.typeToString translates Array as T[].
         * - TypeChecker.symbolToString emits types without their namespace,
         *   and doesn't let you pass the flag to control that.
         * @param useFqn whether to scope the name using its fully qualified name. Closure's template
         *     arguments are always scoped to the class containing them, where TypeScript's template args
         *     would be fully qualified. I.e. this flag is false for generic types.
         */
        TypeTranslator.prototype.symbolToString = function (sym, useFqn) {
            var _this = this;
            if (useFqn && this.isForExterns) {
                // For regular type emit, we can use TypeScript's naming rules, as they match Closure's name
                // scoping rules. However when emitting externs files for ambients, naming rules change. As
                // Closure doesn't support externs modules, all names must be global and use global fully
                // qualified names. The code below uses TypeScript to convert a symbol to a full qualified
                // name and then emits that.
                var fqn = this.typeChecker.getFullyQualifiedName(sym);
                if (fqn.startsWith("\"") || fqn.startsWith("'")) {
                    // Quoted FQNs mean the name is from a module, e.g. `'path/to/module'.some.qualified.Name`.
                    // tsickle generally re-scopes names in modules that are moved to externs into the global
                    // namespace. That does not quite match TS' semantics where ambient types from modules are
                    // local. However value declarations that are local to modules but not defined do not make
                    // sense if not global, e.g. "declare class X {}; new X();" cannot work unless `X` is
                    // actually a global.
                    // So this code strips the module path from the type and uses the FQN as a global.
                    fqn = fqn.replace(/^["'][^"']+['"]\./, '');
                }
                // Declarations in module can re-open global types using "declare global { ... }". The fqn
                // then contains the prefix "global." here. As we're mapping to global types, just strip the
                // prefix.
                var isInGlobal = (sym.declarations || []).some(function (d) {
                    var current = d;
                    while (current) {
                        if (current.flags & ts.NodeFlags.GlobalAugmentation)
                            return true;
                        current = current.parent;
                    }
                    return false;
                });
                if (isInGlobal) {
                    fqn = fqn.replace(/^global\./, '');
                }
                return this.stripClutzNamespace(fqn);
            }
            // TypeScript resolves e.g. union types to their members, which can include symbols not declared
            // in the current scope. Ensure that all symbols found this way are actually declared.
            // This must happen before the alias check below, it might introduce a new alias for the symbol.
            if ((sym.flags & ts.SymbolFlags.TypeParameter) === 0)
                this.ensureSymbolDeclared(sym);
            // This follows getSingleLineStringWriter in the TypeScript compiler.
            var str = '';
            function writeText(text) {
                str += text;
            }
            var writeSymbol = function (text, symbol) {
                // When writing a symbol, check if there is an alias for it in the current scope that should
                // take precedence, e.g. from a goog.forwardDeclare.
                if (symbol.flags & ts.SymbolFlags.Alias) {
                    symbol = _this.typeChecker.getAliasedSymbol(symbol);
                }
                var alias = _this.symbolsToAliasedNames.get(symbol);
                if (alias) {
                    // If so, discard the entire current text and only use the alias - otherwise if a symbol has
                    // a local alias but appears in a dotted type path (e.g. when it's imported using import *
                    // as foo), str would contain both the prefx *and* the full alias (foo.alias.name).
                    str = alias;
                }
                else {
                    str += text;
                }
            };
            var doNothing = function () {
                return;
            };
            var builder = this.typeChecker.getSymbolDisplayBuilder();
            var writer = {
                writeSymbol: writeSymbol,
                writeKeyword: writeText,
                writeOperator: writeText,
                writePunctuation: writeText,
                writeSpace: writeText,
                writeStringLiteral: writeText,
                writeParameter: writeText,
                writeProperty: writeText,
                writeLine: doNothing,
                increaseIndent: doNothing,
                decreaseIndent: doNothing,
                clear: doNothing,
                trackSymbol: function (symbol, enclosingDeclaration, meaning) {
                    return;
                },
                reportInaccessibleThisError: doNothing,
                reportPrivateInBaseOfClassExpression: doNothing,
            };
            builder.buildSymbolDisplay(sym, writer, this.node);
            return this.stripClutzNamespace(str);
        };
        // Clutz (https://github.com/angular/clutz) emits global type symbols hidden in a special
        // ಠ_ಠ.clutz namespace. While most code seen by Tsickle will only ever see local aliases, Clutz
        // symbols can be written by users directly in code, and they can appear by dereferencing
        // TypeAliases. The code below simply strips the prefix, the remaining type name then matches
        // Closure's type.
        TypeTranslator.prototype.stripClutzNamespace = function (name) {
            if (name.startsWith('ಠ_ಠ.clutz.'))
                return name.substring('ಠ_ಠ.clutz.'.length);
            return name;
        };
        TypeTranslator.prototype.translate = function (type, resolveAlias) {
            // NOTE: Though type.flags has the name "flags", it usually can only be one
            // of the enum options at a time (except for unions of literal types, e.g. unions of boolean
            // values, string values, enum values). This switch handles all the cases in the ts.TypeFlags
            // enum in the order they occur.
            if (resolveAlias === void 0) { resolveAlias = false; }
            var e_4, _a;
            // NOTE: Some TypeFlags are marked "internal" in the d.ts but still show up in the value of
            // type.flags. This mask limits the flag checks to the ones in the public API. "lastFlag" here
            // is the last flag handled in this switch statement, and should be kept in sync with
            // typescript.d.ts.
            // NonPrimitive occurs on its own on the lower case "object" type. Special case to "!Object".
            if (type.flags === ts.TypeFlags.NonPrimitive)
                return '!Object';
            // Avoid infinite loops on recursive type literals.
            // It would be nice to just emit the name of the recursive type here (in type.aliasSymbol
            // below), but Closure Compiler does not allow recursive type definitions.
            if (this.seenAnonymousTypes.has(type))
                return '?';
            // If type is an alias, e.g. from type X = A|B, then always emit the alias, not the underlying
            // union type, as the alias is the user visible, imported symbol.
            if (!resolveAlias && type.aliasSymbol) {
                return this.symbolToString(type.aliasSymbol, /* useFqn */ true);
            }
            var isAmbient = false;
            var isInNamespace = false;
            var isModule = false;
            if (type.symbol) {
                try {
                    for (var _b = __values(type.symbol.declarations || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var decl = _c.value;
                        if (ts.isExternalModule(decl.getSourceFile()))
                            isModule = true;
                        var current = decl;
                        while (current) {
                            if (ts.getCombinedModifierFlags(current) & ts.ModifierFlags.Ambient)
                                isAmbient = true;
                            if (current.kind === ts.SyntaxKind.ModuleDeclaration)
                                isInNamespace = true;
                            current = current.parent;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            // tsickle cannot generate types for non-ambient namespaces nor any symbols contained in them.
            if (isInNamespace && !isAmbient)
                return '?';
            // Types in externs cannot reference types from external modules.
            // However ambient types in modules get moved to externs, too, so type references work and we
            // can emit a precise type.
            if (this.isForExterns && isModule && !isAmbient)
                return '?';
            var lastFlag = ts.TypeFlags.IndexedAccess;
            var mask = (lastFlag << 1) - 1;
            switch (type.flags & mask) {
                case ts.TypeFlags.Any:
                    return '?';
                case ts.TypeFlags.String:
                case ts.TypeFlags.StringLiteral:
                    return 'string';
                case ts.TypeFlags.Number:
                case ts.TypeFlags.NumberLiteral:
                    return 'number';
                case ts.TypeFlags.Boolean:
                case ts.TypeFlags.BooleanLiteral:
                    // See the note in translateUnion about booleans.
                    return 'boolean';
                case ts.TypeFlags.Enum:
                    if (!type.symbol) {
                        this.warn("EnumType without a symbol");
                        return '?';
                    }
                    return this.symbolToString(type.symbol, true);
                case ts.TypeFlags.ESSymbol:
                    // NOTE: currently this is just a typedef for {?}, shrug.
                    // https://github.com/google/closure-compiler/blob/55cf43ee31e80d89d7087af65b5542aa63987874/externs/es3.js#L34
                    return 'symbol';
                case ts.TypeFlags.Void:
                    return 'void';
                case ts.TypeFlags.Undefined:
                    return 'undefined';
                case ts.TypeFlags.Null:
                    return 'null';
                case ts.TypeFlags.Never:
                    this.warn("should not emit a 'never' type");
                    return '?';
                case ts.TypeFlags.TypeParameter:
                    // This is e.g. the T in a type like Foo<T>.
                    if (!type.symbol) {
                        this.warn("TypeParameter without a symbol"); // should not happen (tm)
                        return '?';
                    }
                    // In Closure Compiler, type parameters *are* scoped to their containing class.
                    var useFqn = false;
                    return this.symbolToString(type.symbol, useFqn);
                case ts.TypeFlags.Object:
                    return this.translateObject(type);
                case ts.TypeFlags.Union:
                    return this.translateUnion(type);
                case ts.TypeFlags.Intersection:
                case ts.TypeFlags.Index:
                case ts.TypeFlags.IndexedAccess:
                    // TODO(ts2.1): handle these special types.
                    this.warn("unhandled type flags: " + ts.TypeFlags[type.flags]);
                    return '?';
                default:
                    // Handle cases where multiple flags are set.
                    // Types with literal members are represented as
                    //   ts.TypeFlags.Union | [literal member]
                    // E.g. an enum typed value is a union type with the enum's members as its members. A
                    // boolean type is a union type with 'true' and 'false' as its members.
                    // Note also that in a more complex union, e.g. boolean|number, then it's a union of three
                    // things (true|false|number) and ts.TypeFlags.Boolean doesn't show up at all.
                    if (type.flags & ts.TypeFlags.Union) {
                        return this.translateUnion(type);
                    }
                    if (type.flags & ts.TypeFlags.EnumLiteral) {
                        return this.translateEnumLiteral(type);
                    }
                    // The switch statement should have been exhaustive.
                    throw new Error("unknown type flags " + type.flags + " on " + typeToDebugString(type));
            }
        };
        TypeTranslator.prototype.translateUnion = function (type) {
            var _this = this;
            var parts = type.types.map(function (t) { return _this.translate(t); });
            // Union types that include literals (e.g. boolean, enum) can end up repeating the same Closure
            // type. For example: true | boolean will be translated to boolean | boolean.
            // Remove duplicates to produce types that read better.
            parts = parts.filter(function (el, idx) { return parts.indexOf(el) === idx; });
            return parts.length === 1 ? parts[0] : "(" + parts.join('|') + ")";
        };
        TypeTranslator.prototype.translateEnumLiteral = function (type) {
            // Suppose you had:
            //   enum EnumType { MEMBER }
            // then the type of "EnumType.MEMBER" is an enum literal (the thing passed to this function)
            // and it has type flags that include
            //   ts.TypeFlags.NumberLiteral | ts.TypeFlags.EnumLiteral
            //
            // Closure Compiler doesn't support literals in types, so this code must not emit
            // "EnumType.MEMBER", but rather "EnumType".
            var enumLiteralBaseType = this.typeChecker.getBaseTypeOfLiteralType(type);
            if (!enumLiteralBaseType.symbol) {
                this.warn("EnumLiteralType without a symbol");
                return '?';
            }
            return this.symbolToString(enumLiteralBaseType.symbol, true);
        };
        // translateObject translates a ts.ObjectType, which is the type of all
        // object-like things in TS, such as classes and interfaces.
        TypeTranslator.prototype.translateObject = function (type) {
            var _this = this;
            if (type.symbol && this.isBlackListed(type.symbol))
                return '?';
            // NOTE: objectFlags is an enum, but a given type can have multiple flags.
            // Array<string> is both ts.ObjectFlags.Reference and ts.ObjectFlags.Interface.
            if (type.objectFlags & ts.ObjectFlags.Class) {
                if (!type.symbol) {
                    this.warn('class has no symbol');
                    return '?';
                }
                return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
            }
            else if (type.objectFlags & ts.ObjectFlags.Interface) {
                // Note: ts.InterfaceType has a typeParameters field, but that
                // specifies the parameters that the interface type *expects*
                // when it's used, and should not be transformed to the output.
                // E.g. a type like Array<number> is a TypeReference to the
                // InterfaceType "Array", but the "number" type parameter is
                // part of the outer TypeReference, not a typeParameter on
                // the InterfaceType.
                if (!type.symbol) {
                    this.warn('interface has no symbol');
                    return '?';
                }
                if (type.symbol.flags & ts.SymbolFlags.Value) {
                    // The symbol is both a type and a value.
                    // For user-defined types in this state, we don't have a Closure name
                    // for the type.  See the type_and_value test.
                    if (!isClosureProvidedType(type.symbol)) {
                        this.warn("type/symbol conflict for " + type.symbol.name + ", using {?} for now");
                        return '?';
                    }
                }
                return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
            }
            else if (type.objectFlags & ts.ObjectFlags.Reference) {
                // A reference to another type, e.g. Array<number> refers to Array.
                // Emit the referenced type and any type arguments.
                var referenceType = type;
                // A tuple is a ReferenceType where the target is flagged Tuple and the
                // typeArguments are the tuple arguments.  Just treat it as a mystery
                // array, because Closure doesn't understand tuples.
                if (referenceType.target.objectFlags & ts.ObjectFlags.Tuple) {
                    return '!Array<?>';
                }
                var typeStr = '';
                if (referenceType.target === referenceType) {
                    // We get into an infinite loop here if the inner reference is
                    // the same as the outer; this can occur when this function
                    // fails to translate a more specific type before getting to
                    // this point.
                    throw new Error("reference loop in " + typeToDebugString(referenceType) + " " + referenceType.flags);
                }
                typeStr += this.translate(referenceType.target);
                // Translate can return '?' for a number of situations, e.g. type/value conflicts.
                // `?<?>` is illegal syntax in Closure Compiler, so just return `?` here.
                if (typeStr === '?')
                    return '?';
                if (referenceType.typeArguments) {
                    var params = referenceType.typeArguments.map(function (t) { return _this.translate(t); });
                    typeStr += "<" + params.join(', ') + ">";
                }
                return typeStr;
            }
            else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
                if (!type.symbol) {
                    // This comes up when generating code for an arrow function as passed
                    // to a generic function.  The passed-in type is tagged as anonymous
                    // and has no properties so it's hard to figure out what to generate.
                    // Just avoid it for now so we don't crash.
                    this.warn('anonymous type has no symbol');
                    return '?';
                }
                if (type.symbol.flags & ts.SymbolFlags.Function ||
                    type.symbol.flags & ts.SymbolFlags.Method) {
                    var sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
                    if (sigs.length === 1) {
                        return this.signatureToClosure(sigs[0]);
                    }
                    this.warn('unhandled anonymous type with multiple call signatures');
                    return '?';
                }
                else {
                    return this.translateAnonymousType(type);
                }
            }
            /*
            TODO(ts2.1): more unhandled object type flags:
              Tuple
              Mapped
              Instantiated
              ObjectLiteral
              EvolvingArray
              ObjectLiteralPatternWithComputedProperties
            */
            this.warn("unhandled type " + typeToDebugString(type));
            return '?';
        };
        /**
         * translateAnonymousType translates a ts.TypeFlags.ObjectType that is also
         * ts.ObjectFlags.Anonymous. That is, this type's symbol does not have a name. This is the
         * anonymous type encountered in e.g.
         *     let x: {a: number};
         * But also the inferred type in:
         *     let x = {a: 1};  // type of x is {a: number}, as above
         */
        TypeTranslator.prototype.translateAnonymousType = function (type) {
            var e_5, _a;
            this.seenAnonymousTypes.add(type);
            // Gather up all the named fields and whether the object is also callable.
            var callable = false;
            var indexable = false;
            var fields = [];
            if (!type.symbol || !type.symbol.members) {
                this.warn('anonymous type has no symbol');
                return '?';
            }
            // special-case construct signatures.
            var ctors = type.getConstructSignatures();
            if (ctors.length) {
                // TODO(martinprobst): this does not support additional properties defined on constructors
                // (not expressible in Closure), nor multiple constructors (same).
                var decl = ctors[0].declaration;
                if (!decl) {
                    this.warn('unhandled anonymous type with constructor signature but no declaration');
                    return '?';
                }
                if (decl.kind === ts.SyntaxKindJSDocSignature) {
                    this.warn('unhandled JSDoc based constructor signature');
                    return '?';
                }
                var params = this.convertParams(ctors[0], decl.parameters);
                var paramsStr = params.length ? (', ' + params.join(', ')) : '';
                var constructedType = this.translate(ctors[0].getReturnType());
                // In the specific case of the "new" in a function, it appears that
                //   function(new: !Bar)
                // fails to parse, while
                //   function(new: (!Bar))
                // parses in the way you'd expect.
                // It appears from testing that Closure ignores the ! anyway and just
                // assumes the result will be non-null in either case.  (To be pedantic,
                // it's possible to return null from a ctor it seems like a bad idea.)
                return "function(new: (" + constructedType + ")" + paramsStr + "): ?";
            }
            try {
                // members is an ES6 map, but the .d.ts defining it defined their own map
                // type, so typescript doesn't believe that .keys() is iterable
                // tslint:disable-next-line:no-any
                for (var _b = __values(type.symbol.members.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var field = _c.value;
                    switch (field) {
                        case '__call':
                            callable = true;
                            break;
                        case '__index':
                            indexable = true;
                            break;
                        default:
                            var member = type.symbol.members.get(field);
                            // optional members are handled by the type including |undefined in a union type.
                            var memberType = this.translate(this.typeChecker.getTypeOfSymbolAtLocation(member, this.node));
                            fields.push(field + ": " + memberType);
                            break;
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            // Try to special-case plain key-value objects and functions.
            if (fields.length === 0) {
                if (callable && !indexable) {
                    // A function type.
                    var sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
                    if (sigs.length === 1) {
                        return this.signatureToClosure(sigs[0]);
                    }
                }
                else if (indexable && !callable) {
                    // A plain key-value map type.
                    var keyType = 'string';
                    var valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.String);
                    if (!valType) {
                        keyType = 'number';
                        valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.Number);
                    }
                    if (!valType) {
                        this.warn('unknown index key type');
                        return "!Object<?,?>";
                    }
                    return "!Object<" + keyType + "," + this.translate(valType) + ">";
                }
                else if (!callable && !indexable) {
                    // Special-case the empty object {} because Closure doesn't like it.
                    // TODO(evanm): revisit this if it is a problem.
                    return '!Object';
                }
            }
            if (!callable && !indexable) {
                // Not callable, not indexable; implies a plain object with fields in it.
                return "{" + fields.join(', ') + "}";
            }
            this.warn('unhandled anonymous type');
            return '?';
        };
        /** Converts a ts.Signature (function signature) to a Closure function type. */
        TypeTranslator.prototype.signatureToClosure = function (sig) {
            // TODO(martinprobst): Consider harmonizing some overlap with emitFunctionType in tsickle.ts.
            if (!sig.declaration) {
                this.warn('signature without declaration');
                return 'Function';
            }
            if (sig.declaration.kind === ts.SyntaxKindJSDocSignature) {
                this.warn('signature with JSDoc declaration');
                return 'Function';
            }
            this.blacklistTypeParameters(this.symbolsToAliasedNames, sig.declaration.typeParameters);
            var typeStr = "function(";
            var paramDecls = sig.declaration.parameters || [];
            var maybeThisParam = paramDecls[0];
            // Oddly, the this type shows up in paramDecls, but not in the type's parameters.
            // Handle it here and then pass paramDecls down without its first element.
            if (maybeThisParam && maybeThisParam.name.getText() === 'this') {
                if (maybeThisParam.type) {
                    var thisType = this.typeChecker.getTypeAtLocation(maybeThisParam.type);
                    typeStr += "this: (" + this.translate(thisType) + ")";
                    if (paramDecls.length > 1)
                        typeStr += ', ';
                }
                else {
                    this.warn('this type without type');
                }
                paramDecls = paramDecls.slice(1);
            }
            var params = this.convertParams(sig, paramDecls);
            typeStr += params.join(', ') + ")";
            var retType = this.translate(this.typeChecker.getReturnTypeOfSignature(sig));
            if (retType) {
                typeStr += ": " + retType;
            }
            return typeStr;
        };
        /**
         * Converts parameters for the given signature. Takes parameter declarations as those might not
         * match the signature parameters (e.g. there might be an additional this parameter). This
         * difference is handled by the caller, as is converting the "this" parameter.
         */
        TypeTranslator.prototype.convertParams = function (sig, paramDecls) {
            var paramTypes = [];
            for (var i = 0; i < sig.parameters.length; i++) {
                var param = sig.parameters[i];
                var paramDecl = paramDecls[i];
                var optional = !!paramDecl.questionToken;
                var varArgs = !!paramDecl.dotDotDotToken;
                var paramType = this.typeChecker.getTypeOfSymbolAtLocation(param, this.node);
                if (varArgs) {
                    var typeRef = paramType;
                    paramType = typeRef.typeArguments[0];
                }
                var typeStr = this.translate(paramType);
                if (varArgs)
                    typeStr = '...' + typeStr;
                if (optional)
                    typeStr = typeStr + '=';
                paramTypes.push(typeStr);
            }
            return paramTypes;
        };
        TypeTranslator.prototype.warn = function (msg) {
            // By default, warn() does nothing.  The caller will overwrite this
            // if it wants different behavior.
        };
        /** @return true if sym should always have type {?}. */
        TypeTranslator.prototype.isBlackListed = function (symbol) {
            if (this.pathBlackList === undefined)
                return false;
            var pathBlackList = this.pathBlackList;
            // Some builtin types, such as {}, get represented by a symbol that has no declarations.
            if (symbol.declarations === undefined)
                return false;
            return symbol.declarations.every(function (n) {
                var fileName = path.normalize(n.getSourceFile().fileName);
                return pathBlackList.has(fileName);
            });
        };
        /**
         * Closure doesn not support type parameters for function types, i.e. generic function types.
         * Blacklist the symbols declared by them and emit a ? for the types.
         *
         * This mutates the given blacklist map. The map's scope is one file, and symbols are
         * unique objects, so this should neither lead to excessive memory consumption nor introduce
         * errors.
         *
         * @param blacklist a map to store the blacklisted symbols in, with a value of '?'. In practice,
         *     this is always === this.symbolsToAliasedNames, but we're passing it explicitly to make it
         *    clear that the map is mutated (in particular when used from outside the class).
         * @param decls the declarations whose symbols should be blacklisted.
         */
        TypeTranslator.prototype.blacklistTypeParameters = function (blacklist, decls) {
            var e_6, _a;
            if (!decls || !decls.length)
                return;
            try {
                for (var decls_1 = __values(decls), decls_1_1 = decls_1.next(); !decls_1_1.done; decls_1_1 = decls_1.next()) {
                    var tpd = decls_1_1.value;
                    var sym = this.typeChecker.getSymbolAtLocation(tpd.name);
                    if (!sym) {
                        this.warn("type parameter with no symbol");
                        continue;
                    }
                    this.symbolsToAliasedNames.set(sym, '?');
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (decls_1_1 && !decls_1_1.done && (_a = decls_1.return)) _a.call(decls_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        return TypeTranslator;
    }());
    exports.TypeTranslator = TypeTranslator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS10cmFuc2xhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3R5cGUtdHJhbnNsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyQkFBNkI7SUFDN0IsMkNBQW1DO0lBRW5DOzs7T0FHRztJQUNILHlCQUFnQyxRQUFnQjtRQUM5QyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDN0QsQ0FBQztJQUZELDBDQUVDO0lBRUQ7Ozs7O09BS0c7SUFDSCwrQkFBK0IsTUFBaUI7UUFDOUMsT0FBTyxNQUFNLENBQUMsWUFBWSxJQUFJLElBQUk7WUFDOUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxlQUFlLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELDJCQUFrQyxJQUFhOztRQUM3QyxJQUFJLFdBQVcsR0FBRyxhQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDO1FBRXZELElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixXQUFXLElBQUksWUFBVSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFHLENBQUM7U0FDbEU7UUFDRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMzQixXQUFXLElBQUksaUJBQWUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBRyxDQUFDO1NBQzNGO1FBRUQsNEVBQTRFO1FBQzVFLElBQU0sVUFBVSxHQUFtQjtZQUNqQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBWSxFQUFF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Q0gsZ0RBQXVCLEdBQXZCLFVBQ0ksU0FBaUMsRUFDakMsS0FBMEQ7O1lBQzVELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFBRSxPQUFPOztnQkFDcEMsS0FBa0IsSUFBQSxVQUFBLFNBQUEsS0FBSyxDQUFBLDRCQUFBLCtDQUFFO29CQUFwQixJQUFNLEdBQUcsa0JBQUE7b0JBQ1osSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzNELElBQUksQ0FBQyxHQUFHLEVBQUU7d0JBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO3dCQUMzQyxTQUFTO3FCQUNWO29CQUNELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUMxQzs7Ozs7Ozs7O1FBQ0gsQ0FBQztRQUNILHFCQUFDO0lBQUQsQ0FBQyxBQWxtQkQsSUFrbUJDO0lBbG1CWSx3Q0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBmaWxlTmFtZSByZWZlcnMgdG8gYSBidWlsdGluIGxpYi5kLnRzIGZpbGUuXG4gKiBUaGlzIGlzIGEgdGVycmlibGUgaGFjayBidXQgaXQgbWlycm9ycyBhIHNpbWlsYXIgdGhpbmcgZG9uZSBpbiBDbHV0ei5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQnVpbHRpbkxpYkRUUyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBmaWxlTmFtZS5tYXRjaCgvXFxibGliXFwuKD86W14vXStcXC4pP2RcXC50cyQvKSAhPSBudWxsO1xufVxuXG4vKipcbiAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgbmFtZWQgdHlwZSBpcyBjb25zaWRlcmVkIGNvbXBhdGlibGUgd2l0aCB0aGUgQ2xvc3VyZS1kZWZpbmVkXG4gKiAgICAgdHlwZSBvZiB0aGUgc2FtZSBuYW1lLCBlLmcuIFwiQXJyYXlcIi4gIE5vdGUgdGhhdCB3ZSBkb24ndCBhY3R1YWxseSBlbmZvcmNlXG4gKiAgICAgdGhhdCB0aGUgdHlwZXMgYXJlIGFjdHVhbGx5IGNvbXBhdGlibGUsIGJ1dCBtb3N0bHkganVzdCBob3BlIHRoYXQgdGhleSBhcmUgZHVlXG4gKiAgICAgdG8gYmVpbmcgZGVyaXZlZCBmcm9tIHRoZSBzYW1lIEhUTUwgc3BlY3MuXG4gKi9cbmZ1bmN0aW9uIGlzQ2xvc3VyZVByb3ZpZGVkVHlwZShzeW1ib2w6IHRzLlN5bWJvbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3ltYm9sLmRlY2xhcmF0aW9ucyAhPSBudWxsICYmXG4gICAgICBzeW1ib2wuZGVjbGFyYXRpb25zLnNvbWUobiA9PiBpc0J1aWx0aW5MaWJEVFMobi5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVUb0RlYnVnU3RyaW5nKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICBsZXQgZGVidWdTdHJpbmcgPSBgZmxhZ3M6MHgke3R5cGUuZmxhZ3MudG9TdHJpbmcoMTYpfWA7XG5cbiAgaWYgKHR5cGUuYWxpYXNTeW1ib2wpIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIGFsaWFzOiR7c3ltYm9sVG9EZWJ1Z1N0cmluZyh0eXBlLmFsaWFzU3ltYm9sKX1gO1xuICB9XG4gIGlmICh0eXBlLmFsaWFzVHlwZUFyZ3VtZW50cykge1xuICAgIGRlYnVnU3RyaW5nICs9IGAgYWxpYXNBcmdzOjwke3R5cGUuYWxpYXNUeXBlQXJndW1lbnRzLm1hcCh0eXBlVG9EZWJ1Z1N0cmluZykuam9pbignLCcpfT5gO1xuICB9XG5cbiAgLy8gSnVzdCB0aGUgdW5pcXVlIGZsYWdzIChwb3dlcnMgb2YgdHdvKS4gRGVjbGFyZWQgaW4gc3JjL2NvbXBpbGVyL3R5cGVzLnRzLlxuICBjb25zdCBiYXNpY1R5cGVzOiB0cy5UeXBlRmxhZ3NbXSA9IFtcbiAgICB0cy5UeXBlRmxhZ3MuQW55LCAgICAgICAgICAgdHMuVHlwZUZsYWdzLlN0cmluZywgICAgICAgICB0cy5UeXBlRmxhZ3MuTnVtYmVyLFxuICAgIHRzLlR5cGVGbGFncy5Cb29sZWFuLCAgICAgICB0cy5UeXBlRmxhZ3MuRW51bSwgICAgICAgICAgIHRzLlR5cGVGbGFncy5TdHJpbmdMaXRlcmFsLFxuICAgIHRzLlR5cGVGbGFncy5OdW1iZXJMaXRlcmFsLCB0cy5UeXBlRmxhZ3MuQm9vbGVhbkxpdGVyYWwsIHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbCxcbiAgICB0cy5UeXBlRmxhZ3MuRVNTeW1ib2wsICAgICAgdHMuVHlwZUZsYWdzLlZvaWQsICAgICAgICAgICB0cy5UeXBlRmxhZ3MuVW5kZWZpbmVkLFxuICAgIHRzLlR5cGVGbGFncy5OdWxsLCAgICAgICAgICB0cy5UeXBlRmxhZ3MuTmV2ZXIsICAgICAgICAgIHRzLlR5cGVGbGFncy5UeXBlUGFyYW1ldGVyLFxuICAgIHRzLlR5cGVGbGFncy5PYmplY3QsICAgICAgICB0cy5UeXBlRmxhZ3MuVW5pb24sICAgICAgICAgIHRzLlR5cGVGbGFncy5JbnRlcnNlY3Rpb24sXG4gICAgdHMuVHlwZUZsYWdzLkluZGV4LCAgICAgICAgIHRzLlR5cGVGbGFncy5JbmRleGVkQWNjZXNzLCAgdHMuVHlwZUZsYWdzLk5vblByaW1pdGl2ZSxcbiAgXTtcbiAgZm9yIChjb25zdCBmbGFnIG9mIGJhc2ljVHlwZXMpIHtcbiAgICBpZiAoKHR5cGUuZmxhZ3MgJiBmbGFnKSAhPT0gMCkge1xuICAgICAgZGVidWdTdHJpbmcgKz0gYCAke3RzLlR5cGVGbGFnc1tmbGFnXX1gO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlLmZsYWdzID09PSB0cy5UeXBlRmxhZ3MuT2JqZWN0KSB7XG4gICAgY29uc3Qgb2JqVHlwZSA9IHR5cGUgYXMgdHMuT2JqZWN0VHlwZTtcbiAgICAvLyBKdXN0IHRoZSB1bmlxdWUgZmxhZ3MgKHBvd2VycyBvZiB0d28pLiBEZWNsYXJlZCBpbiBzcmMvY29tcGlsZXIvdHlwZXMudHMuXG4gICAgY29uc3Qgb2JqZWN0RmxhZ3M6IHRzLk9iamVjdEZsYWdzW10gPSBbXG4gICAgICB0cy5PYmplY3RGbGFncy5DbGFzcyxcbiAgICAgIHRzLk9iamVjdEZsYWdzLkludGVyZmFjZSxcbiAgICAgIHRzLk9iamVjdEZsYWdzLlJlZmVyZW5jZSxcbiAgICAgIHRzLk9iamVjdEZsYWdzLlR1cGxlLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuQW5vbnltb3VzLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuTWFwcGVkLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuSW5zdGFudGlhdGVkLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuT2JqZWN0TGl0ZXJhbCxcbiAgICAgIHRzLk9iamVjdEZsYWdzLkV2b2x2aW5nQXJyYXksXG4gICAgICB0cy5PYmplY3RGbGFncy5PYmplY3RMaXRlcmFsUGF0dGVybldpdGhDb21wdXRlZFByb3BlcnRpZXMsXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IGZsYWcgb2Ygb2JqZWN0RmxhZ3MpIHtcbiAgICAgIGlmICgob2JqVHlwZS5vYmplY3RGbGFncyAmIGZsYWcpICE9PSAwKSB7XG4gICAgICAgIGRlYnVnU3RyaW5nICs9IGAgb2JqZWN0OiR7dHMuT2JqZWN0RmxhZ3NbZmxhZ119YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAodHlwZS5zeW1ib2wgJiYgdHlwZS5zeW1ib2wubmFtZSAhPT0gJ19fdHlwZScpIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIHN5bWJvbC5uYW1lOiR7SlNPTi5zdHJpbmdpZnkodHlwZS5zeW1ib2wubmFtZSl9YDtcbiAgfVxuXG4gIGlmICh0eXBlLnBhdHRlcm4pIHtcbiAgICBkZWJ1Z1N0cmluZyArPSBgIGRlc3RydWN0dXJpbmc6dHJ1ZWA7XG4gIH1cblxuICByZXR1cm4gYHt0eXBlICR7ZGVidWdTdHJpbmd9fWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW1ib2xUb0RlYnVnU3RyaW5nKHN5bTogdHMuU3ltYm9sKTogc3RyaW5nIHtcbiAgbGV0IGRlYnVnU3RyaW5nID0gYCR7SlNPTi5zdHJpbmdpZnkoc3ltLm5hbWUpfSBmbGFnczoweCR7c3ltLmZsYWdzLnRvU3RyaW5nKDE2KX1gO1xuXG4gIC8vIEp1c3QgdGhlIHVuaXF1ZSBmbGFncyAocG93ZXJzIG9mIHR3bykuIERlY2xhcmVkIGluIHNyYy9jb21waWxlci90eXBlcy50cy5cbiAgY29uc3Qgc3ltYm9sRmxhZ3MgPSBbXG4gICAgdHMuU3ltYm9sRmxhZ3MuRnVuY3Rpb25TY29wZWRWYXJpYWJsZSxcbiAgICB0cy5TeW1ib2xGbGFncy5CbG9ja1Njb3BlZFZhcmlhYmxlLFxuICAgIHRzLlN5bWJvbEZsYWdzLlByb3BlcnR5LFxuICAgIHRzLlN5bWJvbEZsYWdzLkVudW1NZW1iZXIsXG4gICAgdHMuU3ltYm9sRmxhZ3MuRnVuY3Rpb24sXG4gICAgdHMuU3ltYm9sRmxhZ3MuQ2xhc3MsXG4gICAgdHMuU3ltYm9sRmxhZ3MuSW50ZXJmYWNlLFxuICAgIHRzLlN5bWJvbEZsYWdzLkNvbnN0RW51bSxcbiAgICB0cy5TeW1ib2xGbGFncy5SZWd1bGFyRW51bSxcbiAgICB0cy5TeW1ib2xGbGFncy5WYWx1ZU1vZHVsZSxcbiAgICB0cy5TeW1ib2xGbGFncy5OYW1lc3BhY2VNb2R1bGUsXG4gICAgdHMuU3ltYm9sRmxhZ3MuVHlwZUxpdGVyYWwsXG4gICAgdHMuU3ltYm9sRmxhZ3MuT2JqZWN0TGl0ZXJhbCxcbiAgICB0cy5TeW1ib2xGbGFncy5NZXRob2QsXG4gICAgdHMuU3ltYm9sRmxhZ3MuQ29uc3RydWN0b3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuR2V0QWNjZXNzb3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuU2V0QWNjZXNzb3IsXG4gICAgdHMuU3ltYm9sRmxhZ3MuU2lnbmF0dXJlLFxuICAgIHRzLlN5bWJvbEZsYWdzLlR5cGVQYXJhbWV0ZXIsXG4gICAgdHMuU3ltYm9sRmxhZ3MuVHlwZUFsaWFzLFxuICAgIHRzLlN5bWJvbEZsYWdzLkV4cG9ydFZhbHVlLFxuICAgIHRzLlN5bWJvbEZsYWdzLkFsaWFzLFxuICAgIHRzLlN5bWJvbEZsYWdzLlByb3RvdHlwZSxcbiAgICB0cy5TeW1ib2xGbGFncy5FeHBvcnRTdGFyLFxuICAgIHRzLlN5bWJvbEZsYWdzLk9wdGlvbmFsLFxuICAgIHRzLlN5bWJvbEZsYWdzLlRyYW5zaWVudCxcbiAgXTtcbiAgZm9yIChjb25zdCBmbGFnIG9mIHN5bWJvbEZsYWdzKSB7XG4gICAgaWYgKChzeW0uZmxhZ3MgJiBmbGFnKSAhPT0gMCkge1xuICAgICAgZGVidWdTdHJpbmcgKz0gYCAke3RzLlN5bWJvbEZsYWdzW2ZsYWddfWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlYnVnU3RyaW5nO1xufVxuXG4vKiogVHlwZVRyYW5zbGF0b3IgdHJhbnNsYXRlcyBUeXBlU2NyaXB0IHR5cGVzIHRvIENsb3N1cmUgdHlwZXMuICovXG5leHBvcnQgY2xhc3MgVHlwZVRyYW5zbGF0b3Ige1xuICAvKipcbiAgICogQSBsaXN0IG9mIHR5cGUgbGl0ZXJhbHMgd2UndmUgZW5jb3VudGVyZWQgd2hpbGUgZW1pdHRpbmc7IHVzZWQgdG8gYXZvaWQgZ2V0dGluZyBzdHVjayBpblxuICAgKiByZWN1cnNpdmUgdHlwZXMuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHNlZW5Bbm9ueW1vdXNUeXBlcyA9IG5ldyBTZXQ8dHMuVHlwZT4oKTtcblxuICAvKipcbiAgICogV2hldGhlciB0byB3cml0ZSB0eXBlcyBzdWl0YWJsZSBmb3IgYW4gXFxAZXh0ZXJucyBmaWxlLiBFeHRlcm5zIHR5cGVzIG11c3Qgbm90IHJlZmVyIHRvXG4gICAqIG5vbi1leHRlcm5zIHR5cGVzIChpLmUuIG5vbiBhbWJpZW50IHR5cGVzKSBhbmQgbmVlZCB0byB1c2UgZnVsbHkgcXVhbGlmaWVkIG5hbWVzLlxuICAgKi9cbiAgaXNGb3JFeHRlcm5zID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBub2RlIGlzIHRoZSBzb3VyY2UgQVNUIHRzLk5vZGUgdGhlIHR5cGUgY29tZXMgZnJvbS4gIFRoaXMgaXMgdXNlZFxuICAgKiAgICAgaW4gc29tZSBjYXNlcyAoZS5nLiBhbm9ueW1vdXMgdHlwZXMpIGZvciBsb29raW5nIHVwIGZpZWxkIG5hbWVzLlxuICAgKiBAcGFyYW0gcGF0aEJsYWNrTGlzdCBpcyBhIHNldCBvZiBwYXRocyB0aGF0IHNob3VsZCBuZXZlciBnZXQgdHlwZWQ7XG4gICAqICAgICBhbnkgcmVmZXJlbmNlIHRvIHN5bWJvbHMgZGVmaW5lZCBpbiB0aGVzZSBwYXRocyBzaG91bGQgYnkgdHlwZWRcbiAgICogICAgIGFzIHs/fS5cbiAgICogQHBhcmFtIHN5bWJvbHNUb0FsaWFzZWROYW1lcyBhIG1hcHBpbmcgZnJvbSBzeW1ib2xzIChgRm9vYCkgdG8gYSBuYW1lIGluIHNjb3BlIHRoZXkgc2hvdWxkIGJlXG4gICAqICAgICBlbWl0dGVkIGFzIChlLmcuIGB0c2lja2xlX2ZvcndhcmRfZGVjbGFyZV8xLkZvb2ApLiBDYW4gYmUgYXVnbWVudGVkIGR1cmluZyB0eXBlXG4gICAqICAgICB0cmFuc2xhdGlvbiwgZS5nLiB0byBibGFja2xpc3QgYSBzeW1ib2wuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIHJlYWRvbmx5IG5vZGU6IHRzLk5vZGUsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IHBhdGhCbGFja0xpc3Q/OiBTZXQ8c3RyaW5nPixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgc3ltYm9sc1RvQWxpYXNlZE5hbWVzID0gbmV3IE1hcDx0cy5TeW1ib2wsIHN0cmluZz4oKSxcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgZW5zdXJlU3ltYm9sRGVjbGFyZWQ6IChzeW06IHRzLlN5bWJvbCkgPT4gdm9pZCA9ICgpID0+IHt9KSB7XG4gICAgLy8gTm9ybWFsaXplIHBhdGhzIHRvIG5vdCBicmVhayBjaGVja3Mgb24gV2luZG93cy5cbiAgICBpZiAodGhpcy5wYXRoQmxhY2tMaXN0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMucGF0aEJsYWNrTGlzdCA9XG4gICAgICAgICAgbmV3IFNldDxzdHJpbmc+KEFycmF5LmZyb20odGhpcy5wYXRoQmxhY2tMaXN0LnZhbHVlcygpKS5tYXAocCA9PiBwYXRoLm5vcm1hbGl6ZShwKSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHRzLlN5bWJvbCB0byBhIHN0cmluZy5cbiAgICogT3RoZXIgYXBwcm9hY2hlcyB0aGF0IGRvbid0IHdvcms6XG4gICAqIC0gVHlwZUNoZWNrZXIudHlwZVRvU3RyaW5nIHRyYW5zbGF0ZXMgQXJyYXkgYXMgVFtdLlxuICAgKiAtIFR5cGVDaGVja2VyLnN5bWJvbFRvU3RyaW5nIGVtaXRzIHR5cGVzIHdpdGhvdXQgdGhlaXIgbmFtZXNwYWNlLFxuICAgKiAgIGFuZCBkb2Vzbid0IGxldCB5b3UgcGFzcyB0aGUgZmxhZyB0byBjb250cm9sIHRoYXQuXG4gICAqIEBwYXJhbSB1c2VGcW4gd2hldGhlciB0byBzY29wZSB0aGUgbmFtZSB1c2luZyBpdHMgZnVsbHkgcXVhbGlmaWVkIG5hbWUuIENsb3N1cmUncyB0ZW1wbGF0ZVxuICAgKiAgICAgYXJndW1lbnRzIGFyZSBhbHdheXMgc2NvcGVkIHRvIHRoZSBjbGFzcyBjb250YWluaW5nIHRoZW0sIHdoZXJlIFR5cGVTY3JpcHQncyB0ZW1wbGF0ZSBhcmdzXG4gICAqICAgICB3b3VsZCBiZSBmdWxseSBxdWFsaWZpZWQuIEkuZS4gdGhpcyBmbGFnIGlzIGZhbHNlIGZvciBnZW5lcmljIHR5cGVzLlxuICAgKi9cbiAgc3ltYm9sVG9TdHJpbmcoc3ltOiB0cy5TeW1ib2wsIHVzZUZxbjogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgaWYgKHVzZUZxbiAmJiB0aGlzLmlzRm9yRXh0ZXJucykge1xuICAgICAgLy8gRm9yIHJlZ3VsYXIgdHlwZSBlbWl0LCB3ZSBjYW4gdXNlIFR5cGVTY3JpcHQncyBuYW1pbmcgcnVsZXMsIGFzIHRoZXkgbWF0Y2ggQ2xvc3VyZSdzIG5hbWVcbiAgICAgIC8vIHNjb3BpbmcgcnVsZXMuIEhvd2V2ZXIgd2hlbiBlbWl0dGluZyBleHRlcm5zIGZpbGVzIGZvciBhbWJpZW50cywgbmFtaW5nIHJ1bGVzIGNoYW5nZS4gQXNcbiAgICAgIC8vIENsb3N1cmUgZG9lc24ndCBzdXBwb3J0IGV4dGVybnMgbW9kdWxlcywgYWxsIG5hbWVzIG11c3QgYmUgZ2xvYmFsIGFuZCB1c2UgZ2xvYmFsIGZ1bGx5XG4gICAgICAvLyBxdWFsaWZpZWQgbmFtZXMuIFRoZSBjb2RlIGJlbG93IHVzZXMgVHlwZVNjcmlwdCB0byBjb252ZXJ0IGEgc3ltYm9sIHRvIGEgZnVsbCBxdWFsaWZpZWRcbiAgICAgIC8vIG5hbWUgYW5kIHRoZW4gZW1pdHMgdGhhdC5cbiAgICAgIGxldCBmcW4gPSB0aGlzLnR5cGVDaGVja2VyLmdldEZ1bGx5UXVhbGlmaWVkTmFtZShzeW0pO1xuICAgICAgaWYgKGZxbi5zdGFydHNXaXRoKGBcImApIHx8IGZxbi5zdGFydHNXaXRoKGAnYCkpIHtcbiAgICAgICAgLy8gUXVvdGVkIEZRTnMgbWVhbiB0aGUgbmFtZSBpcyBmcm9tIGEgbW9kdWxlLCBlLmcuIGAncGF0aC90by9tb2R1bGUnLnNvbWUucXVhbGlmaWVkLk5hbWVgLlxuICAgICAgICAvLyB0c2lja2xlIGdlbmVyYWxseSByZS1zY29wZXMgbmFtZXMgaW4gbW9kdWxlcyB0aGF0IGFyZSBtb3ZlZCB0byBleHRlcm5zIGludG8gdGhlIGdsb2JhbFxuICAgICAgICAvLyBuYW1lc3BhY2UuIFRoYXQgZG9lcyBub3QgcXVpdGUgbWF0Y2ggVFMnIHNlbWFudGljcyB3aGVyZSBhbWJpZW50IHR5cGVzIGZyb20gbW9kdWxlcyBhcmVcbiAgICAgICAgLy8gbG9jYWwuIEhvd2V2ZXIgdmFsdWUgZGVjbGFyYXRpb25zIHRoYXQgYXJlIGxvY2FsIHRvIG1vZHVsZXMgYnV0IG5vdCBkZWZpbmVkIGRvIG5vdCBtYWtlXG4gICAgICAgIC8vIHNlbnNlIGlmIG5vdCBnbG9iYWwsIGUuZy4gXCJkZWNsYXJlIGNsYXNzIFgge307IG5ldyBYKCk7XCIgY2Fubm90IHdvcmsgdW5sZXNzIGBYYCBpc1xuICAgICAgICAvLyBhY3R1YWxseSBhIGdsb2JhbC5cbiAgICAgICAgLy8gU28gdGhpcyBjb2RlIHN0cmlwcyB0aGUgbW9kdWxlIHBhdGggZnJvbSB0aGUgdHlwZSBhbmQgdXNlcyB0aGUgRlFOIGFzIGEgZ2xvYmFsLlxuICAgICAgICBmcW4gPSBmcW4ucmVwbGFjZSgvXltcIiddW15cIiddK1snXCJdXFwuLywgJycpO1xuICAgICAgfVxuICAgICAgLy8gRGVjbGFyYXRpb25zIGluIG1vZHVsZSBjYW4gcmUtb3BlbiBnbG9iYWwgdHlwZXMgdXNpbmcgXCJkZWNsYXJlIGdsb2JhbCB7IC4uLiB9XCIuIFRoZSBmcW5cbiAgICAgIC8vIHRoZW4gY29udGFpbnMgdGhlIHByZWZpeCBcImdsb2JhbC5cIiBoZXJlLiBBcyB3ZSdyZSBtYXBwaW5nIHRvIGdsb2JhbCB0eXBlcywganVzdCBzdHJpcCB0aGVcbiAgICAgIC8vIHByZWZpeC5cbiAgICAgIGNvbnN0IGlzSW5HbG9iYWwgPSAoc3ltLmRlY2xhcmF0aW9ucyB8fCBbXSkuc29tZShkID0+IHtcbiAgICAgICAgbGV0IGN1cnJlbnQ6IHRzLk5vZGV8dW5kZWZpbmVkID0gZDtcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICBpZiAoY3VycmVudC5mbGFncyAmIHRzLk5vZGVGbGFncy5HbG9iYWxBdWdtZW50YXRpb24pIHJldHVybiB0cnVlO1xuICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIGlmIChpc0luR2xvYmFsKSB7XG4gICAgICAgIGZxbiA9IGZxbi5yZXBsYWNlKC9eZ2xvYmFsXFwuLywgJycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc3RyaXBDbHV0ek5hbWVzcGFjZShmcW4pO1xuICAgIH1cbiAgICAvLyBUeXBlU2NyaXB0IHJlc29sdmVzIGUuZy4gdW5pb24gdHlwZXMgdG8gdGhlaXIgbWVtYmVycywgd2hpY2ggY2FuIGluY2x1ZGUgc3ltYm9scyBub3QgZGVjbGFyZWRcbiAgICAvLyBpbiB0aGUgY3VycmVudCBzY29wZS4gRW5zdXJlIHRoYXQgYWxsIHN5bWJvbHMgZm91bmQgdGhpcyB3YXkgYXJlIGFjdHVhbGx5IGRlY2xhcmVkLlxuICAgIC8vIFRoaXMgbXVzdCBoYXBwZW4gYmVmb3JlIHRoZSBhbGlhcyBjaGVjayBiZWxvdywgaXQgbWlnaHQgaW50cm9kdWNlIGEgbmV3IGFsaWFzIGZvciB0aGUgc3ltYm9sLlxuICAgIGlmICgoc3ltLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuVHlwZVBhcmFtZXRlcikgPT09IDApIHRoaXMuZW5zdXJlU3ltYm9sRGVjbGFyZWQoc3ltKTtcblxuICAgIC8vIFRoaXMgZm9sbG93cyBnZXRTaW5nbGVMaW5lU3RyaW5nV3JpdGVyIGluIHRoZSBUeXBlU2NyaXB0IGNvbXBpbGVyLlxuICAgIGxldCBzdHIgPSAnJztcbiAgICBmdW5jdGlvbiB3cml0ZVRleHQodGV4dDogc3RyaW5nKSB7XG4gICAgICBzdHIgKz0gdGV4dDtcbiAgICB9XG4gICAgY29uc3Qgd3JpdGVTeW1ib2wgPSAodGV4dDogc3RyaW5nLCBzeW1ib2w6IHRzLlN5bWJvbCkgPT4ge1xuICAgICAgLy8gV2hlbiB3cml0aW5nIGEgc3ltYm9sLCBjaGVjayBpZiB0aGVyZSBpcyBhbiBhbGlhcyBmb3IgaXQgaW4gdGhlIGN1cnJlbnQgc2NvcGUgdGhhdCBzaG91bGRcbiAgICAgIC8vIHRha2UgcHJlY2VkZW5jZSwgZS5nLiBmcm9tIGEgZ29vZy5mb3J3YXJkRGVjbGFyZS5cbiAgICAgIGlmIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgICAgICBzeW1ib2wgPSB0aGlzLnR5cGVDaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltYm9sKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5zeW1ib2xzVG9BbGlhc2VkTmFtZXMuZ2V0KHN5bWJvbCk7XG4gICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgLy8gSWYgc28sIGRpc2NhcmQgdGhlIGVudGlyZSBjdXJyZW50IHRleHQgYW5kIG9ubHkgdXNlIHRoZSBhbGlhcyAtIG90aGVyd2lzZSBpZiBhIHN5bWJvbCBoYXNcbiAgICAgICAgLy8gYSBsb2NhbCBhbGlhcyBidXQgYXBwZWFycyBpbiBhIGRvdHRlZCB0eXBlIHBhdGggKGUuZy4gd2hlbiBpdCdzIGltcG9ydGVkIHVzaW5nIGltcG9ydCAqXG4gICAgICAgIC8vIGFzIGZvbyksIHN0ciB3b3VsZCBjb250YWluIGJvdGggdGhlIHByZWZ4ICphbmQqIHRoZSBmdWxsIGFsaWFzIChmb28uYWxpYXMubmFtZSkuXG4gICAgICAgIHN0ciA9IGFsaWFzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyICs9IHRleHQ7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBkb05vdGhpbmcgPSAoKSA9PiB7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgIGNvbnN0IGJ1aWxkZXIgPSB0aGlzLnR5cGVDaGVja2VyLmdldFN5bWJvbERpc3BsYXlCdWlsZGVyKCk7XG4gICAgY29uc3Qgd3JpdGVyOiB0cy5TeW1ib2xXcml0ZXIgPSB7XG4gICAgICB3cml0ZVN5bWJvbCxcbiAgICAgIHdyaXRlS2V5d29yZDogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVPcGVyYXRvcjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVQdW5jdHVhdGlvbjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVTcGFjZTogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVTdHJpbmdMaXRlcmFsOiB3cml0ZVRleHQsXG4gICAgICB3cml0ZVBhcmFtZXRlcjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVQcm9wZXJ0eTogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVMaW5lOiBkb05vdGhpbmcsXG4gICAgICBpbmNyZWFzZUluZGVudDogZG9Ob3RoaW5nLFxuICAgICAgZGVjcmVhc2VJbmRlbnQ6IGRvTm90aGluZyxcbiAgICAgIGNsZWFyOiBkb05vdGhpbmcsXG4gICAgICB0cmFja1N5bWJvbChzeW1ib2w6IHRzLlN5bWJvbCwgZW5jbG9zaW5nRGVjbGFyYXRpb24/OiB0cy5Ob2RlLCBtZWFuaW5nPzogdHMuU3ltYm9sRmxhZ3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSxcbiAgICAgIHJlcG9ydEluYWNjZXNzaWJsZVRoaXNFcnJvcjogZG9Ob3RoaW5nLFxuICAgICAgcmVwb3J0UHJpdmF0ZUluQmFzZU9mQ2xhc3NFeHByZXNzaW9uOiBkb05vdGhpbmcsXG4gICAgfTtcbiAgICBidWlsZGVyLmJ1aWxkU3ltYm9sRGlzcGxheShzeW0sIHdyaXRlciwgdGhpcy5ub2RlKTtcbiAgICByZXR1cm4gdGhpcy5zdHJpcENsdXR6TmFtZXNwYWNlKHN0cik7XG4gIH1cblxuICAvLyBDbHV0eiAoaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY2x1dHopIGVtaXRzIGdsb2JhbCB0eXBlIHN5bWJvbHMgaGlkZGVuIGluIGEgc3BlY2lhbFxuICAvLyDgsqBf4LKgLmNsdXR6IG5hbWVzcGFjZS4gV2hpbGUgbW9zdCBjb2RlIHNlZW4gYnkgVHNpY2tsZSB3aWxsIG9ubHkgZXZlciBzZWUgbG9jYWwgYWxpYXNlcywgQ2x1dHpcbiAgLy8gc3ltYm9scyBjYW4gYmUgd3JpdHRlbiBieSB1c2VycyBkaXJlY3RseSBpbiBjb2RlLCBhbmQgdGhleSBjYW4gYXBwZWFyIGJ5IGRlcmVmZXJlbmNpbmdcbiAgLy8gVHlwZUFsaWFzZXMuIFRoZSBjb2RlIGJlbG93IHNpbXBseSBzdHJpcHMgdGhlIHByZWZpeCwgdGhlIHJlbWFpbmluZyB0eXBlIG5hbWUgdGhlbiBtYXRjaGVzXG4gIC8vIENsb3N1cmUncyB0eXBlLlxuICBwcml2YXRlIHN0cmlwQ2x1dHpOYW1lc3BhY2UobmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgn4LKgX+CyoC5jbHV0ei4nKSkgcmV0dXJuIG5hbWUuc3Vic3RyaW5nKCfgsqBf4LKgLmNsdXR6LicubGVuZ3RoKTtcbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuXG4gIHRyYW5zbGF0ZSh0eXBlOiB0cy5UeXBlLCByZXNvbHZlQWxpYXMgPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgLy8gTk9URTogVGhvdWdoIHR5cGUuZmxhZ3MgaGFzIHRoZSBuYW1lIFwiZmxhZ3NcIiwgaXQgdXN1YWxseSBjYW4gb25seSBiZSBvbmVcbiAgICAvLyBvZiB0aGUgZW51bSBvcHRpb25zIGF0IGEgdGltZSAoZXhjZXB0IGZvciB1bmlvbnMgb2YgbGl0ZXJhbCB0eXBlcywgZS5nLiB1bmlvbnMgb2YgYm9vbGVhblxuICAgIC8vIHZhbHVlcywgc3RyaW5nIHZhbHVlcywgZW51bSB2YWx1ZXMpLiBUaGlzIHN3aXRjaCBoYW5kbGVzIGFsbCB0aGUgY2FzZXMgaW4gdGhlIHRzLlR5cGVGbGFnc1xuICAgIC8vIGVudW0gaW4gdGhlIG9yZGVyIHRoZXkgb2NjdXIuXG5cbiAgICAvLyBOT1RFOiBTb21lIFR5cGVGbGFncyBhcmUgbWFya2VkIFwiaW50ZXJuYWxcIiBpbiB0aGUgZC50cyBidXQgc3RpbGwgc2hvdyB1cCBpbiB0aGUgdmFsdWUgb2ZcbiAgICAvLyB0eXBlLmZsYWdzLiBUaGlzIG1hc2sgbGltaXRzIHRoZSBmbGFnIGNoZWNrcyB0byB0aGUgb25lcyBpbiB0aGUgcHVibGljIEFQSS4gXCJsYXN0RmxhZ1wiIGhlcmVcbiAgICAvLyBpcyB0aGUgbGFzdCBmbGFnIGhhbmRsZWQgaW4gdGhpcyBzd2l0Y2ggc3RhdGVtZW50LCBhbmQgc2hvdWxkIGJlIGtlcHQgaW4gc3luYyB3aXRoXG4gICAgLy8gdHlwZXNjcmlwdC5kLnRzLlxuXG4gICAgLy8gTm9uUHJpbWl0aXZlIG9jY3VycyBvbiBpdHMgb3duIG9uIHRoZSBsb3dlciBjYXNlIFwib2JqZWN0XCIgdHlwZS4gU3BlY2lhbCBjYXNlIHRvIFwiIU9iamVjdFwiLlxuICAgIGlmICh0eXBlLmZsYWdzID09PSB0cy5UeXBlRmxhZ3MuTm9uUHJpbWl0aXZlKSByZXR1cm4gJyFPYmplY3QnO1xuXG4gICAgLy8gQXZvaWQgaW5maW5pdGUgbG9vcHMgb24gcmVjdXJzaXZlIHR5cGUgbGl0ZXJhbHMuXG4gICAgLy8gSXQgd291bGQgYmUgbmljZSB0byBqdXN0IGVtaXQgdGhlIG5hbWUgb2YgdGhlIHJlY3Vyc2l2ZSB0eXBlIGhlcmUgKGluIHR5cGUuYWxpYXNTeW1ib2xcbiAgICAvLyBiZWxvdyksIGJ1dCBDbG9zdXJlIENvbXBpbGVyIGRvZXMgbm90IGFsbG93IHJlY3Vyc2l2ZSB0eXBlIGRlZmluaXRpb25zLlxuICAgIGlmICh0aGlzLnNlZW5Bbm9ueW1vdXNUeXBlcy5oYXModHlwZSkpIHJldHVybiAnPyc7XG5cbiAgICAvLyBJZiB0eXBlIGlzIGFuIGFsaWFzLCBlLmcuIGZyb20gdHlwZSBYID0gQXxCLCB0aGVuIGFsd2F5cyBlbWl0IHRoZSBhbGlhcywgbm90IHRoZSB1bmRlcmx5aW5nXG4gICAgLy8gdW5pb24gdHlwZSwgYXMgdGhlIGFsaWFzIGlzIHRoZSB1c2VyIHZpc2libGUsIGltcG9ydGVkIHN5bWJvbC5cbiAgICBpZiAoIXJlc29sdmVBbGlhcyAmJiB0eXBlLmFsaWFzU3ltYm9sKSB7XG4gICAgICByZXR1cm4gdGhpcy5zeW1ib2xUb1N0cmluZyh0eXBlLmFsaWFzU3ltYm9sLCAvKiB1c2VGcW4gKi8gdHJ1ZSk7XG4gICAgfVxuXG4gICAgbGV0IGlzQW1iaWVudCA9IGZhbHNlO1xuICAgIGxldCBpc0luTmFtZXNwYWNlID0gZmFsc2U7XG4gICAgbGV0IGlzTW9kdWxlID0gZmFsc2U7XG4gICAgaWYgKHR5cGUuc3ltYm9sKSB7XG4gICAgICBmb3IgKGNvbnN0IGRlY2wgb2YgdHlwZS5zeW1ib2wuZGVjbGFyYXRpb25zIHx8IFtdKSB7XG4gICAgICAgIGlmICh0cy5pc0V4dGVybmFsTW9kdWxlKGRlY2wuZ2V0U291cmNlRmlsZSgpKSkgaXNNb2R1bGUgPSB0cnVlO1xuICAgICAgICBsZXQgY3VycmVudDogdHMuTm9kZXx1bmRlZmluZWQgPSBkZWNsO1xuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgIGlmICh0cy5nZXRDb21iaW5lZE1vZGlmaWVyRmxhZ3MoY3VycmVudCkgJiB0cy5Nb2RpZmllckZsYWdzLkFtYmllbnQpIGlzQW1iaWVudCA9IHRydWU7XG4gICAgICAgICAgaWYgKGN1cnJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbikgaXNJbk5hbWVzcGFjZSA9IHRydWU7XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdHNpY2tsZSBjYW5ub3QgZ2VuZXJhdGUgdHlwZXMgZm9yIG5vbi1hbWJpZW50IG5hbWVzcGFjZXMgbm9yIGFueSBzeW1ib2xzIGNvbnRhaW5lZCBpbiB0aGVtLlxuICAgIGlmIChpc0luTmFtZXNwYWNlICYmICFpc0FtYmllbnQpIHJldHVybiAnPyc7XG5cbiAgICAvLyBUeXBlcyBpbiBleHRlcm5zIGNhbm5vdCByZWZlcmVuY2UgdHlwZXMgZnJvbSBleHRlcm5hbCBtb2R1bGVzLlxuICAgIC8vIEhvd2V2ZXIgYW1iaWVudCB0eXBlcyBpbiBtb2R1bGVzIGdldCBtb3ZlZCB0byBleHRlcm5zLCB0b28sIHNvIHR5cGUgcmVmZXJlbmNlcyB3b3JrIGFuZCB3ZVxuICAgIC8vIGNhbiBlbWl0IGEgcHJlY2lzZSB0eXBlLlxuICAgIGlmICh0aGlzLmlzRm9yRXh0ZXJucyAmJiBpc01vZHVsZSAmJiAhaXNBbWJpZW50KSByZXR1cm4gJz8nO1xuXG4gICAgY29uc3QgbGFzdEZsYWcgPSB0cy5UeXBlRmxhZ3MuSW5kZXhlZEFjY2VzcztcbiAgICBjb25zdCBtYXNrID0gKGxhc3RGbGFnIDw8IDEpIC0gMTtcbiAgICBzd2l0Y2ggKHR5cGUuZmxhZ3MgJiBtYXNrKSB7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5Bbnk6XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5TdHJpbmc6XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5TdHJpbmdMaXRlcmFsOlxuICAgICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5OdW1iZXI6XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5OdW1iZXJMaXRlcmFsOlxuICAgICAgICByZXR1cm4gJ251bWJlcic7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5Cb29sZWFuOlxuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuQm9vbGVhbkxpdGVyYWw6XG4gICAgICAgIC8vIFNlZSB0aGUgbm90ZSBpbiB0cmFuc2xhdGVVbmlvbiBhYm91dCBib29sZWFucy5cbiAgICAgICAgcmV0dXJuICdib29sZWFuJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkVudW06XG4gICAgICAgIGlmICghdHlwZS5zeW1ib2wpIHtcbiAgICAgICAgICB0aGlzLndhcm4oYEVudW1UeXBlIHdpdGhvdXQgYSBzeW1ib2xgKTtcbiAgICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnN5bWJvbFRvU3RyaW5nKHR5cGUuc3ltYm9sLCB0cnVlKTtcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkVTU3ltYm9sOlxuICAgICAgICAvLyBOT1RFOiBjdXJyZW50bHkgdGhpcyBpcyBqdXN0IGEgdHlwZWRlZiBmb3Igez99LCBzaHJ1Zy5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL2Jsb2IvNTVjZjQzZWUzMWU4MGQ4OWQ3MDg3YWY2NWI1NTQyYWE2Mzk4Nzg3NC9leHRlcm5zL2VzMy5qcyNMMzRcbiAgICAgICAgcmV0dXJuICdzeW1ib2wnO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuVm9pZDpcbiAgICAgICAgcmV0dXJuICd2b2lkJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlVuZGVmaW5lZDpcbiAgICAgICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuTnVsbDpcbiAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk5ldmVyOlxuICAgICAgICB0aGlzLndhcm4oYHNob3VsZCBub3QgZW1pdCBhICduZXZlcicgdHlwZWApO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuVHlwZVBhcmFtZXRlcjpcbiAgICAgICAgLy8gVGhpcyBpcyBlLmcuIHRoZSBUIGluIGEgdHlwZSBsaWtlIEZvbzxUPi5cbiAgICAgICAgaWYgKCF0eXBlLnN5bWJvbCkge1xuICAgICAgICAgIHRoaXMud2FybihgVHlwZVBhcmFtZXRlciB3aXRob3V0IGEgc3ltYm9sYCk7ICAvLyBzaG91bGQgbm90IGhhcHBlbiAodG0pXG4gICAgICAgICAgcmV0dXJuICc/JztcbiAgICAgICAgfVxuICAgICAgICAvLyBJbiBDbG9zdXJlIENvbXBpbGVyLCB0eXBlIHBhcmFtZXRlcnMgKmFyZSogc2NvcGVkIHRvIHRoZWlyIGNvbnRhaW5pbmcgY2xhc3MuXG4gICAgICAgIGNvbnN0IHVzZUZxbiA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5zeW1ib2xUb1N0cmluZyh0eXBlLnN5bWJvbCwgdXNlRnFuKTtcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk9iamVjdDpcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlT2JqZWN0KHR5cGUgYXMgdHMuT2JqZWN0VHlwZSk7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5VbmlvbjpcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlVW5pb24odHlwZSBhcyB0cy5VbmlvblR5cGUpO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuSW50ZXJzZWN0aW9uOlxuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuSW5kZXg6XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5JbmRleGVkQWNjZXNzOlxuICAgICAgICAvLyBUT0RPKHRzMi4xKTogaGFuZGxlIHRoZXNlIHNwZWNpYWwgdHlwZXMuXG4gICAgICAgIHRoaXMud2FybihgdW5oYW5kbGVkIHR5cGUgZmxhZ3M6ICR7dHMuVHlwZUZsYWdzW3R5cGUuZmxhZ3NdfWApO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gSGFuZGxlIGNhc2VzIHdoZXJlIG11bHRpcGxlIGZsYWdzIGFyZSBzZXQuXG5cbiAgICAgICAgLy8gVHlwZXMgd2l0aCBsaXRlcmFsIG1lbWJlcnMgYXJlIHJlcHJlc2VudGVkIGFzXG4gICAgICAgIC8vICAgdHMuVHlwZUZsYWdzLlVuaW9uIHwgW2xpdGVyYWwgbWVtYmVyXVxuICAgICAgICAvLyBFLmcuIGFuIGVudW0gdHlwZWQgdmFsdWUgaXMgYSB1bmlvbiB0eXBlIHdpdGggdGhlIGVudW0ncyBtZW1iZXJzIGFzIGl0cyBtZW1iZXJzLiBBXG4gICAgICAgIC8vIGJvb2xlYW4gdHlwZSBpcyBhIHVuaW9uIHR5cGUgd2l0aCAndHJ1ZScgYW5kICdmYWxzZScgYXMgaXRzIG1lbWJlcnMuXG4gICAgICAgIC8vIE5vdGUgYWxzbyB0aGF0IGluIGEgbW9yZSBjb21wbGV4IHVuaW9uLCBlLmcuIGJvb2xlYW58bnVtYmVyLCB0aGVuIGl0J3MgYSB1bmlvbiBvZiB0aHJlZVxuICAgICAgICAvLyB0aGluZ3MgKHRydWV8ZmFsc2V8bnVtYmVyKSBhbmQgdHMuVHlwZUZsYWdzLkJvb2xlYW4gZG9lc24ndCBzaG93IHVwIGF0IGFsbC5cbiAgICAgICAgaWYgKHR5cGUuZmxhZ3MgJiB0cy5UeXBlRmxhZ3MuVW5pb24pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVVbmlvbih0eXBlIGFzIHRzLlVuaW9uVHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZS5mbGFncyAmIHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZUVudW1MaXRlcmFsKHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHN3aXRjaCBzdGF0ZW1lbnQgc2hvdWxkIGhhdmUgYmVlbiBleGhhdXN0aXZlLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gdHlwZSBmbGFncyAke3R5cGUuZmxhZ3N9IG9uICR7dHlwZVRvRGVidWdTdHJpbmcodHlwZSl9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB0cmFuc2xhdGVVbmlvbih0eXBlOiB0cy5VbmlvblR5cGUpOiBzdHJpbmcge1xuICAgIGxldCBwYXJ0cyA9IHR5cGUudHlwZXMubWFwKHQgPT4gdGhpcy50cmFuc2xhdGUodCkpO1xuICAgIC8vIFVuaW9uIHR5cGVzIHRoYXQgaW5jbHVkZSBsaXRlcmFscyAoZS5nLiBib29sZWFuLCBlbnVtKSBjYW4gZW5kIHVwIHJlcGVhdGluZyB0aGUgc2FtZSBDbG9zdXJlXG4gICAgLy8gdHlwZS4gRm9yIGV4YW1wbGU6IHRydWUgfCBib29sZWFuIHdpbGwgYmUgdHJhbnNsYXRlZCB0byBib29sZWFuIHwgYm9vbGVhbi5cbiAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyB0byBwcm9kdWNlIHR5cGVzIHRoYXQgcmVhZCBiZXR0ZXIuXG4gICAgcGFydHMgPSBwYXJ0cy5maWx0ZXIoKGVsLCBpZHgpID0+IHBhcnRzLmluZGV4T2YoZWwpID09PSBpZHgpO1xuICAgIHJldHVybiBwYXJ0cy5sZW5ndGggPT09IDEgPyBwYXJ0c1swXSA6IGAoJHtwYXJ0cy5qb2luKCd8Jyl9KWA7XG4gIH1cblxuICBwcml2YXRlIHRyYW5zbGF0ZUVudW1MaXRlcmFsKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICAgIC8vIFN1cHBvc2UgeW91IGhhZDpcbiAgICAvLyAgIGVudW0gRW51bVR5cGUgeyBNRU1CRVIgfVxuICAgIC8vIHRoZW4gdGhlIHR5cGUgb2YgXCJFbnVtVHlwZS5NRU1CRVJcIiBpcyBhbiBlbnVtIGxpdGVyYWwgKHRoZSB0aGluZyBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbilcbiAgICAvLyBhbmQgaXQgaGFzIHR5cGUgZmxhZ3MgdGhhdCBpbmNsdWRlXG4gICAgLy8gICB0cy5UeXBlRmxhZ3MuTnVtYmVyTGl0ZXJhbCB8IHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbFxuICAgIC8vXG4gICAgLy8gQ2xvc3VyZSBDb21waWxlciBkb2Vzbid0IHN1cHBvcnQgbGl0ZXJhbHMgaW4gdHlwZXMsIHNvIHRoaXMgY29kZSBtdXN0IG5vdCBlbWl0XG4gICAgLy8gXCJFbnVtVHlwZS5NRU1CRVJcIiwgYnV0IHJhdGhlciBcIkVudW1UeXBlXCIuXG5cbiAgICBjb25zdCBlbnVtTGl0ZXJhbEJhc2VUeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRCYXNlVHlwZU9mTGl0ZXJhbFR5cGUodHlwZSk7XG4gICAgaWYgKCFlbnVtTGl0ZXJhbEJhc2VUeXBlLnN5bWJvbCkge1xuICAgICAgdGhpcy53YXJuKGBFbnVtTGl0ZXJhbFR5cGUgd2l0aG91dCBhIHN5bWJvbGApO1xuICAgICAgcmV0dXJuICc/JztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3ltYm9sVG9TdHJpbmcoZW51bUxpdGVyYWxCYXNlVHlwZS5zeW1ib2wsIHRydWUpO1xuICB9XG5cbiAgLy8gdHJhbnNsYXRlT2JqZWN0IHRyYW5zbGF0ZXMgYSB0cy5PYmplY3RUeXBlLCB3aGljaCBpcyB0aGUgdHlwZSBvZiBhbGxcbiAgLy8gb2JqZWN0LWxpa2UgdGhpbmdzIGluIFRTLCBzdWNoIGFzIGNsYXNzZXMgYW5kIGludGVyZmFjZXMuXG4gIHByaXZhdGUgdHJhbnNsYXRlT2JqZWN0KHR5cGU6IHRzLk9iamVjdFR5cGUpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlLnN5bWJvbCAmJiB0aGlzLmlzQmxhY2tMaXN0ZWQodHlwZS5zeW1ib2wpKSByZXR1cm4gJz8nO1xuXG4gICAgLy8gTk9URTogb2JqZWN0RmxhZ3MgaXMgYW4gZW51bSwgYnV0IGEgZ2l2ZW4gdHlwZSBjYW4gaGF2ZSBtdWx0aXBsZSBmbGFncy5cbiAgICAvLyBBcnJheTxzdHJpbmc+IGlzIGJvdGggdHMuT2JqZWN0RmxhZ3MuUmVmZXJlbmNlIGFuZCB0cy5PYmplY3RGbGFncy5JbnRlcmZhY2UuXG5cbiAgICBpZiAodHlwZS5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLkNsYXNzKSB7XG4gICAgICBpZiAoIXR5cGUuc3ltYm9sKSB7XG4gICAgICAgIHRoaXMud2FybignY2xhc3MgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuICAgICAgcmV0dXJuICchJyArIHRoaXMuc3ltYm9sVG9TdHJpbmcodHlwZS5zeW1ib2wsIC8qIHVzZUZxbiAqLyB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUub2JqZWN0RmxhZ3MgJiB0cy5PYmplY3RGbGFncy5JbnRlcmZhY2UpIHtcbiAgICAgIC8vIE5vdGU6IHRzLkludGVyZmFjZVR5cGUgaGFzIGEgdHlwZVBhcmFtZXRlcnMgZmllbGQsIGJ1dCB0aGF0XG4gICAgICAvLyBzcGVjaWZpZXMgdGhlIHBhcmFtZXRlcnMgdGhhdCB0aGUgaW50ZXJmYWNlIHR5cGUgKmV4cGVjdHMqXG4gICAgICAvLyB3aGVuIGl0J3MgdXNlZCwgYW5kIHNob3VsZCBub3QgYmUgdHJhbnNmb3JtZWQgdG8gdGhlIG91dHB1dC5cbiAgICAgIC8vIEUuZy4gYSB0eXBlIGxpa2UgQXJyYXk8bnVtYmVyPiBpcyBhIFR5cGVSZWZlcmVuY2UgdG8gdGhlXG4gICAgICAvLyBJbnRlcmZhY2VUeXBlIFwiQXJyYXlcIiwgYnV0IHRoZSBcIm51bWJlclwiIHR5cGUgcGFyYW1ldGVyIGlzXG4gICAgICAvLyBwYXJ0IG9mIHRoZSBvdXRlciBUeXBlUmVmZXJlbmNlLCBub3QgYSB0eXBlUGFyYW1ldGVyIG9uXG4gICAgICAvLyB0aGUgSW50ZXJmYWNlVHlwZS5cbiAgICAgIGlmICghdHlwZS5zeW1ib2wpIHtcbiAgICAgICAgdGhpcy53YXJuKCdpbnRlcmZhY2UgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUuc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuVmFsdWUpIHtcbiAgICAgICAgLy8gVGhlIHN5bWJvbCBpcyBib3RoIGEgdHlwZSBhbmQgYSB2YWx1ZS5cbiAgICAgICAgLy8gRm9yIHVzZXItZGVmaW5lZCB0eXBlcyBpbiB0aGlzIHN0YXRlLCB3ZSBkb24ndCBoYXZlIGEgQ2xvc3VyZSBuYW1lXG4gICAgICAgIC8vIGZvciB0aGUgdHlwZS4gIFNlZSB0aGUgdHlwZV9hbmRfdmFsdWUgdGVzdC5cbiAgICAgICAgaWYgKCFpc0Nsb3N1cmVQcm92aWRlZFR5cGUodHlwZS5zeW1ib2wpKSB7XG4gICAgICAgICAgdGhpcy53YXJuKGB0eXBlL3N5bWJvbCBjb25mbGljdCBmb3IgJHt0eXBlLnN5bWJvbC5uYW1lfSwgdXNpbmcgez99IGZvciBub3dgKTtcbiAgICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJyEnICsgdGhpcy5zeW1ib2xUb1N0cmluZyh0eXBlLnN5bWJvbCwgLyogdXNlRnFuICovIHRydWUpO1xuICAgIH0gZWxzZSBpZiAodHlwZS5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLlJlZmVyZW5jZSkge1xuICAgICAgLy8gQSByZWZlcmVuY2UgdG8gYW5vdGhlciB0eXBlLCBlLmcuIEFycmF5PG51bWJlcj4gcmVmZXJzIHRvIEFycmF5LlxuICAgICAgLy8gRW1pdCB0aGUgcmVmZXJlbmNlZCB0eXBlIGFuZCBhbnkgdHlwZSBhcmd1bWVudHMuXG4gICAgICBjb25zdCByZWZlcmVuY2VUeXBlID0gdHlwZSBhcyB0cy5UeXBlUmVmZXJlbmNlO1xuXG4gICAgICAvLyBBIHR1cGxlIGlzIGEgUmVmZXJlbmNlVHlwZSB3aGVyZSB0aGUgdGFyZ2V0IGlzIGZsYWdnZWQgVHVwbGUgYW5kIHRoZVxuICAgICAgLy8gdHlwZUFyZ3VtZW50cyBhcmUgdGhlIHR1cGxlIGFyZ3VtZW50cy4gIEp1c3QgdHJlYXQgaXQgYXMgYSBteXN0ZXJ5XG4gICAgICAvLyBhcnJheSwgYmVjYXVzZSBDbG9zdXJlIGRvZXNuJ3QgdW5kZXJzdGFuZCB0dXBsZXMuXG4gICAgICBpZiAocmVmZXJlbmNlVHlwZS50YXJnZXQub2JqZWN0RmxhZ3MgJiB0cy5PYmplY3RGbGFncy5UdXBsZSkge1xuICAgICAgICByZXR1cm4gJyFBcnJheTw/Pic7XG4gICAgICB9XG5cbiAgICAgIGxldCB0eXBlU3RyID0gJyc7XG4gICAgICBpZiAocmVmZXJlbmNlVHlwZS50YXJnZXQgPT09IHJlZmVyZW5jZVR5cGUpIHtcbiAgICAgICAgLy8gV2UgZ2V0IGludG8gYW4gaW5maW5pdGUgbG9vcCBoZXJlIGlmIHRoZSBpbm5lciByZWZlcmVuY2UgaXNcbiAgICAgICAgLy8gdGhlIHNhbWUgYXMgdGhlIG91dGVyOyB0aGlzIGNhbiBvY2N1ciB3aGVuIHRoaXMgZnVuY3Rpb25cbiAgICAgICAgLy8gZmFpbHMgdG8gdHJhbnNsYXRlIGEgbW9yZSBzcGVjaWZpYyB0eXBlIGJlZm9yZSBnZXR0aW5nIHRvXG4gICAgICAgIC8vIHRoaXMgcG9pbnQuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGByZWZlcmVuY2UgbG9vcCBpbiAke3R5cGVUb0RlYnVnU3RyaW5nKHJlZmVyZW5jZVR5cGUpfSAke3JlZmVyZW5jZVR5cGUuZmxhZ3N9YCk7XG4gICAgICB9XG4gICAgICB0eXBlU3RyICs9IHRoaXMudHJhbnNsYXRlKHJlZmVyZW5jZVR5cGUudGFyZ2V0KTtcbiAgICAgIC8vIFRyYW5zbGF0ZSBjYW4gcmV0dXJuICc/JyBmb3IgYSBudW1iZXIgb2Ygc2l0dWF0aW9ucywgZS5nLiB0eXBlL3ZhbHVlIGNvbmZsaWN0cy5cbiAgICAgIC8vIGA/PD8+YCBpcyBpbGxlZ2FsIHN5bnRheCBpbiBDbG9zdXJlIENvbXBpbGVyLCBzbyBqdXN0IHJldHVybiBgP2AgaGVyZS5cbiAgICAgIGlmICh0eXBlU3RyID09PSAnPycpIHJldHVybiAnPyc7XG4gICAgICBpZiAocmVmZXJlbmNlVHlwZS50eXBlQXJndW1lbnRzKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHJlZmVyZW5jZVR5cGUudHlwZUFyZ3VtZW50cy5tYXAodCA9PiB0aGlzLnRyYW5zbGF0ZSh0KSk7XG4gICAgICAgIHR5cGVTdHIgKz0gYDwke3BhcmFtcy5qb2luKCcsICcpfT5gO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHR5cGVTdHI7XG4gICAgfSBlbHNlIGlmICh0eXBlLm9iamVjdEZsYWdzICYgdHMuT2JqZWN0RmxhZ3MuQW5vbnltb3VzKSB7XG4gICAgICBpZiAoIXR5cGUuc3ltYm9sKSB7XG4gICAgICAgIC8vIFRoaXMgY29tZXMgdXAgd2hlbiBnZW5lcmF0aW5nIGNvZGUgZm9yIGFuIGFycm93IGZ1bmN0aW9uIGFzIHBhc3NlZFxuICAgICAgICAvLyB0byBhIGdlbmVyaWMgZnVuY3Rpb24uICBUaGUgcGFzc2VkLWluIHR5cGUgaXMgdGFnZ2VkIGFzIGFub255bW91c1xuICAgICAgICAvLyBhbmQgaGFzIG5vIHByb3BlcnRpZXMgc28gaXQncyBoYXJkIHRvIGZpZ3VyZSBvdXQgd2hhdCB0byBnZW5lcmF0ZS5cbiAgICAgICAgLy8gSnVzdCBhdm9pZCBpdCBmb3Igbm93IHNvIHdlIGRvbid0IGNyYXNoLlxuICAgICAgICB0aGlzLndhcm4oJ2Fub255bW91cyB0eXBlIGhhcyBubyBzeW1ib2wnKTtcbiAgICAgICAgcmV0dXJuICc/JztcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUuc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuRnVuY3Rpb24gfHxcbiAgICAgICAgICB0eXBlLnN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLk1ldGhvZCkge1xuICAgICAgICBjb25zdCBzaWdzID0gdGhpcy50eXBlQ2hlY2tlci5nZXRTaWduYXR1cmVzT2ZUeXBlKHR5cGUsIHRzLlNpZ25hdHVyZUtpbmQuQ2FsbCk7XG4gICAgICAgIGlmIChzaWdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNpZ25hdHVyZVRvQ2xvc3VyZShzaWdzWzBdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndhcm4oJ3VuaGFuZGxlZCBhbm9ueW1vdXMgdHlwZSB3aXRoIG11bHRpcGxlIGNhbGwgc2lnbmF0dXJlcycpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlQW5vbnltb3VzVHlwZSh0eXBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgIFRPRE8odHMyLjEpOiBtb3JlIHVuaGFuZGxlZCBvYmplY3QgdHlwZSBmbGFnczpcbiAgICAgIFR1cGxlXG4gICAgICBNYXBwZWRcbiAgICAgIEluc3RhbnRpYXRlZFxuICAgICAgT2JqZWN0TGl0ZXJhbFxuICAgICAgRXZvbHZpbmdBcnJheVxuICAgICAgT2JqZWN0TGl0ZXJhbFBhdHRlcm5XaXRoQ29tcHV0ZWRQcm9wZXJ0aWVzXG4gICAgKi9cbiAgICB0aGlzLndhcm4oYHVuaGFuZGxlZCB0eXBlICR7dHlwZVRvRGVidWdTdHJpbmcodHlwZSl9YCk7XG4gICAgcmV0dXJuICc/JztcbiAgfVxuXG4gIC8qKlxuICAgKiB0cmFuc2xhdGVBbm9ueW1vdXNUeXBlIHRyYW5zbGF0ZXMgYSB0cy5UeXBlRmxhZ3MuT2JqZWN0VHlwZSB0aGF0IGlzIGFsc29cbiAgICogdHMuT2JqZWN0RmxhZ3MuQW5vbnltb3VzLiBUaGF0IGlzLCB0aGlzIHR5cGUncyBzeW1ib2wgZG9lcyBub3QgaGF2ZSBhIG5hbWUuIFRoaXMgaXMgdGhlXG4gICAqIGFub255bW91cyB0eXBlIGVuY291bnRlcmVkIGluIGUuZy5cbiAgICogICAgIGxldCB4OiB7YTogbnVtYmVyfTtcbiAgICogQnV0IGFsc28gdGhlIGluZmVycmVkIHR5cGUgaW46XG4gICAqICAgICBsZXQgeCA9IHthOiAxfTsgIC8vIHR5cGUgb2YgeCBpcyB7YTogbnVtYmVyfSwgYXMgYWJvdmVcbiAgICovXG4gIHByaXZhdGUgdHJhbnNsYXRlQW5vbnltb3VzVHlwZSh0eXBlOiB0cy5UeXBlKTogc3RyaW5nIHtcbiAgICB0aGlzLnNlZW5Bbm9ueW1vdXNUeXBlcy5hZGQodHlwZSk7XG4gICAgLy8gR2F0aGVyIHVwIGFsbCB0aGUgbmFtZWQgZmllbGRzIGFuZCB3aGV0aGVyIHRoZSBvYmplY3QgaXMgYWxzbyBjYWxsYWJsZS5cbiAgICBsZXQgY2FsbGFibGUgPSBmYWxzZTtcbiAgICBsZXQgaW5kZXhhYmxlID0gZmFsc2U7XG4gICAgY29uc3QgZmllbGRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGlmICghdHlwZS5zeW1ib2wgfHwgIXR5cGUuc3ltYm9sLm1lbWJlcnMpIHtcbiAgICAgIHRoaXMud2FybignYW5vbnltb3VzIHR5cGUgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgcmV0dXJuICc/JztcbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsLWNhc2UgY29uc3RydWN0IHNpZ25hdHVyZXMuXG4gICAgY29uc3QgY3RvcnMgPSB0eXBlLmdldENvbnN0cnVjdFNpZ25hdHVyZXMoKTtcbiAgICBpZiAoY3RvcnMubGVuZ3RoKSB7XG4gICAgICAvLyBUT0RPKG1hcnRpbnByb2JzdCk6IHRoaXMgZG9lcyBub3Qgc3VwcG9ydCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgZGVmaW5lZCBvbiBjb25zdHJ1Y3RvcnNcbiAgICAgIC8vIChub3QgZXhwcmVzc2libGUgaW4gQ2xvc3VyZSksIG5vciBtdWx0aXBsZSBjb25zdHJ1Y3RvcnMgKHNhbWUpLlxuICAgICAgY29uc3QgZGVjbCA9IGN0b3JzWzBdLmRlY2xhcmF0aW9uO1xuICAgICAgaWYgKCFkZWNsKSB7XG4gICAgICAgIHRoaXMud2FybigndW5oYW5kbGVkIGFub255bW91cyB0eXBlIHdpdGggY29uc3RydWN0b3Igc2lnbmF0dXJlIGJ1dCBubyBkZWNsYXJhdGlvbicpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuICAgICAgaWYgKGRlY2wua2luZCA9PT0gdHMuU3ludGF4S2luZEpTRG9jU2lnbmF0dXJlKSB7XG4gICAgICAgIHRoaXMud2FybigndW5oYW5kbGVkIEpTRG9jIGJhc2VkIGNvbnN0cnVjdG9yIHNpZ25hdHVyZScpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5jb252ZXJ0UGFyYW1zKGN0b3JzWzBdLCBkZWNsLnBhcmFtZXRlcnMpO1xuICAgICAgY29uc3QgcGFyYW1zU3RyID0gcGFyYW1zLmxlbmd0aCA/ICgnLCAnICsgcGFyYW1zLmpvaW4oJywgJykpIDogJyc7XG4gICAgICBjb25zdCBjb25zdHJ1Y3RlZFR5cGUgPSB0aGlzLnRyYW5zbGF0ZShjdG9yc1swXS5nZXRSZXR1cm5UeXBlKCkpO1xuICAgICAgLy8gSW4gdGhlIHNwZWNpZmljIGNhc2Ugb2YgdGhlIFwibmV3XCIgaW4gYSBmdW5jdGlvbiwgaXQgYXBwZWFycyB0aGF0XG4gICAgICAvLyAgIGZ1bmN0aW9uKG5ldzogIUJhcilcbiAgICAgIC8vIGZhaWxzIHRvIHBhcnNlLCB3aGlsZVxuICAgICAgLy8gICBmdW5jdGlvbihuZXc6ICghQmFyKSlcbiAgICAgIC8vIHBhcnNlcyBpbiB0aGUgd2F5IHlvdSdkIGV4cGVjdC5cbiAgICAgIC8vIEl0IGFwcGVhcnMgZnJvbSB0ZXN0aW5nIHRoYXQgQ2xvc3VyZSBpZ25vcmVzIHRoZSAhIGFueXdheSBhbmQganVzdFxuICAgICAgLy8gYXNzdW1lcyB0aGUgcmVzdWx0IHdpbGwgYmUgbm9uLW51bGwgaW4gZWl0aGVyIGNhc2UuICAoVG8gYmUgcGVkYW50aWMsXG4gICAgICAvLyBpdCdzIHBvc3NpYmxlIHRvIHJldHVybiBudWxsIGZyb20gYSBjdG9yIGl0IHNlZW1zIGxpa2UgYSBiYWQgaWRlYS4pXG4gICAgICByZXR1cm4gYGZ1bmN0aW9uKG5ldzogKCR7Y29uc3RydWN0ZWRUeXBlfSkke3BhcmFtc1N0cn0pOiA/YDtcbiAgICB9XG5cbiAgICAvLyBtZW1iZXJzIGlzIGFuIEVTNiBtYXAsIGJ1dCB0aGUgLmQudHMgZGVmaW5pbmcgaXQgZGVmaW5lZCB0aGVpciBvd24gbWFwXG4gICAgLy8gdHlwZSwgc28gdHlwZXNjcmlwdCBkb2Vzbid0IGJlbGlldmUgdGhhdCAua2V5cygpIGlzIGl0ZXJhYmxlXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgIGZvciAoY29uc3QgZmllbGQgb2YgKHR5cGUuc3ltYm9sLm1lbWJlcnMua2V5cygpIGFzIGFueSkpIHtcbiAgICAgIHN3aXRjaCAoZmllbGQpIHtcbiAgICAgICAgY2FzZSAnX19jYWxsJzpcbiAgICAgICAgICBjYWxsYWJsZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ19faW5kZXgnOlxuICAgICAgICAgIGluZGV4YWJsZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc3QgbWVtYmVyID0gdHlwZS5zeW1ib2wubWVtYmVycy5nZXQoZmllbGQpITtcbiAgICAgICAgICAvLyBvcHRpb25hbCBtZW1iZXJzIGFyZSBoYW5kbGVkIGJ5IHRoZSB0eXBlIGluY2x1ZGluZyB8dW5kZWZpbmVkIGluIGEgdW5pb24gdHlwZS5cbiAgICAgICAgICBjb25zdCBtZW1iZXJUeXBlID1cbiAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUodGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlT2ZTeW1ib2xBdExvY2F0aW9uKG1lbWJlciwgdGhpcy5ub2RlKSk7XG4gICAgICAgICAgZmllbGRzLnB1c2goYCR7ZmllbGR9OiAke21lbWJlclR5cGV9YCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVHJ5IHRvIHNwZWNpYWwtY2FzZSBwbGFpbiBrZXktdmFsdWUgb2JqZWN0cyBhbmQgZnVuY3Rpb25zLlxuICAgIGlmIChmaWVsZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBpZiAoY2FsbGFibGUgJiYgIWluZGV4YWJsZSkge1xuICAgICAgICAvLyBBIGZ1bmN0aW9uIHR5cGUuXG4gICAgICAgIGNvbnN0IHNpZ3MgPSB0aGlzLnR5cGVDaGVja2VyLmdldFNpZ25hdHVyZXNPZlR5cGUodHlwZSwgdHMuU2lnbmF0dXJlS2luZC5DYWxsKTtcbiAgICAgICAgaWYgKHNpZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2lnbmF0dXJlVG9DbG9zdXJlKHNpZ3NbMF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGluZGV4YWJsZSAmJiAhY2FsbGFibGUpIHtcbiAgICAgICAgLy8gQSBwbGFpbiBrZXktdmFsdWUgbWFwIHR5cGUuXG4gICAgICAgIGxldCBrZXlUeXBlID0gJ3N0cmluZyc7XG4gICAgICAgIGxldCB2YWxUeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRJbmRleFR5cGVPZlR5cGUodHlwZSwgdHMuSW5kZXhLaW5kLlN0cmluZyk7XG4gICAgICAgIGlmICghdmFsVHlwZSkge1xuICAgICAgICAgIGtleVR5cGUgPSAnbnVtYmVyJztcbiAgICAgICAgICB2YWxUeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRJbmRleFR5cGVPZlR5cGUodHlwZSwgdHMuSW5kZXhLaW5kLk51bWJlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWxUeXBlKSB7XG4gICAgICAgICAgdGhpcy53YXJuKCd1bmtub3duIGluZGV4IGtleSB0eXBlJyk7XG4gICAgICAgICAgcmV0dXJuIGAhT2JqZWN0PD8sPz5gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgIU9iamVjdDwke2tleVR5cGV9LCR7dGhpcy50cmFuc2xhdGUodmFsVHlwZSl9PmA7XG4gICAgICB9IGVsc2UgaWYgKCFjYWxsYWJsZSAmJiAhaW5kZXhhYmxlKSB7XG4gICAgICAgIC8vIFNwZWNpYWwtY2FzZSB0aGUgZW1wdHkgb2JqZWN0IHt9IGJlY2F1c2UgQ2xvc3VyZSBkb2Vzbid0IGxpa2UgaXQuXG4gICAgICAgIC8vIFRPRE8oZXZhbm0pOiByZXZpc2l0IHRoaXMgaWYgaXQgaXMgYSBwcm9ibGVtLlxuICAgICAgICByZXR1cm4gJyFPYmplY3QnO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghY2FsbGFibGUgJiYgIWluZGV4YWJsZSkge1xuICAgICAgLy8gTm90IGNhbGxhYmxlLCBub3QgaW5kZXhhYmxlOyBpbXBsaWVzIGEgcGxhaW4gb2JqZWN0IHdpdGggZmllbGRzIGluIGl0LlxuICAgICAgcmV0dXJuIGB7JHtmaWVsZHMuam9pbignLCAnKX19YDtcbiAgICB9XG5cbiAgICB0aGlzLndhcm4oJ3VuaGFuZGxlZCBhbm9ueW1vdXMgdHlwZScpO1xuICAgIHJldHVybiAnPyc7XG4gIH1cblxuICAvKiogQ29udmVydHMgYSB0cy5TaWduYXR1cmUgKGZ1bmN0aW9uIHNpZ25hdHVyZSkgdG8gYSBDbG9zdXJlIGZ1bmN0aW9uIHR5cGUuICovXG4gIHByaXZhdGUgc2lnbmF0dXJlVG9DbG9zdXJlKHNpZzogdHMuU2lnbmF0dXJlKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPKG1hcnRpbnByb2JzdCk6IENvbnNpZGVyIGhhcm1vbml6aW5nIHNvbWUgb3ZlcmxhcCB3aXRoIGVtaXRGdW5jdGlvblR5cGUgaW4gdHNpY2tsZS50cy5cbiAgICBpZiAoIXNpZy5kZWNsYXJhdGlvbikge1xuICAgICAgdGhpcy53YXJuKCdzaWduYXR1cmUgd2l0aG91dCBkZWNsYXJhdGlvbicpO1xuICAgICAgcmV0dXJuICdGdW5jdGlvbic7XG4gICAgfVxuICAgIGlmIChzaWcuZGVjbGFyYXRpb24ua2luZCA9PT0gdHMuU3ludGF4S2luZEpTRG9jU2lnbmF0dXJlKSB7XG4gICAgICB0aGlzLndhcm4oJ3NpZ25hdHVyZSB3aXRoIEpTRG9jIGRlY2xhcmF0aW9uJyk7XG4gICAgICByZXR1cm4gJ0Z1bmN0aW9uJztcbiAgICB9XG4gICAgdGhpcy5ibGFja2xpc3RUeXBlUGFyYW1ldGVycyh0aGlzLnN5bWJvbHNUb0FsaWFzZWROYW1lcywgc2lnLmRlY2xhcmF0aW9uLnR5cGVQYXJhbWV0ZXJzKTtcblxuICAgIGxldCB0eXBlU3RyID0gYGZ1bmN0aW9uKGA7XG4gICAgbGV0IHBhcmFtRGVjbHM6IFJlYWRvbmx5QXJyYXk8dHMuUGFyYW1ldGVyRGVjbGFyYXRpb24+ID0gc2lnLmRlY2xhcmF0aW9uLnBhcmFtZXRlcnMgfHwgW107XG4gICAgY29uc3QgbWF5YmVUaGlzUGFyYW0gPSBwYXJhbURlY2xzWzBdO1xuICAgIC8vIE9kZGx5LCB0aGUgdGhpcyB0eXBlIHNob3dzIHVwIGluIHBhcmFtRGVjbHMsIGJ1dCBub3QgaW4gdGhlIHR5cGUncyBwYXJhbWV0ZXJzLlxuICAgIC8vIEhhbmRsZSBpdCBoZXJlIGFuZCB0aGVuIHBhc3MgcGFyYW1EZWNscyBkb3duIHdpdGhvdXQgaXRzIGZpcnN0IGVsZW1lbnQuXG4gICAgaWYgKG1heWJlVGhpc1BhcmFtICYmIG1heWJlVGhpc1BhcmFtLm5hbWUuZ2V0VGV4dCgpID09PSAndGhpcycpIHtcbiAgICAgIGlmIChtYXliZVRoaXNQYXJhbS50eXBlKSB7XG4gICAgICAgIGNvbnN0IHRoaXNUeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihtYXliZVRoaXNQYXJhbS50eXBlKTtcbiAgICAgICAgdHlwZVN0ciArPSBgdGhpczogKCR7dGhpcy50cmFuc2xhdGUodGhpc1R5cGUpfSlgO1xuICAgICAgICBpZiAocGFyYW1EZWNscy5sZW5ndGggPiAxKSB0eXBlU3RyICs9ICcsICc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhcm4oJ3RoaXMgdHlwZSB3aXRob3V0IHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIHBhcmFtRGVjbHMgPSBwYXJhbURlY2xzLnNsaWNlKDEpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuY29udmVydFBhcmFtcyhzaWcsIHBhcmFtRGVjbHMpO1xuICAgIHR5cGVTdHIgKz0gYCR7cGFyYW1zLmpvaW4oJywgJyl9KWA7XG5cbiAgICBjb25zdCByZXRUeXBlID0gdGhpcy50cmFuc2xhdGUodGhpcy50eXBlQ2hlY2tlci5nZXRSZXR1cm5UeXBlT2ZTaWduYXR1cmUoc2lnKSk7XG4gICAgaWYgKHJldFR5cGUpIHtcbiAgICAgIHR5cGVTdHIgKz0gYDogJHtyZXRUeXBlfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cGVTdHI7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgcGFyYW1ldGVycyBmb3IgdGhlIGdpdmVuIHNpZ25hdHVyZS4gVGFrZXMgcGFyYW1ldGVyIGRlY2xhcmF0aW9ucyBhcyB0aG9zZSBtaWdodCBub3RcbiAgICogbWF0Y2ggdGhlIHNpZ25hdHVyZSBwYXJhbWV0ZXJzIChlLmcuIHRoZXJlIG1pZ2h0IGJlIGFuIGFkZGl0aW9uYWwgdGhpcyBwYXJhbWV0ZXIpLiBUaGlzXG4gICAqIGRpZmZlcmVuY2UgaXMgaGFuZGxlZCBieSB0aGUgY2FsbGVyLCBhcyBpcyBjb252ZXJ0aW5nIHRoZSBcInRoaXNcIiBwYXJhbWV0ZXIuXG4gICAqL1xuICBwcml2YXRlIGNvbnZlcnRQYXJhbXMoc2lnOiB0cy5TaWduYXR1cmUsIHBhcmFtRGVjbHM6IFJlYWRvbmx5QXJyYXk8dHMuUGFyYW1ldGVyRGVjbGFyYXRpb24+KTpcbiAgICAgIHN0cmluZ1tdIHtcbiAgICBjb25zdCBwYXJhbVR5cGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2lnLnBhcmFtZXRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcmFtID0gc2lnLnBhcmFtZXRlcnNbaV07XG5cbiAgICAgIGNvbnN0IHBhcmFtRGVjbCA9IHBhcmFtRGVjbHNbaV07XG4gICAgICBjb25zdCBvcHRpb25hbCA9ICEhcGFyYW1EZWNsLnF1ZXN0aW9uVG9rZW47XG4gICAgICBjb25zdCB2YXJBcmdzID0gISFwYXJhbURlY2wuZG90RG90RG90VG9rZW47XG4gICAgICBsZXQgcGFyYW1UeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlT2ZTeW1ib2xBdExvY2F0aW9uKHBhcmFtLCB0aGlzLm5vZGUpO1xuICAgICAgaWYgKHZhckFyZ3MpIHtcbiAgICAgICAgY29uc3QgdHlwZVJlZiA9IHBhcmFtVHlwZSBhcyB0cy5UeXBlUmVmZXJlbmNlO1xuICAgICAgICBwYXJhbVR5cGUgPSB0eXBlUmVmLnR5cGVBcmd1bWVudHMhWzBdO1xuICAgICAgfVxuICAgICAgbGV0IHR5cGVTdHIgPSB0aGlzLnRyYW5zbGF0ZShwYXJhbVR5cGUpO1xuICAgICAgaWYgKHZhckFyZ3MpIHR5cGVTdHIgPSAnLi4uJyArIHR5cGVTdHI7XG4gICAgICBpZiAob3B0aW9uYWwpIHR5cGVTdHIgPSB0eXBlU3RyICsgJz0nO1xuICAgICAgcGFyYW1UeXBlcy5wdXNoKHR5cGVTdHIpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1UeXBlcztcbiAgfVxuXG4gIHdhcm4obXNnOiBzdHJpbmcpIHtcbiAgICAvLyBCeSBkZWZhdWx0LCB3YXJuKCkgZG9lcyBub3RoaW5nLiAgVGhlIGNhbGxlciB3aWxsIG92ZXJ3cml0ZSB0aGlzXG4gICAgLy8gaWYgaXQgd2FudHMgZGlmZmVyZW50IGJlaGF2aW9yLlxuICB9XG5cbiAgLyoqIEByZXR1cm4gdHJ1ZSBpZiBzeW0gc2hvdWxkIGFsd2F5cyBoYXZlIHR5cGUgez99LiAqL1xuICBpc0JsYWNrTGlzdGVkKHN5bWJvbDogdHMuU3ltYm9sKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucGF0aEJsYWNrTGlzdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgcGF0aEJsYWNrTGlzdCA9IHRoaXMucGF0aEJsYWNrTGlzdDtcbiAgICAvLyBTb21lIGJ1aWx0aW4gdHlwZXMsIHN1Y2ggYXMge30sIGdldCByZXByZXNlbnRlZCBieSBhIHN5bWJvbCB0aGF0IGhhcyBubyBkZWNsYXJhdGlvbnMuXG4gICAgaWYgKHN5bWJvbC5kZWNsYXJhdGlvbnMgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBzeW1ib2wuZGVjbGFyYXRpb25zLmV2ZXJ5KG4gPT4ge1xuICAgICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLm5vcm1hbGl6ZShuLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSk7XG4gICAgICByZXR1cm4gcGF0aEJsYWNrTGlzdC5oYXMoZmlsZU5hbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3N1cmUgZG9lc24gbm90IHN1cHBvcnQgdHlwZSBwYXJhbWV0ZXJzIGZvciBmdW5jdGlvbiB0eXBlcywgaS5lLiBnZW5lcmljIGZ1bmN0aW9uIHR5cGVzLlxuICAgKiBCbGFja2xpc3QgdGhlIHN5bWJvbHMgZGVjbGFyZWQgYnkgdGhlbSBhbmQgZW1pdCBhID8gZm9yIHRoZSB0eXBlcy5cbiAgICpcbiAgICogVGhpcyBtdXRhdGVzIHRoZSBnaXZlbiBibGFja2xpc3QgbWFwLiBUaGUgbWFwJ3Mgc2NvcGUgaXMgb25lIGZpbGUsIGFuZCBzeW1ib2xzIGFyZVxuICAgKiB1bmlxdWUgb2JqZWN0cywgc28gdGhpcyBzaG91bGQgbmVpdGhlciBsZWFkIHRvIGV4Y2Vzc2l2ZSBtZW1vcnkgY29uc3VtcHRpb24gbm9yIGludHJvZHVjZVxuICAgKiBlcnJvcnMuXG4gICAqXG4gICAqIEBwYXJhbSBibGFja2xpc3QgYSBtYXAgdG8gc3RvcmUgdGhlIGJsYWNrbGlzdGVkIHN5bWJvbHMgaW4sIHdpdGggYSB2YWx1ZSBvZiAnPycuIEluIHByYWN0aWNlLFxuICAgKiAgICAgdGhpcyBpcyBhbHdheXMgPT09IHRoaXMuc3ltYm9sc1RvQWxpYXNlZE5hbWVzLCBidXQgd2UncmUgcGFzc2luZyBpdCBleHBsaWNpdGx5IHRvIG1ha2UgaXRcbiAgICogICAgY2xlYXIgdGhhdCB0aGUgbWFwIGlzIG11dGF0ZWQgKGluIHBhcnRpY3VsYXIgd2hlbiB1c2VkIGZyb20gb3V0c2lkZSB0aGUgY2xhc3MpLlxuICAgKiBAcGFyYW0gZGVjbHMgdGhlIGRlY2xhcmF0aW9ucyB3aG9zZSBzeW1ib2xzIHNob3VsZCBiZSBibGFja2xpc3RlZC5cbiAgICovXG4gIGJsYWNrbGlzdFR5cGVQYXJhbWV0ZXJzKFxuICAgICAgYmxhY2tsaXN0OiBNYXA8dHMuU3ltYm9sLCBzdHJpbmc+LFxuICAgICAgZGVjbHM6IHRzLk5vZGVBcnJheTx0cy5UeXBlUGFyYW1ldGVyRGVjbGFyYXRpb24+fHVuZGVmaW5lZCkge1xuICAgIGlmICghZGVjbHMgfHwgIWRlY2xzLmxlbmd0aCkgcmV0dXJuO1xuICAgIGZvciAoY29uc3QgdHBkIG9mIGRlY2xzKSB7XG4gICAgICBjb25zdCBzeW0gPSB0aGlzLnR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24odHBkLm5hbWUpO1xuICAgICAgaWYgKCFzeW0pIHtcbiAgICAgICAgdGhpcy53YXJuKGB0eXBlIHBhcmFtZXRlciB3aXRoIG5vIHN5bWJvbGApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc3ltYm9sc1RvQWxpYXNlZE5hbWVzLnNldChzeW0sICc/Jyk7XG4gICAgfVxuICB9XG59XG4iXX0=