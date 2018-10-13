/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="tsickle/src/decorator_downlevel_transformer" />
import * as ts from './typescript';
/**
 * Returns true if the given decorator should be downleveled.
 *
 * Decorators that have JSDoc on them including the `@Annotation` tag are downleveled and converted
 * into properties on the class by this pass.
 */
export declare function shouldLower(decorator: ts.Decorator, typeChecker: ts.TypeChecker): boolean;
/**
 * Transformer factory for the decorator downlevel transformer. See fileoverview for details.
 */
export declare function decoratorDownlevelTransformer(typeChecker: ts.TypeChecker, diagnostics: ts.Diagnostic[]): (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
