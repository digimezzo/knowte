/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="tsickle/src/googmodule" />
import { ModulesManifest } from './modules_manifest';
import * as ts from './typescript';
export interface GoogModuleProcessorHost {
    /**
     * Takes a context (ts.SourceFile.fileName of the current file) and the import URL of an ES6
     * import and generates a googmodule module name for the imported module.
     */
    pathToModuleName(context: string, importPath: string): string;
    /**
     * If we do googmodule processing, we polyfill module.id, since that's
     * part of ES6 modules.  This function determines what the module.id will be
     * for each file.
     */
    fileNameToModuleId(fileName: string): string;
    /** Identifies whether this file is the result of a JS transpilation. */
    isJsTranspilation?: boolean;
    /** Whether the emit targets ES5 or ES6+. */
    es5Mode?: boolean;
    /** expand "import 'foo';" to "import 'foo/index';" if it points to an index file. */
    convertIndexImportShorthand?: boolean;
    options: ts.CompilerOptions;
    host: ts.ModuleResolutionHost;
}
/**
 * Extracts the namespace part of a goog: import URL, or returns null if the given import URL is not
 * a goog: import.
 *
 * For example, for `import 'goog:foo.Bar';`, returns `foo.Bar`.
 */
export declare function extractGoogNamespaceImport(tsImport: string): string | null;
/**
 * Convert from implicit `import {} from 'pkg'` to `import {} from 'pkg/index'.
 * TypeScript supports the shorthand, but not all ES6 module loaders do.
 * Workaround for https://github.com/Microsoft/TypeScript/issues/12597
 */
export declare function resolveIndexShorthand({ options, host }: {
    options: ts.CompilerOptions;
    host: ts.ModuleResolutionHost;
}, pathOfImportingFile: string, imported: string): string;
/**
 * commonJsToGoogmoduleTransformer returns a transformer factory that converts TypeScript's CommonJS
 * module emit to Closure Compiler compatible goog.module and goog.require statements.
 */
export declare function commonJsToGoogmoduleTransformer(host: GoogModuleProcessorHost, modulesManifest: ModulesManifest, typeChecker: ts.TypeChecker, diagnostics: ts.Diagnostic[]): (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
