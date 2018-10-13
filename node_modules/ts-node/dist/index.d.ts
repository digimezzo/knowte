import { BaseError } from 'make-error';
import * as TS from 'typescript';
/**
 * Common TypeScript interfaces between versions.
 */
export interface TSCommon {
    version: typeof TS.version;
    sys: typeof TS.sys;
    ScriptSnapshot: typeof TS.ScriptSnapshot;
    displayPartsToString: typeof TS.displayPartsToString;
    createLanguageService: typeof TS.createLanguageService;
    getDefaultLibFilePath: typeof TS.getDefaultLibFilePath;
    getPreEmitDiagnostics: typeof TS.getPreEmitDiagnostics;
    flattenDiagnosticMessageText: typeof TS.flattenDiagnosticMessageText;
    transpileModule: typeof TS.transpileModule;
    ModuleKind: typeof TS.ModuleKind;
    ScriptTarget: typeof TS.ScriptTarget;
    findConfigFile: typeof TS.findConfigFile;
    readConfigFile: typeof TS.readConfigFile;
    parseJsonConfigFileContent: typeof TS.parseJsonConfigFileContent;
}
/**
 * Export the current version.
 */
export declare const VERSION: any;
/**
 * Registration options.
 */
export interface Options {
    typeCheck?: boolean | null;
    transpileOnly?: boolean | null;
    cache?: boolean | null;
    cacheDirectory?: string;
    compiler?: string;
    ignore?: string | string[];
    project?: string;
    skipIgnore?: boolean | null;
    skipProject?: boolean | null;
    compilerOptions?: object;
    ignoreDiagnostics?: number | string | Array<number | string>;
    readFile?: (path: string) => string | undefined;
    fileExists?: (path: string) => boolean;
    transformers?: TS.CustomTransformers;
}
/**
 * Information retrieved from type info check.
 */
export interface TypeInfo {
    name: string;
    comment: string;
}
/**
 * Default register options.
 */
export declare const DEFAULTS: Options;
/**
 * Split a string array of values.
 */
export declare function split(value: string | undefined): string[] | undefined;
/**
 * Parse a string as JSON.
 */
export declare function parse(value: string | undefined): object | undefined;
/**
 * Replace backslashes with forward slashes.
 */
export declare function normalizeSlashes(value: string): string;
/**
 * TypeScript diagnostics error.
 */
export declare class TSError extends BaseError {
    diagnostics: TSDiagnostic[];
    name: string;
    constructor(diagnostics: TSDiagnostic[]);
}
/**
 * Return type for registering `ts-node`.
 */
export interface Register {
    cwd: string;
    extensions: string[];
    cachedir: string;
    ts: TSCommon;
    compile(code: string, fileName: string, lineOffset?: number): string;
    getTypeInfo(code: string, fileName: string, position: number): TypeInfo;
}
/**
 * Register TypeScript compiler.
 */
export declare function register(opts?: Options): Register;
/**
 * Format an array of diagnostics.
 */
export declare function formatDiagnostics(diagnostics: TS.Diagnostic[], cwd: string, ts: TSCommon, lineOffset: number): TSDiagnostic[];
/**
 * Internal diagnostic representation.
 */
export interface TSDiagnostic {
    message: string;
    code: number;
}
/**
 * Format a diagnostic object into a string.
 */
export declare function formatDiagnostic(diagnostic: TS.Diagnostic, cwd: string, ts: TSCommon, lineOffset: number): TSDiagnostic;
/**
 * Stringify the `TSError` instance.
 */
export declare function printError(error: TSError): string;
