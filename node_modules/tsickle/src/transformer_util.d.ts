/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="tsickle/src/transformer_util" />
import * as ts from './typescript';
/**
 * Adjusts the given CustomTransformers with additional transformers
 * to fix bugs in TypeScript.
 */
export declare function createCustomTransformers(given: ts.CustomTransformers): ts.CustomTransformers;
/**
 * A transformer that does nothing, but synthesizes all comments. This allows testing transformers
 * in isolation, but with an AST and comment placement that matches what'd happen after a source map
 * based transformer ran.
 */
export declare function synthesizeCommentsTransformer(context: ts.TransformationContext): ts.Transformer<ts.SourceFile>;
/**
 * Convert comment text ranges before and after a node
 * into ts.SynthesizedComments for the node and prevent the
 * comment text ranges to be emitted, to allow
 * changing these comments.
 *
 * This function takes a visitor to be able to do some
 * state management after the caller is done changing a node.
 */
export declare function visitNodeWithSynthesizedComments<T extends ts.Node>(context: ts.TransformationContext, sourceFile: ts.SourceFile, node: T, visitor: (node: T) => T): T;
/**
 * ts.createNotEmittedStatement will create a node whose comments are never emitted except for very
 * specific special cases (/// comments). createNotEmittedStatementWithComments creates a not
 * emitted statement and adds comment ranges from the original statement as synthetic comments to
 * it, so that they get retained in the output.
 */
export declare function createNotEmittedStatementWithComments(sourceFile: ts.SourceFile, original: ts.Node): ts.Statement;
/**
 * Creates a non emitted statement that can be used to store synthesized comments.
 */
export declare function createNotEmittedStatement(sourceFile: ts.SourceFile): ts.NotEmittedStatement;
/**
 * This is a version of `ts.visitEachChild` that works that calls our version
 * of `updateSourceFileNode`, so that typescript doesn't lose type information
 * for property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 *
 * @param sf
 * @param statements
 */
export declare function visitEachChild(node: ts.Node, visitor: ts.Visitor, context: ts.TransformationContext): ts.Node;
/**
 * This is a version of `ts.updateSourceFileNode` that works
 * well with property decorators.
 * See https://github.com/Microsoft/TypeScript/issues/17384
 * TODO(#634): This has been fixed in TS 2.5. Investigate removal.
 *
 * @param sf
 * @param statements
 */
export declare function updateSourceFileNode(sf: ts.SourceFile, statements: ts.NodeArray<ts.Statement>): ts.SourceFile;
export declare function isTypeNodeKind(kind: ts.SyntaxKind): boolean;
/**
 * Creates a string literal that uses single quotes. Purely cosmetic, but increases fidelity to the
 * existing test suite.
 */
export declare function createSingleQuoteStringLiteral(text: string): ts.StringLiteral;
