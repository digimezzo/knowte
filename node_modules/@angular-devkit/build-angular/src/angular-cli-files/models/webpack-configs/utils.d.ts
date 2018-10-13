import { ExtraEntryPoint, ExtraEntryPointObject } from '../../../browser/schema';
export declare const ngAppResolve: (resolvePath: string) => string;
export declare function getWebpackStatsConfig(verbose?: boolean): {
    colors: boolean;
    hash: boolean;
    timings: boolean;
    chunks: boolean;
    chunkModules: boolean;
    children: boolean;
    modules: boolean;
    reasons: boolean;
    warnings: boolean;
    errors: boolean;
    assets: boolean;
    version: boolean;
    errorDetails: boolean;
    moduleTrace: boolean;
};
export interface HashFormat {
    chunk: string;
    extract: string;
    file: string;
    script: string;
}
export declare function getOutputHashFormat(option: string, length?: number): HashFormat;
export declare type NormalizedEntryPoint = ExtraEntryPointObject & {
    bundleName: string;
};
export declare function normalizeExtraEntryPoints(extraEntryPoints: ExtraEntryPoint[], defaultBundleName: string): NormalizedEntryPoint[];
