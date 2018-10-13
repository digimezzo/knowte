import { WebpackConfigOptions, WebpackTestOptions } from '../build-options';
/**
 * Enumerate loaders and their dependencies from this file to let the dependency validator
 * know they are used.
 *
 * require('istanbul-instrumenter-loader')
 *
 */
export declare function getTestConfig(wco: WebpackConfigOptions<WebpackTestOptions>): {
    mode: string;
    resolve: {
        mainFields: string[];
    };
    devtool: string;
    entry: {
        main: string;
    };
    module: {
        rules: never[];
    };
    plugins: any[];
    optimization: {
        splitChunks: {
            chunks: string;
            cacheGroups: {
                vendors: boolean;
                vendor: {
                    name: string;
                    chunks: string;
                    test: (module: any, chunks: {
                        name: string;
                    }[]) => boolean;
                };
            };
        };
    };
};
