"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack_1 = require("../../plugins/webpack");
const utils_1 = require("./utils");
const find_up_1 = require("../../utilities/find-up");
const webpack_2 = require("../../plugins/webpack");
const utils_2 = require("./utils");
const postcssUrl = require('postcss-url');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postcssImports = require('postcss-import');
const PostcssCliResources = require('../../plugins/webpack').PostcssCliResources;
function getStylesConfig(wco) {
    const { root, projectRoot, buildOptions } = wco;
    // const appRoot = path.resolve(projectRoot, appConfig.root);
    const entryPoints = {};
    const globalStylePaths = [];
    const extraPlugins = [];
    const cssSourceMap = buildOptions.sourceMap;
    // Maximum resource size to inline (KiB)
    const maximumInlineSize = 10;
    // Determine hashing format.
    const hashFormat = utils_1.getOutputHashFormat(buildOptions.outputHashing);
    // Convert absolute resource URLs to account for base-href and deploy-url.
    const baseHref = wco.buildOptions.baseHref || '';
    const deployUrl = wco.buildOptions.deployUrl || '';
    const postcssPluginCreator = function (loader) {
        return [
            postcssImports({
                resolve: (url, context) => {
                    return new Promise((resolve, reject) => {
                        let hadTilde = false;
                        if (url && url.startsWith('~')) {
                            url = url.substr(1);
                            hadTilde = true;
                        }
                        loader.resolve(context, (hadTilde ? '' : './') + url, (err, result) => {
                            if (err) {
                                if (hadTilde) {
                                    reject(err);
                                    return;
                                }
                                loader.resolve(context, url, (err, result) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(result);
                                    }
                                });
                            }
                            else {
                                resolve(result);
                            }
                        });
                    });
                },
                load: (filename) => {
                    return new Promise((resolve, reject) => {
                        loader.fs.readFile(filename, (err, data) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            const content = data.toString();
                            resolve(content);
                        });
                    });
                }
            }),
            postcssUrl({
                filter: ({ url }) => url.startsWith('~'),
                url: ({ url }) => {
                    // Note: This will only find the first node_modules folder.
                    const nodeModules = find_up_1.findUp('node_modules', projectRoot);
                    if (!nodeModules) {
                        throw new Error('Cannot locate node_modules directory.');
                    }
                    const fullPath = path.join(nodeModules, url.substr(1));
                    return path.relative(loader.context, fullPath).replace(/\\/g, '/');
                }
            }),
            postcssUrl([
                {
                    // Only convert root relative URLs, which CSS-Loader won't process into require().
                    filter: ({ url }) => url.startsWith('/') && !url.startsWith('//'),
                    url: ({ url }) => {
                        if (deployUrl.match(/:\/\//) || deployUrl.startsWith('/')) {
                            // If deployUrl is absolute or root relative, ignore baseHref & use deployUrl as is.
                            return `${deployUrl.replace(/\/$/, '')}${url}`;
                        }
                        else if (baseHref.match(/:\/\//)) {
                            // If baseHref contains a scheme, include it as is.
                            return baseHref.replace(/\/$/, '') +
                                `/${deployUrl}/${url}`.replace(/\/\/+/g, '/');
                        }
                        else {
                            // Join together base-href, deploy-url and the original URL.
                            // Also dedupe multiple slashes into single ones.
                            return `/${baseHref}/${deployUrl}/${url}`.replace(/\/\/+/g, '/');
                        }
                    }
                },
                {
                    // TODO: inline .cur if not supporting IE (use browserslist to check)
                    filter: (asset) => {
                        return maximumInlineSize > 0 && !asset.hash && !asset.absolutePath.endsWith('.cur');
                    },
                    url: 'inline',
                    // NOTE: maxSize is in KB
                    maxSize: maximumInlineSize,
                    fallback: 'rebase',
                },
                { url: 'rebase' },
            ]),
            PostcssCliResources({
                deployUrl: loader.loaders[loader.loaderIndex].options.ident == 'extracted' ? '' : deployUrl,
                loader,
                filename: `[name]${hashFormat.file}.[ext]`,
            }),
            autoprefixer({ grid: true }),
        ];
    };
    // use includePaths from appConfig
    const includePaths = [];
    let lessPathOptions = { paths: [] };
    if (buildOptions.stylePreprocessorOptions
        && buildOptions.stylePreprocessorOptions.includePaths
        && buildOptions.stylePreprocessorOptions.includePaths.length > 0) {
        buildOptions.stylePreprocessorOptions.includePaths.forEach((includePath) => includePaths.push(path.resolve(root, includePath)));
        lessPathOptions = {
            paths: includePaths,
        };
    }
    // Process global styles.
    if (buildOptions.styles.length > 0) {
        utils_2.normalizeExtraEntryPoints(buildOptions.styles, 'styles').forEach(style => {
            const resolvedPath = path.resolve(root, style.input);
            // Add style entry points.
            if (entryPoints[style.bundleName]) {
                entryPoints[style.bundleName].push(resolvedPath);
            }
            else {
                entryPoints[style.bundleName] = [resolvedPath];
            }
            // Add global css paths.
            globalStylePaths.push(resolvedPath);
        });
    }
    // set base rules to derive final rules from
    const baseRules = [
        { test: /\.css$/, use: [] },
        {
            test: /\.scss$|\.sass$/, use: [{
                    loader: 'sass-loader',
                    options: {
                        sourceMap: cssSourceMap,
                        // bootstrap-sass requires a minimum precision of 8
                        precision: 8,
                        includePaths
                    }
                }]
        },
        {
            test: /\.less$/, use: [{
                    loader: 'less-loader',
                    options: Object.assign({ sourceMap: cssSourceMap }, lessPathOptions)
                }]
        },
        {
            test: /\.styl$/, use: [{
                    loader: 'stylus-loader',
                    options: {
                        sourceMap: cssSourceMap,
                        paths: includePaths
                    }
                }]
        }
    ];
    // load component css as raw strings
    const rules = baseRules.map(({ test, use }) => ({
        exclude: globalStylePaths, test, use: [
            { loader: 'raw-loader' },
            {
                loader: 'postcss-loader',
                options: {
                    ident: 'embedded',
                    plugins: postcssPluginCreator,
                    sourceMap: cssSourceMap
                }
            },
            ...use
        ]
    }));
    // load global css as css files
    if (globalStylePaths.length > 0) {
        rules.push(...baseRules.map(({ test, use }) => {
            const extractTextPlugin = {
                use: [
                    // style-loader still has issues with relative url()'s with sourcemaps enabled;
                    // even with the convertToAbsoluteUrls options as it uses 'document.location'
                    // which breaks when used with routing.
                    // Once style-loader 1.0 is released the following conditional won't be necessary
                    // due to this 1.0 PR: https://github.com/webpack-contrib/style-loader/pull/219
                    { loader: buildOptions.extractCss ? webpack_2.RawCssLoader : 'raw-loader' },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: buildOptions.extractCss ? 'extracted' : 'embedded',
                            plugins: postcssPluginCreator,
                            sourceMap: cssSourceMap
                        }
                    },
                    ...use
                ],
                // publicPath needed as a workaround https://github.com/angular/angular-cli/issues/4035
                publicPath: ''
            };
            const ret = {
                include: globalStylePaths,
                test,
                use: [
                    buildOptions.extractCss ? MiniCssExtractPlugin.loader : 'style-loader',
                    ...extractTextPlugin.use,
                ]
            };
            // Save the original options as arguments for eject.
            // if (buildOptions.extractCss) {
            //   ret[pluginArgs] = extractTextPlugin;
            // }
            return ret;
        }));
    }
    if (buildOptions.extractCss) {
        // extract global css from js files into own css file
        extraPlugins.push(new MiniCssExtractPlugin({ filename: `[name]${hashFormat.extract}.css` }));
        // suppress empty .js files in css only entry points
        extraPlugins.push(new webpack_1.SuppressExtractedTextChunksWebpackPlugin());
    }
    return {
        // Workaround stylus-loader defect: https://github.com/shama/stylus-loader/issues/189
        loader: { stylus: {} },
        entry: entryPoints,
        module: { rules },
        plugins: [].concat(extraPlugins)
    };
}
exports.getStylesConfig = getStylesConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9hbmd1bGFyLWNsaS1maWxlcy9tb2RlbHMvd2VicGFjay1jb25maWdzL3N0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBQ0gsaUJBQWlCO0FBQ2pCLCtEQUErRDs7QUFHL0QsNkJBQTZCO0FBQzdCLG1EQUFpRjtBQUNqRixtQ0FBOEM7QUFFOUMscURBQWlEO0FBQ2pELG1EQUFxRDtBQUVyRCxtQ0FBb0Q7QUFFcEQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzFDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3QyxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ2hFLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsbUJBQW1CLENBQUM7QUFzQmpGLHlCQUFnQyxHQUF5QjtJQUN2RCxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFFaEQsNkRBQTZEO0lBQzdELE1BQU0sV0FBVyxHQUFnQyxFQUFFLENBQUM7SUFDcEQsTUFBTSxnQkFBZ0IsR0FBYSxFQUFFLENBQUM7SUFDdEMsTUFBTSxZQUFZLEdBQVUsRUFBRSxDQUFDO0lBQy9CLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7SUFFNUMsd0NBQXdDO0lBQ3hDLE1BQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBQzdCLDRCQUE0QjtJQUM1QixNQUFNLFVBQVUsR0FBRywyQkFBbUIsQ0FBQyxZQUFZLENBQUMsYUFBdUIsQ0FBQyxDQUFD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R0FBRyxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM1QixxREFBcUQ7UUFDckQsWUFBWSxDQUFDLElBQUksQ0FDZixJQUFJLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQVMsVUFBVSxDQUFDLE9BQU8sTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdFLG9EQUFvRDtRQUNwRCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksa0RBQXdDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxNQUFNLENBQUM7UUFDTCxxRkFBcUY7UUFDckYsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtRQUN0QixLQUFLLEVBQUUsV0FBVztRQUNsQixNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUU7UUFDakIsT0FBTyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBbUIsQ0FBQztLQUN4QyxDQUFDO0FBQ0osQ0FBQztBQXpQRCwwQ0F5UEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vLyB0c2xpbnQ6ZGlzYWJsZVxuLy8gVE9ETzogY2xlYW51cCB0aGlzIGZpbGUsIGl0J3MgY29waWVkIGFzIGlzIGZyb20gQW5ndWxhciBDTEkuXG5cbmltcG9ydCAqIGFzIHdlYnBhY2sgZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgU3VwcHJlc3NFeHRyYWN0ZWRUZXh0Q2h1bmtzV2VicGFja1BsdWdpbiB9IGZyb20gJy4uLy4uL3BsdWdpbnMvd2VicGFjayc7XG5pbXBvcnQgeyBnZXRPdXRwdXRIYXNoRm9ybWF0IH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBXZWJwYWNrQ29uZmlnT3B0aW9ucyB9IGZyb20gJy4uL2J1aWxkLW9wdGlvbnMnO1xuaW1wb3J0IHsgZmluZFVwIH0gZnJvbSAnLi4vLi4vdXRpbGl0aWVzL2ZpbmQtdXAnO1xuaW1wb3J0IHsgUmF3Q3NzTG9hZGVyIH0gZnJvbSAnLi4vLi4vcGx1Z2lucy93ZWJwYWNrJztcbmltcG9ydCB7IEV4dHJhRW50cnlQb2ludCB9IGZyb20gJy4uLy4uLy4uL2Jyb3dzZXIvc2NoZW1hJztcbmltcG9ydCB7IG5vcm1hbGl6ZUV4dHJhRW50cnlQb2ludHMgfSBmcm9tICcuL3V0aWxzJztcblxuY29uc3QgcG9zdGNzc1VybCA9IHJlcXVpcmUoJ3Bvc3Rjc3MtdXJsJyk7XG5jb25zdCBhdXRvcHJlZml4ZXIgPSByZXF1aXJlKCdhdXRvcHJlZml4ZXInKTtcbmNvbnN0IE1pbmlDc3NFeHRyYWN0UGx1Z2luID0gcmVxdWlyZSgnbWluaS1jc3MtZXh0cmFjdC1wbHVnaW4nKTtcbmNvbnN0IHBvc3Rjc3NJbXBvcnRzID0gcmVxdWlyZSgncG9zdGNzcy1pbXBvcnQnKTtcbmNvbnN0IFBvc3Rjc3NDbGlSZXNvdXJjZXMgPSByZXF1aXJlKCcuLi8uLi9wbHVnaW5zL3dlYnBhY2snKS5Qb3N0Y3NzQ2xpUmVzb3VyY2VzO1xuXG4vKipcbiAqIEVudW1lcmF0ZSBsb2FkZXJzIGFuZCB0aGVpciBkZXBlbmRlbmNpZXMgZnJvbSB0aGlzIGZpbGUgdG8gbGV0IHRoZSBkZXBlbmRlbmN5IHZhbGlkYXRvclxuICoga25vdyB0aGV5IGFyZSB1c2VkLlxuICpcbiAqIHJlcXVpcmUoJ3N0eWxlLWxvYWRlcicpXG4gKiByZXF1aXJlKCdwb3N0Y3NzLWxvYWRlcicpXG4gKiByZXF1aXJlKCdzdHlsdXMnKVxuICogcmVxdWlyZSgnc3R5bHVzLWxvYWRlcicpXG4gKiByZXF1aXJlKCdsZXNzJylcbiAqIHJlcXVpcmUoJ2xlc3MtbG9hZGVyJylcbiAqIHJlcXVpcmUoJ25vZGUtc2FzcycpXG4gKiByZXF1aXJlKCdzYXNzLWxvYWRlcicpXG4gKi9cblxuaW50ZXJmYWNlIFBvc3Rjc3NVcmxBc3NldCB7XG4gIHVybDogc3RyaW5nO1xuICBoYXNoOiBzdHJpbmc7XG4gIGFic29sdXRlUGF0aDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3R5bGVzQ29uZmlnKHdjbzogV2VicGFja0NvbmZpZ09wdGlvbnMpIHtcbiAgY29uc3QgeyByb290LCBwcm9qZWN0Um9vdCwgYnVpbGRPcHRpb25zIH0gPSB3Y287XG5cbiAgLy8gY29uc3QgYXBwUm9vdCA9IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdCwgYXBwQ29uZmlnLnJvb3QpO1xuICBjb25zdCBlbnRyeVBvaW50czogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9ID0ge307XG4gIGNvbnN0IGdsb2JhbFN0eWxlUGF0aHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGV4dHJhUGx1Z2luczogYW55W10gPSBbXTtcbiAgY29uc3QgY3NzU291cmNlTWFwID0gYnVpbGRPcHRpb25zLnNvdXJjZU1hcDtcblxuICAvLyBNYXhpbXVtIHJlc291cmNlIHNpemUgdG8gaW5saW5lIChLaUIpXG4gIGNvbnN0IG1heGltdW1JbmxpbmVTaXplID0gMTA7XG4gIC8vIERldGVybWluZSBoYXNoaW5nIGZvcm1hdC5cbiAgY29uc3QgaGFzaEZvcm1hdCA9IGdldE91dHB1dEhhc2hGb3JtYXQoYnVpbGRPcHRpb25zLm91dHB1dEhhc2hpbmcgYXMgc3RyaW5nKTtcbiAgLy8gQ29udmVydCBhYnNvbHV0ZSByZXNvdXJjZSBVUkxzIHRvIGFjY291bnQgZm9yIGJhc2UtaHJlZiBhbmQgZGVwbG95LXVybC5cbiAgY29uc3QgYmFzZUhyZWYgPSB3Y28uYnVpbGRPcHRpb25zLmJhc2VIcmVmIHx8ICcnO1xuICBjb25zdCBkZXBsb3lVcmwgPSB3Y28uYnVpbGRPcHRpb25zLmRlcGxveVVybCB8fCAnJztcblxuICBjb25zdCBwb3N0Y3NzUGx1Z2luQ3JlYXRvciA9IGZ1bmN0aW9uIChsb2FkZXI6IHdlYnBhY2subG9hZGVyLkxvYWRlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgcG9zdGNzc0ltcG9ydHMoe1xuICAgICAgICByZXNvbHZlOiAodXJsOiBzdHJpbmcsIGNvbnRleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBoYWRUaWxkZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHVybCAmJiB1cmwuc3RhcnRzV2l0aCgnficpKSB7XG4gICAgICAgICAgICAgIHVybCA9IHVybC5zdWJzdHIoMSk7XG4gICAgICAgICAgICAgIGhhZFRpbGRlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvYWRlci5yZXNvbHZlKGNvbnRleHQsIChoYWRUaWxkZSA/ICcnIDogJy4vJykgKyB1cmwsIChlcnI6IEVycm9yLCByZXN1bHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhZFRpbGRlKSB7XG4gICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9hZGVyLnJlc29sdmUoY29udGV4dCwgdXJsLCAoZXJyOiBFcnJvciwgcmVzdWx0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbG9hZDogKGZpbGVuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsb2FkZXIuZnMucmVhZEZpbGUoZmlsZW5hbWUsIChlcnI6IEVycm9yLCBkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgIHJlc29sdmUoY29udGVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBwb3N0Y3NzVXJsKHtcbiAgICAgICAgZmlsdGVyOiAoeyB1cmwgfTogUG9zdGNzc1VybEFzc2V0KSA9PiB1cmwuc3RhcnRzV2l0aCgnficpLFxuICAgICAgICB1cmw6ICh7IHVybCB9OiBQb3N0Y3NzVXJsQXNzZXQpID0+IHtcbiAgICAgICAgICAvLyBOb3RlOiBUaGlzIHdpbGwgb25seSBmaW5kIHRoZSBmaXJzdCBub2RlX21vZHVsZXMgZm9sZGVyLlxuICAgICAgICAgIGNvbnN0IG5vZGVNb2R1bGVzID0gZmluZFVwKCdub2RlX21vZHVsZXMnLCBwcm9qZWN0Um9vdCk7XG4gICAgICAgICAgaWYgKCFub2RlTW9kdWxlcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbG9jYXRlIG5vZGVfbW9kdWxlcyBkaXJlY3RvcnkuJylcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoLmpvaW4obm9kZU1vZHVsZXMsIHVybC5zdWJzdHIoMSkpO1xuICAgICAgICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKGxvYWRlci5jb250ZXh0LCBmdWxsUGF0aCkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHBvc3Rjc3NVcmwoW1xuICAgICAgICB7XG4gICAgICAgICAgLy8gT25seSBjb252ZXJ0IHJvb3QgcmVsYXRpdmUgVVJMcywgd2hpY2ggQ1NTLUxvYWRlciB3b24ndCBwcm9jZXNzIGludG8gcmVxdWlyZSgpLlxuICAgICAgICAgIGZpbHRlcjogKHsgdXJsIH06IFBvc3Rjc3NVcmxBc3NldCkgPT4gdXJsLnN0YXJ0c1dpdGgoJy8nKSAmJiAhdXJsLnN0YXJ0c1dpdGgoJy8vJyksXG4gICAgICAgICAgdXJsOiAoeyB1cmwgfTogUG9zdGNzc1VybEFzc2V0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZGVwbG95VXJsLm1hdGNoKC86XFwvXFwvLykgfHwgZGVwbG95VXJsLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgICAgICAgICAvLyBJZiBkZXBsb3lVcmwgaXMgYWJzb2x1dGUgb3Igcm9vdCByZWxhdGl2ZSwgaWdub3JlIGJhc2VIcmVmICYgdXNlIGRlcGxveVVybCBhcyBpcy5cbiAgICAgICAgICAgICAgcmV0dXJuIGAke2RlcGxveVVybC5yZXBsYWNlKC9cXC8kLywgJycpfSR7dXJsfWA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2VIcmVmLm1hdGNoKC86XFwvXFwvLykpIHtcbiAgICAgICAgICAgICAgLy8gSWYgYmFzZUhyZWYgY29udGFpbnMgYSBzY2hlbWUsIGluY2x1ZGUgaXQgYXMgaXMuXG4gICAgICAgICAgICAgIHJldHVybiBiYXNlSHJlZi5yZXBsYWNlKC9cXC8kLywgJycpICtcbiAgICAgICAgICAgICAgICBgLyR7ZGVwbG95VXJsfS8ke3VybH1gLnJlcGxhY2UoL1xcL1xcLysvZywgJy8nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEpvaW4gdG9nZXRoZXIgYmFzZS1ocmVmLCBkZXBsb3ktdXJsIGFuZCB0aGUgb3JpZ2luYWwgVVJMLlxuICAgICAgICAgICAgICAvLyBBbHNvIGRlZHVwZSBtdWx0aXBsZSBzbGFzaGVzIGludG8gc2luZ2xlIG9uZXMuXG4gICAgICAgICAgICAgIHJldHVybiBgLyR7YmFzZUhyZWZ9LyR7ZGVwbG95VXJsfS8ke3VybH1gLnJlcGxhY2UoL1xcL1xcLysvZywgJy8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAvLyBUT0RPOiBpbmxpbmUgLmN1ciBpZiBub3Qgc3VwcG9ydGluZyBJRSAodXNlIGJyb3dzZXJzbGlzdCB0byBjaGVjaylcbiAgICAgICAgICBmaWx0ZXI6IChhc3NldDogUG9zdGNzc1VybEFzc2V0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWF4aW11bUlubGluZVNpemUgPiAwICYmICFhc3NldC5oYXNoICYmICFhc3NldC5hYnNvbHV0ZVBhdGguZW5kc1dpdGgoJy5jdXInKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHVybDogJ2lubGluZScsXG4gICAgICAgICAgLy8gTk9URTogbWF4U2l6ZSBpcyBpbiBLQlxuICAgICAgICAgIG1heFNpemU6IG1heGltdW1JbmxpbmVTaXplLFxuICAgICAgICAgIGZhbGxiYWNrOiAncmViYXNlJyxcbiAgICAgICAgfSxcbiAgICAgICAgeyB1cmw6ICdyZWJhc2UnIH0sXG4gICAgICBdKSxcbiAgICAgIFBvc3Rjc3NDbGlSZXNvdXJjZXMoe1xuICAgICAgICBkZXBsb3lVcmw6IGxvYWRlci5sb2FkZXJzW2xvYWRlci5sb2FkZXJJbmRleF0ub3B0aW9ucy5pZGVudCA9PSAnZXh0cmFjdGVkJyA/ICcnIDogZGVwbG95VXJsLFxuICAgICAgICBsb2FkZXIsXG4gICAgICAgIGZpbGVuYW1lOiBgW25hbWVdJHtoYXNoRm9ybWF0LmZpbGV9LltleHRdYCxcbiAgICAgIH0pLFxuICAgICAgYXV0b3ByZWZpeGVyKHsgZ3JpZDogdHJ1ZSB9KSxcbiAgICBdO1xuICB9O1xuXG4gIC8vIHVzZSBpbmNsdWRlUGF0aHMgZnJvbSBhcHBDb25maWdcbiAgY29uc3QgaW5jbHVkZVBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgbGVzc1BhdGhPcHRpb25zOiB7IHBhdGhzOiBzdHJpbmdbXSB9ID0geyBwYXRoczogW10gfTtcblxuICBpZiAoYnVpbGRPcHRpb25zLnN0eWxlUHJlcHJvY2Vzc29yT3B0aW9uc1xuICAgICYmIGJ1aWxkT3B0aW9ucy5zdHlsZVByZXByb2Nlc3Nvck9wdGlvbnMuaW5jbHVkZVBhdGhzXG4gICAgJiYgYnVpbGRPcHRpb25zLnN0eWxlUHJlcHJvY2Vzc29yT3B0aW9ucy5pbmNsdWRlUGF0aHMubGVuZ3RoID4gMFxuICApIHtcbiAgICBidWlsZE9wdGlvbnMuc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zLmluY2x1ZGVQYXRocy5mb3JFYWNoKChpbmNsdWRlUGF0aDogc3RyaW5nKSA9PlxuICAgICAgaW5jbHVkZVBhdGhzLnB1c2gocGF0aC5yZXNvbHZlKHJvb3QsIGluY2x1ZGVQYXRoKSkpO1xuICAgIGxlc3NQYXRoT3B0aW9ucyA9IHtcbiAgICAgIHBhdGhzOiBpbmNsdWRlUGF0aHMsXG4gICAgfTtcbiAgfVxuXG4gIC8vIFByb2Nlc3MgZ2xvYmFsIHN0eWxlcy5cbiAgaWYgKGJ1aWxkT3B0aW9ucy5zdHlsZXMubGVuZ3RoID4gMCkge1xuICAgIG5vcm1hbGl6ZUV4dHJhRW50cnlQb2ludHMoYnVpbGRPcHRpb25zLnN0eWxlcywgJ3N0eWxlcycpLmZvckVhY2goc3R5bGUgPT4ge1xuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcGF0aC5yZXNvbHZlKHJvb3QsIHN0eWxlLmlucHV0KTtcblxuICAgICAgLy8gQWRkIHN0eWxlIGVudHJ5IHBvaW50cy5cbiAgICAgIGlmIChlbnRyeVBvaW50c1tzdHlsZS5idW5kbGVOYW1lXSkge1xuICAgICAgICBlbnRyeVBvaW50c1tzdHlsZS5idW5kbGVOYW1lXS5wdXNoKHJlc29sdmVkUGF0aClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVudHJ5UG9pbnRzW3N0eWxlLmJ1bmRsZU5hbWVdID0gW3Jlc29sdmVkUGF0aF1cbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGdsb2JhbCBjc3MgcGF0aHMuXG4gICAgICBnbG9iYWxTdHlsZVBhdGhzLnB1c2gocmVzb2x2ZWRQYXRoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHNldCBiYXNlIHJ1bGVzIHRvIGRlcml2ZSBmaW5hbCBydWxlcyBmcm9tXG4gIGNvbnN0IGJhc2VSdWxlczogd2VicGFjay5OZXdVc2VSdWxlW10gPSBbXG4gICAgeyB0ZXN0OiAvXFwuY3NzJC8sIHVzZTogW10gfSxcbiAgICB7XG4gICAgICB0ZXN0OiAvXFwuc2NzcyR8XFwuc2FzcyQvLCB1c2U6IFt7XG4gICAgICAgIGxvYWRlcjogJ3Nhc3MtbG9hZGVyJyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIHNvdXJjZU1hcDogY3NzU291cmNlTWFwLFxuICAgICAgICAgIC8vIGJvb3RzdHJhcC1zYXNzIHJlcXVpcmVzIGEgbWluaW11bSBwcmVjaXNpb24gb2YgOFxuICAgICAgICAgIHByZWNpc2lvbjogOCxcbiAgICAgICAgICBpbmNsdWRlUGF0aHNcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9LFxuICAgIHtcbiAgICAgIHRlc3Q6IC9cXC5sZXNzJC8sIHVzZTogW3tcbiAgICAgICAgbG9hZGVyOiAnbGVzcy1sb2FkZXInLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgc291cmNlTWFwOiBjc3NTb3VyY2VNYXAsXG4gICAgICAgICAgLi4ubGVzc1BhdGhPcHRpb25zLFxuICAgICAgICB9XG4gICAgICB9XVxuICAgIH0sXG4gICAge1xuICAgICAgdGVzdDogL1xcLnN0eWwkLywgdXNlOiBbe1xuICAgICAgICBsb2FkZXI6ICdzdHlsdXMtbG9hZGVyJyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIHNvdXJjZU1hcDogY3NzU291cmNlTWFwLFxuICAgICAgICAgIHBhdGhzOiBpbmNsdWRlUGF0aHNcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9XG4gIF07XG5cbiAgLy8gbG9hZCBjb21wb25lbnQgY3NzIGFzIHJhdyBzdHJpbmdzXG4gIGNvbnN0IHJ1bGVzOiB3ZWJwYWNrLlJ1bGVbXSA9IGJhc2VSdWxlcy5tYXAoKHsgdGVzdCwgdXNlIH0pID0+ICh7XG4gICAgZXhjbHVkZTogZ2xvYmFsU3R5bGVQYXRocywgdGVzdCwgdXNlOiBbXG4gICAgICB7IGxvYWRlcjogJ3Jhdy1sb2FkZXInIH0sXG4gICAgICB7XG4gICAgICAgIGxvYWRlcjogJ3Bvc3Rjc3MtbG9hZGVyJyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIGlkZW50OiAnZW1iZWRkZWQnLFxuICAgICAgICAgIHBsdWdpbnM6IHBvc3Rjc3NQbHVnaW5DcmVhdG9yLFxuICAgICAgICAgIHNvdXJjZU1hcDogY3NzU291cmNlTWFwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAuLi4odXNlIGFzIHdlYnBhY2suTG9hZGVyW10pXG4gICAgXVxuICB9KSk7XG5cbiAgLy8gbG9hZCBnbG9iYWwgY3NzIGFzIGNzcyBmaWxlc1xuICBpZiAoZ2xvYmFsU3R5bGVQYXRocy5sZW5ndGggPiAwKSB7XG4gICAgcnVsZXMucHVzaCguLi5iYXNlUnVsZXMubWFwKCh7IHRlc3QsIHVzZSB9KSA9PiB7XG4gICAgICBjb25zdCBleHRyYWN0VGV4dFBsdWdpbiA9IHtcbiAgICAgICAgdXNlOiBbXG4gICAgICAgICAgLy8gc3R5bGUtbG9hZGVyIHN0aWxsIGhhcyBpc3N1ZXMgd2l0aCByZWxhdGl2ZSB1cmwoKSdzIHdpdGggc291cmNlbWFwcyBlbmFibGVkO1xuICAgICAgICAgIC8vIGV2ZW4gd2l0aCB0aGUgY29udmVydFRvQWJzb2x1dGVVcmxzIG9wdGlvbnMgYXMgaXQgdXNlcyAnZG9jdW1lbnQubG9jYXRpb24nXG4gICAgICAgICAgLy8gd2hpY2ggYnJlYWtzIHdoZW4gdXNlZCB3aXRoIHJvdXRpbmcuXG4gICAgICAgICAgLy8gT25jZSBzdHlsZS1sb2FkZXIgMS4wIGlzIHJlbGVhc2VkIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uYWwgd29uJ3QgYmUgbmVjZXNzYXJ5XG4gICAgICAgICAgLy8gZHVlIHRvIHRoaXMgMS4wIFBSOiBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9wdWxsLzIxOVxuICAgICAgICAgIHsgbG9hZGVyOiBidWlsZE9wdGlvbnMuZXh0cmFjdENzcyA/IFJhd0Nzc0xvYWRlciA6ICdyYXctbG9hZGVyJyB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxvYWRlcjogJ3Bvc3Rjc3MtbG9hZGVyJyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgaWRlbnQ6IGJ1aWxkT3B0aW9ucy5leHRyYWN0Q3NzID8gJ2V4dHJhY3RlZCcgOiAnZW1iZWRkZWQnLFxuICAgICAgICAgICAgICBwbHVnaW5zOiBwb3N0Y3NzUGx1Z2luQ3JlYXRvcixcbiAgICAgICAgICAgICAgc291cmNlTWFwOiBjc3NTb3VyY2VNYXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIC4uLih1c2UgYXMgd2VicGFjay5Mb2FkZXJbXSlcbiAgICAgICAgXSxcbiAgICAgICAgLy8gcHVibGljUGF0aCBuZWVkZWQgYXMgYSB3b3JrYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXItY2xpL2lzc3Vlcy80MDM1XG4gICAgICAgIHB1YmxpY1BhdGg6ICcnXG4gICAgICB9O1xuICAgICAgY29uc3QgcmV0OiBhbnkgPSB7XG4gICAgICAgIGluY2x1ZGU6IGdsb2JhbFN0eWxlUGF0aHMsXG4gICAgICAgIHRlc3QsXG4gICAgICAgIHVzZTogW1xuICAgICAgICAgIGJ1aWxkT3B0aW9ucy5leHRyYWN0Q3NzID8gTWluaUNzc0V4dHJhY3RQbHVnaW4ubG9hZGVyIDogJ3N0eWxlLWxvYWRlcicsXG4gICAgICAgICAgLi4uZXh0cmFjdFRleHRQbHVnaW4udXNlLFxuICAgICAgICBdXG4gICAgICB9O1xuICAgICAgLy8gU2F2ZSB0aGUgb3JpZ2luYWwgb3B0aW9ucyBhcyBhcmd1bWVudHMgZm9yIGVqZWN0LlxuICAgICAgLy8gaWYgKGJ1aWxkT3B0aW9ucy5leHRyYWN0Q3NzKSB7XG4gICAgICAvLyAgIHJldFtwbHVnaW5BcmdzXSA9IGV4dHJhY3RUZXh0UGx1Z2luO1xuICAgICAgLy8gfVxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9KSk7XG4gIH1cblxuICBpZiAoYnVpbGRPcHRpb25zLmV4dHJhY3RDc3MpIHtcbiAgICAvLyBleHRyYWN0IGdsb2JhbCBjc3MgZnJvbSBqcyBmaWxlcyBpbnRvIG93biBjc3MgZmlsZVxuICAgIGV4dHJhUGx1Z2lucy5wdXNoKFxuICAgICAgbmV3IE1pbmlDc3NFeHRyYWN0UGx1Z2luKHsgZmlsZW5hbWU6IGBbbmFtZV0ke2hhc2hGb3JtYXQuZXh0cmFjdH0uY3NzYCB9KSk7XG4gICAgLy8gc3VwcHJlc3MgZW1wdHkgLmpzIGZpbGVzIGluIGNzcyBvbmx5IGVudHJ5IHBvaW50c1xuICAgIGV4dHJhUGx1Z2lucy5wdXNoKG5ldyBTdXBwcmVzc0V4dHJhY3RlZFRleHRDaHVua3NXZWJwYWNrUGx1Z2luKCkpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBXb3JrYXJvdW5kIHN0eWx1cy1sb2FkZXIgZGVmZWN0OiBodHRwczovL2dpdGh1Yi5jb20vc2hhbWEvc3R5bHVzLWxvYWRlci9pc3N1ZXMvMTg5XG4gICAgbG9hZGVyOiB7IHN0eWx1czoge30gfSxcbiAgICBlbnRyeTogZW50cnlQb2ludHMsXG4gICAgbW9kdWxlOiB7IHJ1bGVzIH0sXG4gICAgcGx1Z2luczogW10uY29uY2F0KGV4dHJhUGx1Z2lucyBhcyBhbnkpXG4gIH07XG59XG4iXX0=