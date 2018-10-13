"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const fs_1 = require("fs");
const path = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const url = require("url");
const webpack = require("webpack");
const utils_1 = require("../angular-cli-files/models/webpack-configs/utils");
const check_port_1 = require("../angular-cli-files/utilities/check-port");
const stats_1 = require("../angular-cli-files/utilities/stats");
const _1 = require("../browser/");
const utils_2 = require("../utils");
const opn = require('opn');
const WebpackDevServer = require('webpack-dev-server');
class DevServerBuilder {
    constructor(context) {
        this.context = context;
    }
    run(builderConfig) {
        const options = builderConfig.options;
        const root = this.context.workspace.root;
        const projectRoot = core_1.resolve(root, builderConfig.root);
        const host = new core_1.virtualFs.AliasHost(this.context.host);
        let browserOptions;
        return check_port_1.checkPort(options.port, options.host).pipe(operators_1.tap((port) => options.port = port), operators_1.concatMap(() => this._getBrowserOptions(options)), operators_1.tap((opts) => browserOptions = opts), operators_1.concatMap(() => utils_2.addFileReplacements(root, host, browserOptions.fileReplacements)), operators_1.concatMap(() => utils_2.normalizeAssetPatterns(browserOptions.assets, host, root, projectRoot, builderConfig.sourceRoot)), 
        // Replace the assets in options with the normalized version.
        operators_1.tap((assetPatternObjects => browserOptions.assets = assetPatternObjects)), operators_1.concatMap(() => new rxjs_1.Observable(obs => {
            const browserBuilder = new _1.BrowserBuilder(this.context);
            const webpackConfig = browserBuilder.buildWebpackConfig(root, projectRoot, host, browserOptions);
            const statsConfig = utils_1.getWebpackStatsConfig(browserOptions.verbose);
            let webpackDevServerConfig;
            try {
                webpackDevServerConfig = this._buildServerConfig(root, projectRoot, options, browserOptions);
            }
            catch (err) {
                obs.error(err);
                return;
            }
            // Resolve public host and client address.
            let clientAddress = `${options.ssl ? 'https' : 'http'}://0.0.0.0:0`;
            if (options.publicHost) {
                let publicHost = options.publicHost;
                if (!/^\w+:\/\//.test(publicHost)) {
                    publicHost = `${options.ssl ? 'https' : 'http'}://${publicHost}`;
                }
                const clientUrl = url.parse(publicHost);
                options.publicHost = clientUrl.host;
                clientAddress = url.format(clientUrl);
            }
            // Resolve serve address.
            const serverAddress = url.format({
                protocol: options.ssl ? 'https' : 'http',
                hostname: options.host === '0.0.0.0' ? 'localhost' : options.host,
                port: options.port.toString(),
            });
            // Add live reload config.
            if (options.liveReload) {
                this._addLiveReload(options, browserOptions, webpackConfig, clientAddress);
            }
            else if (options.hmr) {
                this.context.logger.warn('Live reload is disabled. HMR option ignored.');
            }
            if (!options.watch) {
                // There's no option to turn off file watching in webpack-dev-server, but
                // we can override the file watcher instead.
                webpackConfig.plugins.unshift({
                    // tslint:disable-next-line:no-any
                    apply: (compiler) => {
                        compiler.hooks.afterEnvironment.tap('angular-cli', () => {
                            compiler.watchFileSystem = { watch: () => { } };
                        });
                    },
                });
            }
            if (browserOptions.optimization) {
                this.context.logger.error(core_1.tags.stripIndents `
            ****************************************************************************************
            This is a simple server for use in testing or debugging Angular applications locally.
            It hasn't been reviewed for security issues.

            DON'T USE IT FOR PRODUCTION!
            ****************************************************************************************
          `);
            }
            this.context.logger.info(core_1.tags.oneLine `
          **
          Angular Live Development Server is listening on ${options.host}:${options.port},
          open your browser on ${serverAddress}${webpackDevServerConfig.publicPath}
          **
        `);
            const webpackCompiler = webpack(webpackConfig);
            const server = new WebpackDevServer(webpackCompiler, webpackDevServerConfig);
            let first = true;
            // tslint:disable-next-line:no-any
            webpackCompiler.hooks.done.tap('angular-cli', (stats) => {
                if (!browserOptions.verbose) {
                    const json = stats.toJson(statsConfig);
                    this.context.logger.info(stats_1.statsToString(json, statsConfig));
                    if (stats.hasWarnings()) {
                        this.context.logger.info(stats_1.statsWarningsToString(json, statsConfig));
                    }
                    if (stats.hasErrors()) {
                        this.context.logger.info(stats_1.statsErrorsToString(json, statsConfig));
                    }
                }
                obs.next({ success: true });
                if (first && options.open) {
                    first = false;
                    opn(serverAddress + webpackDevServerConfig.publicPath);
                }
            });
            const httpServer = server.listen(options.port, options.host, (err) => {
                if (err) {
                    obs.error(err);
                }
            });
            // Node 8 has a keepAliveTimeout bug which doesn't respect active connections.
            // Connections will end after ~5 seconds (arbitrary), often not letting the full download
            // of large pieces of content, such as a vendor javascript file.  This results in browsers
            // throwing a "net::ERR_CONTENT_LENGTH_MISMATCH" error.
            // https://github.com/angular/angular-cli/issues/7197
            // https://github.com/nodejs/node/issues/13391
            // https://github.com/nodejs/node/commit/2cb6f2b281eb96a7abe16d58af6ebc9ce23d2e96
            if (/^v8.\d.\d+$/.test(process.version)) {
                httpServer.keepAliveTimeout = 30000; // 30 seconds
            }
            // Teardown logic. Close the server when unsubscribed from.
            return () => server.close();
        })));
    }
    _buildServerConfig(root, projectRoot, options, browserOptions) {
        const systemRoot = core_1.getSystemPath(root);
        if (options.disableHostCheck) {
            this.context.logger.warn(core_1.tags.oneLine `
        WARNING: Running a server with --disable-host-check is a security risk.
        See https://medium.com/webpack/webpack-dev-server-middleware-security-issues-1489d950874a
        for more information.
      `);
        }
        const servePath = this._buildServePath(options, browserOptions);
        const config = {
            headers: { 'Access-Control-Allow-Origin': '*' },
            historyApiFallback: {
                index: `${servePath}/${path.basename(browserOptions.index)}`,
                disableDotRule: true,
                htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
            },
            stats: browserOptions.verbose ? utils_1.getWebpackStatsConfig(browserOptions.verbose) : false,
            compress: browserOptions.optimization,
            watchOptions: {
                poll: browserOptions.poll,
            },
            https: options.ssl,
            overlay: {
                errors: !browserOptions.optimization,
                warnings: false,
            },
            contentBase: false,
            public: options.publicHost,
            disableHostCheck: options.disableHostCheck,
            publicPath: servePath,
            hot: options.hmr,
        };
        if (options.ssl) {
            this._addSslConfig(systemRoot, options, config);
        }
        if (options.proxyConfig) {
            this._addProxyConfig(systemRoot, options, config);
        }
        return config;
    }
    _addLiveReload(options, browserOptions, webpackConfig, // tslint:disable-line:no-any
    clientAddress) {
        // This allows for live reload of page when changes are made to repo.
        // https://webpack.js.org/configuration/dev-server/#devserver-inline
        let webpackDevServerPath;
        try {
            webpackDevServerPath = require.resolve('webpack-dev-server/client');
        }
        catch (_a) {
            throw new Error('The "webpack-dev-server" package could not be found.');
        }
        const entryPoints = [`${webpackDevServerPath}?${clientAddress}`];
        if (options.hmr) {
            const webpackHmrLink = 'https://webpack.js.org/guides/hot-module-replacement';
            this.context.logger.warn(core_1.tags.oneLine `NOTICE: Hot Module Replacement (HMR) is enabled for the dev server.`);
            const showWarning = options.hmrWarning;
            if (showWarning) {
                this.context.logger.info(core_1.tags.stripIndents `
          The project will still live reload when HMR is enabled,
          but to take advantage of HMR additional application code is required'
          (not included in an Angular CLI project by default).'
          See ${webpackHmrLink}
          for information on working with HMR for Webpack.`);
                this.context.logger.warn(core_1.tags.oneLine `To disable this warning use "hmrWarning: false" under "serve"
           options in "angular.json".`);
            }
            entryPoints.push('webpack/hot/dev-server');
            webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
            if (browserOptions.extractCss) {
                this.context.logger.warn(core_1.tags.oneLine `NOTICE: (HMR) does not allow for CSS hot reload
                when used together with '--extract-css'.`);
            }
        }
        if (!webpackConfig.entry.main) {
            webpackConfig.entry.main = [];
        }
        webpackConfig.entry.main.unshift(...entryPoints);
    }
    _addSslConfig(root, options, config) {
        let sslKey = undefined;
        let sslCert = undefined;
        if (options.sslKey) {
            const keyPath = path.resolve(root, options.sslKey);
            if (fs_1.existsSync(keyPath)) {
                sslKey = fs_1.readFileSync(keyPath, 'utf-8');
            }
        }
        if (options.sslCert) {
            const certPath = path.resolve(root, options.sslCert);
            if (fs_1.existsSync(certPath)) {
                sslCert = fs_1.readFileSync(certPath, 'utf-8');
            }
        }
        config.https = true;
        if (sslKey != null && sslCert != null) {
            config.key = sslKey;
            config.cert = sslCert;
        }
    }
    _addProxyConfig(root, options, config) {
        let proxyConfig = {};
        const proxyPath = path.resolve(root, options.proxyConfig);
        if (fs_1.existsSync(proxyPath)) {
            proxyConfig = require(proxyPath);
        }
        else {
            const message = 'Proxy config file ' + proxyPath + ' does not exist.';
            throw new Error(message);
        }
        config.proxy = proxyConfig;
    }
    _buildServePath(options, browserOptions) {
        let servePath = options.servePath;
        if (!servePath && servePath !== '') {
            const defaultServePath = this._findDefaultServePath(browserOptions.baseHref, browserOptions.deployUrl);
            const showWarning = options.servePathDefaultWarning;
            if (defaultServePath == null && showWarning) {
                this.context.logger.warn(core_1.tags.oneLine `
            WARNING: --deploy-url and/or --base-href contain
            unsupported values for ng serve.  Default serve path of '/' used.
            Use --serve-path to override.
          `);
            }
            servePath = defaultServePath || '';
        }
        if (servePath.endsWith('/')) {
            servePath = servePath.substr(0, servePath.length - 1);
        }
        if (!servePath.startsWith('/')) {
            servePath = `/${servePath}`;
        }
        return servePath;
    }
    _findDefaultServePath(baseHref, deployUrl) {
        if (!baseHref && !deployUrl) {
            return '';
        }
        if (/^(\w+:)?\/\//.test(baseHref || '') || /^(\w+:)?\/\//.test(deployUrl || '')) {
            // If baseHref or deployUrl is absolute, unsupported by ng serve
            return null;
        }
        // normalize baseHref
        // for ng serve the starting base is always `/` so a relative
        // and root relative value are identical
        const baseHrefParts = (baseHref || '')
            .split('/')
            .filter(part => part !== '');
        if (baseHref && !baseHref.endsWith('/')) {
            baseHrefParts.pop();
        }
        const normalizedBaseHref = baseHrefParts.length === 0 ? '/' : `/${baseHrefParts.join('/')}/`;
        if (deployUrl && deployUrl[0] === '/') {
            if (baseHref && baseHref[0] === '/' && normalizedBaseHref !== deployUrl) {
                // If baseHref and deployUrl are root relative and not equivalent, unsupported by ng serve
                return null;
            }
            return deployUrl;
        }
        // Join together baseHref and deployUrl
        return `${normalizedBaseHref}${deployUrl || ''}`;
    }
    _getBrowserOptions(options) {
        const architect = this.context.architect;
        const [project, target, configuration] = options.browserTarget.split(':');
        // Override browser build watch setting.
        const overrides = { watch: options.watch };
        const browserTargetSpec = { project, target, configuration, overrides };
        const builderConfig = architect.getBuilderConfiguration(browserTargetSpec);
        // Update the browser options with the same options we support in serve, if defined.
        builderConfig.options = Object.assign({}, (options.optimization !== undefined ? { optimization: options.optimization } : {}), (options.aot !== undefined ? { aot: options.aot } : {}), (options.sourceMap !== undefined ? { sourceMap: options.sourceMap } : {}), (options.evalSourceMap !== undefined ? { evalSourceMap: options.evalSourceMap } : {}), (options.vendorChunk !== undefined ? { vendorChunk: options.vendorChunk } : {}), (options.commonChunk !== undefined ? { commonChunk: options.commonChunk } : {}), (options.baseHref !== undefined ? { baseHref: options.baseHref } : {}), (options.progress !== undefined ? { progress: options.progress } : {}), (options.poll !== undefined ? { poll: options.poll } : {}), builderConfig.options);
        return architect.getBuilderDescription(builderConfig).pipe(operators_1.concatMap(browserDescription => architect.validateBuilderOptions(builderConfig, browserDescription)), operators_1.map(browserConfig => browserConfig.options));
    }
}
exports.DevServerBuilder = DevServerBuilder;
exports.default = DevServerBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2Rldi1zZXJ2ZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFRSCwrQ0FBcUY7QUFDckYsMkJBQThDO0FBRTlDLDZCQUE2QjtBQUM3QiwrQkFBa0M7QUFDbEMsOENBQXFEO0FBQ3JELDJCQUEyQjtBQUMzQixtQ0FBbUM7QUFDbkMsNkVBQTBGO0FBQzFGLDBFQUFzRTtBQUN0RSxnRUFJOEM7QUFDOUMsa0NBQTZFO0FBRTdFLG9DQUF1RTtBQUN2RSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQTJEdkQ7SUFFRSxZQUFtQixPQUF1QjtRQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtJQUFJLENBQUM7SUFFL0MsR0FBRyxDQUFDLGFBQTREO1FBQzlELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ3pDLE1BQU0sV0FBVyxHQUFHLGNBQU8sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELE1BQU0sSUFBSSxHQUFHLElBQUksZ0JBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFnQyxDQUFDLENBQUM7UUFDcEYsSUFBSSxjQUFvQyxDQUFDO1FBRXpDLE1BQU0sQ0FBQyxzQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FDL0MsZUFBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMs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Yy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEJ1aWxkRXZlbnQsXG4gIEJ1aWxkZXIsXG4gIEJ1aWxkZXJDb25maWd1cmF0aW9uLFxuICBCdWlsZGVyQ29udGV4dCxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2FyY2hpdGVjdCc7XG5pbXBvcnQgeyBQYXRoLCBnZXRTeXN0ZW1QYXRoLCByZXNvbHZlLCB0YWdzLCB2aXJ0dWFsRnMgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY29uY2F0TWFwLCBtYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCAqIGFzIHVybCBmcm9tICd1cmwnO1xuaW1wb3J0ICogYXMgd2VicGFjayBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IGdldFdlYnBhY2tTdGF0c0NvbmZpZyB9IGZyb20gJy4uL2FuZ3VsYXItY2xpLWZpbGVzL21vZGVscy93ZWJwYWNrLWNvbmZpZ3MvdXRpbHMnO1xuaW1wb3J0IHsgY2hlY2tQb3J0IH0gZnJvbSAnLi4vYW5ndWxhci1jbGktZmlsZXMvdXRpbGl0aWVzL2NoZWNrLXBvcnQnO1xuaW1wb3J0IHtcbiAgc3RhdHNFcnJvcnNUb1N0cmluZyxcbiAgc3RhdHNUb1N0cmluZyxcbiAgc3RhdHNXYXJuaW5nc1RvU3RyaW5nLFxufSBmcm9tICcuLi9hbmd1bGFyLWNsaS1maWxlcy91dGlsaXRpZXMvc3RhdHMnO1xuaW1wb3J0IHsgQnJvd3NlckJ1aWxkZXIsIE5vcm1hbGl6ZWRCcm93c2VyQnVpbGRlclNjaGVtYSB9IGZyb20gJy4uL2Jyb3dzZXIvJztcbmltcG9ydCB7IEJyb3dzZXJCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi4vYnJvd3Nlci9zY2hlbWEnO1xuaW1wb3J0IHsgYWRkRmlsZVJlcGxhY2VtZW50cywgbm9ybWFsaXplQXNzZXRQYXR0ZXJucyB9IGZyb20gJy4uL3V0aWxzJztcbmNvbnN0IG9wbiA9IHJlcXVpcmUoJ29wbicpO1xuY29uc3QgV2VicGFja0RldlNlcnZlciA9IHJlcXVpcmUoJ3dlYnBhY2stZGV2LXNlcnZlcicpO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV2U2VydmVyQnVpbGRlck9wdGlvbnMge1xuICBicm93c2VyVGFyZ2V0OiBzdHJpbmc7XG4gIHBvcnQ6IG51bWJlcjtcbiAgaG9zdDogc3RyaW5nO1xuICBwcm94eUNvbmZpZz86IHN0cmluZztcbiAgc3NsOiBib29sZWFuO1xuICBzc2xLZXk/OiBzdHJpbmc7XG4gIHNzbENlcnQ/OiBzdHJpbmc7XG4gIG9wZW46IGJvb2xlYW47XG4gIGxpdmVSZWxvYWQ6IGJvb2xlYW47XG4gIHB1YmxpY0hvc3Q/OiBzdHJpbmc7XG4gIHNlcnZlUGF0aD86IHN0cmluZztcbiAgZGlzYWJsZUhvc3RDaGVjazogYm9vbGVhbjtcbiAgaG1yOiBib29sZWFuO1xuICB3YXRjaDogYm9vbGVhbjtcbiAgaG1yV2FybmluZzogYm9vbGVhbjtcbiAgc2VydmVQYXRoRGVmYXVsdFdhcm5pbmc6IGJvb2xlYW47XG5cbiAgLy8gVGhlc2Ugb3B0aW9ucyBjb21lIGZyb20gdGhlIGJyb3dzZXIgYnVpbGRlciBhbmQgYXJlIHByb3ZpZGVkIGhlcmUgZm9yIGNvbnZlbmllbmNlLlxuICBvcHRpbWl6YXRpb24/OiBib29sZWFuO1xuICBhb3Q/OiBib29sZWFuO1xuICBzb3VyY2VNYXA/OiBib29sZWFuO1xuICBldmFsU291cmNlTWFwPzogYm9vbGVhbjtcbiAgdmVuZG9yQ2h1bms/OiBib29sZWFuO1xuICBjb21tb25DaHVuaz86IGJvb2xlYW47XG4gIGJhc2VIcmVmPzogc3RyaW5nO1xuICBwcm9ncmVzcz86IGJvb2xlYW47XG4gIHBvbGw/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBXZWJwYWNrRGV2U2VydmVyQ29uZmlndXJhdGlvbk9wdGlvbnMge1xuICBjb250ZW50QmFzZT86IGJvb2xlYW4gfCBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgaG90PzogYm9vbGVhbjtcbiAgaGlzdG9yeUFwaUZhbGxiYWNrPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSB8IGJvb2xlYW47IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gIGNvbXByZXNzPzogYm9vbGVhbjtcbiAgcHJveHk/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICBzdGF0aWNPcHRpb25zPzogYW55OyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWFueVxuICBxdWlldD86IGJvb2xlYW47XG4gIG5vSW5mbz86IGJvb2xlYW47XG4gIGxhenk/OiBib29sZWFuO1xuICBmaWxlbmFtZT86IHN0cmluZztcbiAgd2F0Y2hPcHRpb25zPzoge1xuICAgIGFnZ3JlZ2F0ZVRpbWVvdXQ/OiBudW1iZXI7XG4gICAgcG9sbD86IG51bWJlcjtcbiAgfTtcbiAgcHVibGljUGF0aD86IHN0cmluZztcbiAgaGVhZGVycz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIHN0YXRzPzogeyBba2V5OiBzdHJpbmddOiBib29sZWFuIH0gfCBzdHJpbmcgfCBib29sZWFuO1xuICBodHRwcz86IGJvb2xlYW47XG4gIGtleT86IHN0cmluZztcbiAgY2VydD86IHN0cmluZztcbiAgb3ZlcmxheT86IGJvb2xlYW4gfCB7IGVycm9yczogYm9vbGVhbiwgd2FybmluZ3M6IGJvb2xlYW4gfTtcbiAgcHVibGljPzogc3RyaW5nO1xuICBkaXNhYmxlSG9zdENoZWNrPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIERldlNlcnZlckJ1aWxkZXIgaW1wbGVtZW50cyBCdWlsZGVyPERldlNlcnZlckJ1aWxkZXJPcHRpb25zPiB7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0KSB7IH1cblxuICBydW4oYnVpbGRlckNvbmZpZzogQnVpbGRlckNvbmZpZ3VyYXRpb248RGV2U2VydmVyQnVpbGRlck9wdGlvbnM+KTogT2JzZXJ2YWJsZTxCdWlsZEV2ZW50PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGJ1aWxkZXJDb25maWcub3B0aW9ucztcbiAgICBjb25zdCByb290ID0gdGhpcy5jb250ZXh0LndvcmtzcGFjZS5yb290O1xuICAgIGNvbnN0IHByb2plY3RSb290ID0gcmVzb2x2ZShyb290LCBidWlsZGVyQ29uZmlnLnJvb3QpO1xuICAgIGNvbnN0IGhvc3QgPSBuZXcgdmlydHVhbEZzLkFsaWFzSG9zdCh0aGlzLmNvbnRleHQuaG9zdCBhcyB2aXJ0dWFsRnMuSG9zdDxmcy5TdGF0cz4pO1xuICAgIGxldCBicm93c2VyT3B0aW9uczogQnJvd3NlckJ1aWxkZXJTY2hlbWE7XG5cbiAgICByZXR1cm4gY2hlY2tQb3J0KG9wdGlvbnMucG9ydCwgb3B0aW9ucy5ob3N0KS5waXBlKFxuICAgICAgdGFwKChwb3J0KSA9PiBvcHRpb25zLnBvcnQgPSBwb3J0KSxcbiAgICAgIGNvbmNhdE1hcCgoKSA9PiB0aGlzLl9nZXRCcm93c2VyT3B0aW9ucyhvcHRpb25zKSksXG4gICAgICB0YXAoKG9wdHMpID0+IGJyb3dzZXJPcHRpb25zID0gb3B0cyksXG4gICAgICBjb25jYXRNYXAoKCkgPT4gYWRkRmlsZVJlcGxhY2VtZW50cyhyb290LCBob3N0LCBicm93c2VyT3B0aW9ucy5maWxlUmVwbGFjZW1lbnRzKSksXG4gICAgICBjb25jYXRNYXAoKCkgPT4gbm9ybWFsaXplQXNzZXRQYXR0ZXJucyhcbiAgICAgICAgYnJvd3Nlck9wdGlvbnMuYXNzZXRzLCBob3N0LCByb290LCBwcm9qZWN0Um9vdCwgYnVpbGRlckNvbmZpZy5zb3VyY2VSb290KSksXG4gICAgICAvLyBSZXBsYWNlIHRoZSBhc3NldHMgaW4gb3B0aW9ucyB3aXRoIHRoZSBub3JtYWxpemVkIHZlcnNpb24uXG4gICAgICB0YXAoKGFzc2V0UGF0dGVybk9iamVjdHMgPT4gYnJvd3Nlck9wdGlvbnMuYXNzZXRzID0gYXNzZXRQYXR0ZXJuT2JqZWN0cykpLFxuICAgICAgY29uY2F0TWFwKCgpID0+IG5ldyBPYnNlcnZhYmxlKG9icyA9PiB7XG4gICAgICAgIGNvbnN0IGJyb3dzZXJCdWlsZGVyID0gbmV3IEJyb3dzZXJCdWlsZGVyKHRoaXMuY29udGV4dCk7XG4gICAgICAgIGNvbnN0IHdlYnBhY2tDb25maWcgPSBicm93c2VyQnVpbGRlci5idWlsZFdlYnBhY2tDb25maWcoXG4gICAgICAgICAgcm9vdCwgcHJvamVjdFJvb3QsIGhvc3QsIGJyb3dzZXJPcHRpb25zIGFzIE5vcm1hbGl6ZWRCcm93c2VyQnVpbGRlclNjaGVtYSk7XG4gICAgICAgIGNvbnN0IHN0YXRzQ29uZmlnID0gZ2V0V2VicGFja1N0YXRzQ29uZmlnKGJyb3dzZXJPcHRpb25zLnZlcmJvc2UpO1xuXG4gICAgICAgIGxldCB3ZWJwYWNrRGV2U2VydmVyQ29uZmlnOiBXZWJwYWNrRGV2U2VydmVyQ29uZmlndXJhdGlvbk9wdGlvbnM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgd2VicGFja0RldlNlcnZlckNvbmZpZyA9IHRoaXMuX2J1aWxkU2VydmVyQ29uZmlnKFxuICAgICAgICAgICAgcm9vdCwgcHJvamVjdFJvb3QsIG9wdGlvbnMsIGJyb3dzZXJPcHRpb25zKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgb2JzLmVycm9yKGVycik7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHB1YmxpYyBob3N0IGFuZCBjbGllbnQgYWRkcmVzcy5cbiAgICAgICAgbGV0IGNsaWVudEFkZHJlc3MgPSBgJHtvcHRpb25zLnNzbCA/ICdodHRwcycgOiAnaHR0cCd9Oi8vMC4wLjAuMDowYDtcbiAgICAgICAgaWYgKG9wdGlvbnMucHVibGljSG9zdCkge1xuICAgICAgICAgIGxldCBwdWJsaWNIb3N0ID0gb3B0aW9ucy5wdWJsaWNIb3N0O1xuICAgICAgICAgIGlmICghL15cXHcrOlxcL1xcLy8udGVzdChwdWJsaWNIb3N0KSkge1xuICAgICAgICAgICAgcHVibGljSG9zdCA9IGAke29wdGlvbnMuc3NsID8gJ2h0dHBzJyA6ICdodHRwJ306Ly8ke3B1YmxpY0hvc3R9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2xpZW50VXJsID0gdXJsLnBhcnNlKHB1YmxpY0hvc3QpO1xuICAgICAgICAgIG9wdGlvbnMucHVibGljSG9zdCA9IGNsaWVudFVybC5ob3N0O1xuICAgICAgICAgIGNsaWVudEFkZHJlc3MgPSB1cmwuZm9ybWF0KGNsaWVudFVybCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHNlcnZlIGFkZHJlc3MuXG4gICAgICAgIGNvbnN0IHNlcnZlckFkZHJlc3MgPSB1cmwuZm9ybWF0KHtcbiAgICAgICAgICBwcm90b2NvbDogb3B0aW9ucy5zc2wgPyAnaHR0cHMnIDogJ2h0dHAnLFxuICAgICAgICAgIGhvc3RuYW1lOiBvcHRpb25zLmhvc3QgPT09ICcwLjAuMC4wJyA/ICdsb2NhbGhvc3QnIDogb3B0aW9ucy5ob3N0LFxuICAgICAgICAgIHBvcnQ6IG9wdGlvbnMucG9ydC50b1N0cmluZygpLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgbGl2ZSByZWxvYWQgY29uZmlnLlxuICAgICAgICBpZiAob3B0aW9ucy5saXZlUmVsb2FkKSB7XG4gICAgICAgICAgdGhpcy5fYWRkTGl2ZVJlbG9hZChvcHRpb25zLCBicm93c2VyT3B0aW9ucywgd2VicGFja0NvbmZpZywgY2xpZW50QWRkcmVzcyk7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5obXIpIHtcbiAgICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLndhcm4oJ0xpdmUgcmVsb2FkIGlzIGRpc2FibGVkLiBITVIgb3B0aW9uIGlnbm9yZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9wdGlvbnMud2F0Y2gpIHtcbiAgICAgICAgICAvLyBUaGVyZSdzIG5vIG9wdGlvbiB0byB0dXJuIG9mZiBmaWxlIHdhdGNoaW5nIGluIHdlYnBhY2stZGV2LXNlcnZlciwgYnV0XG4gICAgICAgICAgLy8gd2UgY2FuIG92ZXJyaWRlIHRoZSBmaWxlIHdhdGNoZXIgaW5zdGVhZC5cbiAgICAgICAgICB3ZWJwYWNrQ29uZmlnLnBsdWdpbnMudW5zaGlmdCh7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICAgICBhcHBseTogKGNvbXBpbGVyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgY29tcGlsZXIuaG9va3MuYWZ0ZXJFbnZpcm9ubWVudC50YXAoJ2FuZ3VsYXItY2xpJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBpbGVyLndhdGNoRmlsZVN5c3RlbSA9IHsgd2F0Y2g6ICgpID0+IHsgfSB9O1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYnJvd3Nlck9wdGlvbnMub3B0aW1pemF0aW9uKSB7XG4gICAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci5lcnJvcih0YWdzLnN0cmlwSW5kZW50c2BcbiAgICAgICAgICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAgIFRoaXMgaXMgYSBzaW1wbGUgc2VydmVyIGZvciB1c2UgaW4gdGVzdGluZyBvciBkZWJ1Z2dpbmcgQW5ndWxhciBhcHBsaWNhdGlvbnMgbG9jYWxseS5cbiAgICAgICAgICAgIEl0IGhhc24ndCBiZWVuIHJldmlld2VkIGZvciBzZWN1cml0eSBpc3N1ZXMuXG5cbiAgICAgICAgICAgIERPTidUIFVTRSBJVCBGT1IgUFJPRFVDVElPTiFcbiAgICAgICAgICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICBgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIuaW5mbyh0YWdzLm9uZUxpbmVgXG4gICAgICAgICAgKipcbiAgICAgICAgICBBbmd1bGFyIExpdmUgRGV2ZWxvcG1lbnQgU2VydmVyIGlzIGxpc3RlbmluZyBvbiAke29wdGlvbnMuaG9zdH06JHtvcHRpb25zLnBvcnR9LFxuICAgICAgICAgIG9wZW4geW91ciBicm93c2VyIG9uICR7c2VydmVyQWRkcmVzc30ke3dlYnBhY2tEZXZTZXJ2ZXJDb25maWcucHVibGljUGF0aH1cbiAgICAgICAgICAqKlxuICAgICAgICBgKTtcblxuICAgICAgICBjb25zdCB3ZWJwYWNrQ29tcGlsZXIgPSB3ZWJwYWNrKHdlYnBhY2tDb25maWcpO1xuICAgICAgICBjb25zdCBzZXJ2ZXIgPSBuZXcgV2VicGFja0RldlNlcnZlcih3ZWJwYWNrQ29tcGlsZXIsIHdlYnBhY2tEZXZTZXJ2ZXJDb25maWcpO1xuXG4gICAgICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICAgICAgKHdlYnBhY2tDb21waWxlciBhcyBhbnkpLmhvb2tzLmRvbmUudGFwKCdhbmd1bGFyLWNsaScsIChzdGF0czogd2VicGFjay5TdGF0cykgPT4ge1xuICAgICAgICAgIGlmICghYnJvd3Nlck9wdGlvbnMudmVyYm9zZSkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IHN0YXRzLnRvSnNvbihzdGF0c0NvbmZpZyk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLmluZm8oc3RhdHNUb1N0cmluZyhqc29uLCBzdGF0c0NvbmZpZykpO1xuICAgICAgICAgICAgaWYgKHN0YXRzLmhhc1dhcm5pbmdzKCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci5pbmZvKHN0YXRzV2FybmluZ3NUb1N0cmluZyhqc29uLCBzdGF0c0NvbmZpZykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRzLmhhc0Vycm9ycygpKSB7XG4gICAgICAgICAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIuaW5mbyhzdGF0c0Vycm9yc1RvU3RyaW5nKGpzb24sIHN0YXRzQ29uZmlnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG9icy5uZXh0KHsgc3VjY2VzczogdHJ1ZSB9KTtcblxuICAgICAgICAgIGlmIChmaXJzdCAmJiBvcHRpb25zLm9wZW4pIHtcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICBvcG4oc2VydmVyQWRkcmVzcyArIHdlYnBhY2tEZXZTZXJ2ZXJDb25maWcucHVibGljUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBodHRwU2VydmVyID0gc2VydmVyLmxpc3RlbihcbiAgICAgICAgICBvcHRpb25zLnBvcnQsXG4gICAgICAgICAgb3B0aW9ucy5ob3N0LFxuICAgICAgICAgIChlcnI6IGFueSkgPT4geyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWFueVxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBvYnMuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIE5vZGUgOCBoYXMgYSBrZWVwQWxpdmVUaW1lb3V0IGJ1ZyB3aGljaCBkb2Vzbid0IHJlc3BlY3QgYWN0aXZlIGNvbm5lY3Rpb25zLlxuICAgICAgICAvLyBDb25uZWN0aW9ucyB3aWxsIGVuZCBhZnRlciB+NSBzZWNvbmRzIChhcmJpdHJhcnkpLCBvZnRlbiBub3QgbGV0dGluZyB0aGUgZnVsbCBkb3dubG9hZFxuICAgICAgICAvLyBvZiBsYXJnZSBwaWVjZXMgb2YgY29udGVudCwgc3VjaCBhcyBhIHZlbmRvciBqYXZhc2NyaXB0IGZpbGUuICBUaGlzIHJlc3VsdHMgaW4gYnJvd3NlcnNcbiAgICAgICAgLy8gdGhyb3dpbmcgYSBcIm5ldDo6RVJSX0NPTlRFTlRfTEVOR1RIX01JU01BVENIXCIgZXJyb3IuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXItY2xpL2lzc3Vlcy83MTk3XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9pc3N1ZXMvMTMzOTFcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2NvbW1pdC8yY2I2ZjJiMjgxZWI5NmE3YWJlMTZkNThhZjZlYmM5Y2UyM2QyZTk2XG4gICAgICAgIGlmICgvXnY4LlxcZC5cXGQrJC8udGVzdChwcm9jZXNzLnZlcnNpb24pKSB7XG4gICAgICAgICAgaHR0cFNlcnZlci5rZWVwQWxpdmVUaW1lb3V0ID0gMzAwMDA7IC8vIDMwIHNlY29uZHNcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlYXJkb3duIGxvZ2ljLiBDbG9zZSB0aGUgc2VydmVyIHdoZW4gdW5zdWJzY3JpYmVkIGZyb20uXG4gICAgICAgIHJldHVybiAoKSA9PiBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIH0pKSk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFNlcnZlckNvbmZpZyhcbiAgICByb290OiBQYXRoLFxuICAgIHByb2plY3RSb290OiBQYXRoLFxuICAgIG9wdGlvbnM6IERldlNlcnZlckJ1aWxkZXJPcHRpb25zLFxuICAgIGJyb3dzZXJPcHRpb25zOiBCcm93c2VyQnVpbGRlclNjaGVtYSxcbiAgKSB7XG4gICAgY29uc3Qgc3lzdGVtUm9vdCA9IGdldFN5c3RlbVBhdGgocm9vdCk7XG4gICAgaWYgKG9wdGlvbnMuZGlzYWJsZUhvc3RDaGVjaykge1xuICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci53YXJuKHRhZ3Mub25lTGluZWBcbiAgICAgICAgV0FSTklORzogUnVubmluZyBhIHNlcnZlciB3aXRoIC0tZGlzYWJsZS1ob3N0LWNoZWNrIGlzIGEgc2VjdXJpdHkgcmlzay5cbiAgICAgICAgU2VlIGh0dHBzOi8vbWVkaXVtLmNvbS93ZWJwYWNrL3dlYnBhY2stZGV2LXNlcnZlci1taWRkbGV3YXJlLXNlY3VyaXR5LWlzc3Vlcy0xNDg5ZDk1MDg3NGFcbiAgICAgICAgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICBgKTtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2ZVBhdGggPSB0aGlzLl9idWlsZFNlcnZlUGF0aChvcHRpb25zLCBicm93c2VyT3B0aW9ucyk7XG5cbiAgICBjb25zdCBjb25maWc6IFdlYnBhY2tEZXZTZXJ2ZXJDb25maWd1cmF0aW9uT3B0aW9ucyA9IHtcbiAgICAgIGhlYWRlcnM6IHsgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyB9LFxuICAgICAgaGlzdG9yeUFwaUZhbGxiYWNrOiB7XG4gICAgICAgIGluZGV4OiBgJHtzZXJ2ZVBhdGh9LyR7cGF0aC5iYXNlbmFtZShicm93c2VyT3B0aW9ucy5pbmRleCl9YCxcbiAgICAgICAgZGlzYWJsZURvdFJ1bGU6IHRydWUsXG4gICAgICAgIGh0bWxBY2NlcHRIZWFkZXJzOiBbJ3RleHQvaHRtbCcsICdhcHBsaWNhdGlvbi94aHRtbCt4bWwnXSxcbiAgICAgIH0sXG4gICAgICBzdGF0czogYnJvd3Nlck9wdGlvbnMudmVyYm9zZSA/IGdldFdlYnBhY2tTdGF0c0NvbmZpZyhicm93c2VyT3B0aW9ucy52ZXJib3NlKSA6IGZhbHNlLFxuICAgICAgY29tcHJlc3M6IGJyb3dzZXJPcHRpb25zLm9wdGltaXphdGlvbixcbiAgICAgIHdhdGNoT3B0aW9uczoge1xuICAgICAgICBwb2xsOiBicm93c2VyT3B0aW9ucy5wb2xsLFxuICAgICAgfSxcbiAgICAgIGh0dHBzOiBvcHRpb25zLnNzbCxcbiAgICAgIG92ZXJsYXk6IHtcbiAgICAgICAgZXJyb3JzOiAhYnJvd3Nlck9wdGlvbnMub3B0aW1pemF0aW9uLFxuICAgICAgICB3YXJuaW5nczogZmFsc2UsXG4gICAgICB9LFxuICAgICAgY29udGVudEJhc2U6IGZhbHNlLFxuICAgICAgcHVibGljOiBvcHRpb25zLnB1YmxpY0hvc3QsXG4gICAgICBkaXNhYmxlSG9zdENoZWNrOiBvcHRpb25zLmRpc2FibGVIb3N0Q2hlY2ssXG4gICAgICBwdWJsaWNQYXRoOiBzZXJ2ZVBhdGgsXG4gICAgICBob3Q6IG9wdGlvbnMuaG1yLFxuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucy5zc2wpIHtcbiAgICAgIHRoaXMuX2FkZFNzbENvbmZpZyhzeXN0ZW1Sb290LCBvcHRpb25zLCBjb25maWcpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnByb3h5Q29uZmlnKSB7XG4gICAgICB0aGlzLl9hZGRQcm94eUNvbmZpZyhzeXN0ZW1Sb290LCBvcHRpb25zLCBjb25maWcpO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICBwcml2YXRlIF9hZGRMaXZlUmVsb2FkKFxuICAgIG9wdGlvbnM6IERldlNlcnZlckJ1aWxkZXJPcHRpb25zLFxuICAgIGJyb3dzZXJPcHRpb25zOiBCcm93c2VyQnVpbGRlclNjaGVtYSxcbiAgICB3ZWJwYWNrQ29uZmlnOiBhbnksIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gICAgY2xpZW50QWRkcmVzczogc3RyaW5nLFxuICApIHtcbiAgICAvLyBUaGlzIGFsbG93cyBmb3IgbGl2ZSByZWxvYWQgb2YgcGFnZSB3aGVuIGNoYW5nZXMgYXJlIG1hZGUgdG8gcmVwby5cbiAgICAvLyBodHRwczovL3dlYnBhY2suanMub3JnL2NvbmZpZ3VyYXRpb24vZGV2LXNlcnZlci8jZGV2c2VydmVyLWlubGluZVxuICAgIGxldCB3ZWJwYWNrRGV2U2VydmVyUGF0aDtcbiAgICB0cnkge1xuICAgICAgd2VicGFja0RldlNlcnZlclBhdGggPSByZXF1aXJlLnJlc29sdmUoJ3dlYnBhY2stZGV2LXNlcnZlci9jbGllbnQnKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIFwid2VicGFjay1kZXYtc2VydmVyXCIgcGFja2FnZSBjb3VsZCBub3QgYmUgZm91bmQuJyk7XG4gICAgfVxuICAgIGNvbnN0IGVudHJ5UG9pbnRzID0gW2Ake3dlYnBhY2tEZXZTZXJ2ZXJQYXRofT8ke2NsaWVudEFkZHJlc3N9YF07XG4gICAgaWYgKG9wdGlvbnMuaG1yKSB7XG4gICAgICBjb25zdCB3ZWJwYWNrSG1yTGluayA9ICdodHRwczovL3dlYnBhY2suanMub3JnL2d1aWRlcy9ob3QtbW9kdWxlLXJlcGxhY2VtZW50JztcblxuICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci53YXJuKFxuICAgICAgICB0YWdzLm9uZUxpbmVgTk9USUNFOiBIb3QgTW9kdWxlIFJlcGxhY2VtZW50IChITVIpIGlzIGVuYWJsZWQgZm9yIHRoZSBkZXYgc2VydmVyLmApO1xuXG4gICAgICBjb25zdCBzaG93V2FybmluZyA9IG9wdGlvbnMuaG1yV2FybmluZztcbiAgICAgIGlmIChzaG93V2FybmluZykge1xuICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLmluZm8odGFncy5zdHJpcEluZGVudHNgXG4gICAgICAgICAgVGhlIHByb2plY3Qgd2lsbCBzdGlsbCBsaXZlIHJlbG9hZCB3aGVuIEhNUiBpcyBlbmFibGVkLFxuICAgICAgICAgIGJ1dCB0byB0YWtlIGFkdmFudGFnZSBvZiBITVIgYWRkaXRpb25hbCBhcHBsaWNhdGlvbiBjb2RlIGlzIHJlcXVpcmVkJ1xuICAgICAgICAgIChub3QgaW5jbHVkZWQgaW4gYW4gQW5ndWxhciBDTEkgcHJvamVjdCBieSBkZWZhdWx0KS4nXG4gICAgICAgICAgU2VlICR7d2VicGFja0htckxpbmt9XG4gICAgICAgICAgZm9yIGluZm9ybWF0aW9uIG9uIHdvcmtpbmcgd2l0aCBITVIgZm9yIFdlYnBhY2suYCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci53YXJuKFxuICAgICAgICAgIHRhZ3Mub25lTGluZWBUbyBkaXNhYmxlIHRoaXMgd2FybmluZyB1c2UgXCJobXJXYXJuaW5nOiBmYWxzZVwiIHVuZGVyIFwic2VydmVcIlxuICAgICAgICAgICBvcHRpb25zIGluIFwiYW5ndWxhci5qc29uXCIuYCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGVudHJ5UG9pbnRzLnB1c2goJ3dlYnBhY2svaG90L2Rldi1zZXJ2ZXInKTtcbiAgICAgIHdlYnBhY2tDb25maWcucGx1Z2lucy5wdXNoKG5ldyB3ZWJwYWNrLkhvdE1vZHVsZVJlcGxhY2VtZW50UGx1Z2luKCkpO1xuICAgICAgaWYgKGJyb3dzZXJPcHRpb25zLmV4dHJhY3RDc3MpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci53YXJuKHRhZ3Mub25lTGluZWBOT1RJQ0U6IChITVIpIGRvZXMgbm90IGFsbG93IGZvciBDU1MgaG90IHJlbG9hZFxuICAgICAgICAgICAgICAgIHdoZW4gdXNlZCB0b2dldGhlciB3aXRoICctLWV4dHJhY3QtY3NzJy5gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCF3ZWJwYWNrQ29uZmlnLmVudHJ5Lm1haW4pIHsgd2VicGFja0NvbmZpZy5lbnRyeS5tYWluID0gW107IH1cbiAgICB3ZWJwYWNrQ29uZmlnLmVudHJ5Lm1haW4udW5zaGlmdCguLi5lbnRyeVBvaW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9hZGRTc2xDb25maWcoXG4gICAgcm9vdDogc3RyaW5nLFxuICAgIG9wdGlvbnM6IERldlNlcnZlckJ1aWxkZXJPcHRpb25zLFxuICAgIGNvbmZpZzogV2VicGFja0RldlNlcnZlckNvbmZpZ3VyYXRpb25PcHRpb25zLFxuICApIHtcbiAgICBsZXQgc3NsS2V5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHNzbENlcnQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAob3B0aW9ucy5zc2xLZXkpIHtcbiAgICAgIGNvbnN0IGtleVBhdGggPSBwYXRoLnJlc29sdmUocm9vdCwgb3B0aW9ucy5zc2xLZXkgYXMgc3RyaW5nKTtcbiAgICAgIGlmIChleGlzdHNTeW5jKGtleVBhdGgpKSB7XG4gICAgICAgIHNzbEtleSA9IHJlYWRGaWxlU3luYyhrZXlQYXRoLCAndXRmLTgnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc3NsQ2VydCkge1xuICAgICAgY29uc3QgY2VydFBhdGggPSBwYXRoLnJlc29sdmUocm9vdCwgb3B0aW9ucy5zc2xDZXJ0IGFzIHN0cmluZyk7XG4gICAgICBpZiAoZXhpc3RzU3luYyhjZXJ0UGF0aCkpIHtcbiAgICAgICAgc3NsQ2VydCA9IHJlYWRGaWxlU3luYyhjZXJ0UGF0aCwgJ3V0Zi04Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uZmlnLmh0dHBzID0gdHJ1ZTtcbiAgICBpZiAoc3NsS2V5ICE9IG51bGwgJiYgc3NsQ2VydCAhPSBudWxsKSB7XG4gICAgICBjb25maWcua2V5ID0gc3NsS2V5O1xuICAgICAgY29uZmlnLmNlcnQgPSBzc2xDZXJ0O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FkZFByb3h5Q29uZmlnKFxuICAgIHJvb3Q6IHN0cmluZyxcbiAgICBvcHRpb25zOiBEZXZTZXJ2ZXJCdWlsZGVyT3B0aW9ucyxcbiAgICBjb25maWc6IFdlYnBhY2tEZXZTZXJ2ZXJDb25maWd1cmF0aW9uT3B0aW9ucyxcbiAgKSB7XG4gICAgbGV0IHByb3h5Q29uZmlnID0ge307XG4gICAgY29uc3QgcHJveHlQYXRoID0gcGF0aC5yZXNvbHZlKHJvb3QsIG9wdGlvbnMucHJveHlDb25maWcgYXMgc3RyaW5nKTtcbiAgICBpZiAoZXhpc3RzU3luYyhwcm94eVBhdGgpKSB7XG4gICAgICBwcm94eUNvbmZpZyA9IHJlcXVpcmUocHJveHlQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbWVzc2FnZSA9ICdQcm94eSBjb25maWcgZmlsZSAnICsgcHJveHlQYXRoICsgJyBkb2VzIG5vdCBleGlzdC4nO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbiAgICBjb25maWcucHJveHkgPSBwcm94eUNvbmZpZztcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkU2VydmVQYXRoKG9wdGlvbnM6IERldlNlcnZlckJ1aWxkZXJPcHRpb25zLCBicm93c2VyT3B0aW9uczogQnJvd3NlckJ1aWxkZXJTY2hlbWEpIHtcbiAgICBsZXQgc2VydmVQYXRoID0gb3B0aW9ucy5zZXJ2ZVBhdGg7XG4gICAgaWYgKCFzZXJ2ZVBhdGggJiYgc2VydmVQYXRoICE9PSAnJykge1xuICAgICAgY29uc3QgZGVmYXVsdFNlcnZlUGF0aCA9XG4gICAgICAgIHRoaXMuX2ZpbmREZWZhdWx0U2VydmVQYXRoKGJyb3dzZXJPcHRpb25zLmJhc2VIcmVmLCBicm93c2VyT3B0aW9ucy5kZXBsb3lVcmwpO1xuICAgICAgY29uc3Qgc2hvd1dhcm5pbmcgPSBvcHRpb25zLnNlcnZlUGF0aERlZmF1bHRXYXJuaW5nO1xuICAgICAgaWYgKGRlZmF1bHRTZXJ2ZVBhdGggPT0gbnVsbCAmJiBzaG93V2FybmluZykge1xuICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLndhcm4odGFncy5vbmVMaW5lYFxuICAgICAgICAgICAgV0FSTklORzogLS1kZXBsb3ktdXJsIGFuZC9vciAtLWJhc2UtaHJlZiBjb250YWluXG4gICAgICAgICAgICB1bnN1cHBvcnRlZCB2YWx1ZXMgZm9yIG5nIHNlcnZlLiAgRGVmYXVsdCBzZXJ2ZSBwYXRoIG9mICcvJyB1c2VkLlxuICAgICAgICAgICAgVXNlIC0tc2VydmUtcGF0aCB0byBvdmVycmlkZS5cbiAgICAgICAgICBgKTtcbiAgICAgIH1cbiAgICAgIHNlcnZlUGF0aCA9IGRlZmF1bHRTZXJ2ZVBhdGggfHwgJyc7XG4gICAgfVxuICAgIGlmIChzZXJ2ZVBhdGguZW5kc1dpdGgoJy8nKSkge1xuICAgICAgc2VydmVQYXRoID0gc2VydmVQYXRoLnN1YnN0cigwLCBzZXJ2ZVBhdGgubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIGlmICghc2VydmVQYXRoLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgICAgc2VydmVQYXRoID0gYC8ke3NlcnZlUGF0aH1gO1xuICAgIH1cblxuICAgIHJldHVybiBzZXJ2ZVBhdGg7XG4gIH1cblxuICBwcml2YXRlIF9maW5kRGVmYXVsdFNlcnZlUGF0aChiYXNlSHJlZj86IHN0cmluZywgZGVwbG95VXJsPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCFiYXNlSHJlZiAmJiAhZGVwbG95VXJsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgaWYgKC9eKFxcdys6KT9cXC9cXC8vLnRlc3QoYmFzZUhyZWYgfHwgJycpIHx8IC9eKFxcdys6KT9cXC9cXC8vLnRlc3QoZGVwbG95VXJsIHx8ICcnKSkge1xuICAgICAgLy8gSWYgYmFzZUhyZWYgb3IgZGVwbG95VXJsIGlzIGFic29sdXRlLCB1bnN1cHBvcnRlZCBieSBuZyBzZXJ2ZVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gbm9ybWFsaXplIGJhc2VIcmVmXG4gICAgLy8gZm9yIG5nIHNlcnZlIHRoZSBzdGFydGluZyBiYXNlIGlzIGFsd2F5cyBgL2Agc28gYSByZWxhdGl2ZVxuICAgIC8vIGFuZCByb290IHJlbGF0aXZlIHZhbHVlIGFyZSBpZGVudGljYWxcbiAgICBjb25zdCBiYXNlSHJlZlBhcnRzID0gKGJhc2VIcmVmIHx8ICcnKVxuICAgICAgLnNwbGl0KCcvJylcbiAgICAgIC5maWx0ZXIocGFydCA9PiBwYXJ0ICE9PSAnJyk7XG4gICAgaWYgKGJhc2VIcmVmICYmICFiYXNlSHJlZi5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBiYXNlSHJlZlBhcnRzLnBvcCgpO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkQmFzZUhyZWYgPSBiYXNlSHJlZlBhcnRzLmxlbmd0aCA9PT0gMCA/ICcvJyA6IGAvJHtiYXNlSHJlZlBhcnRzLmpvaW4oJy8nKX0vYDtcblxuICAgIGlmIChkZXBsb3lVcmwgJiYgZGVwbG95VXJsWzBdID09PSAnLycpIHtcbiAgICAgIGlmIChiYXNlSHJlZiAmJiBiYXNlSHJlZlswXSA9PT0gJy8nICYmIG5vcm1hbGl6ZWRCYXNlSHJlZiAhPT0gZGVwbG95VXJsKSB7XG4gICAgICAgIC8vIElmIGJhc2VIcmVmIGFuZCBkZXBsb3lVcmwgYXJlIHJvb3QgcmVsYXRpdmUgYW5kIG5vdCBlcXVpdmFsZW50LCB1bnN1cHBvcnRlZCBieSBuZyBzZXJ2ZVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlcGxveVVybDtcbiAgICB9XG5cbiAgICAvLyBKb2luIHRvZ2V0aGVyIGJhc2VIcmVmIGFuZCBkZXBsb3lVcmxcbiAgICByZXR1cm4gYCR7bm9ybWFsaXplZEJhc2VIcmVmfSR7ZGVwbG95VXJsIHx8ICcnfWA7XG4gIH1cblxuICBwcml2YXRlIF9nZXRCcm93c2VyT3B0aW9ucyhvcHRpb25zOiBEZXZTZXJ2ZXJCdWlsZGVyT3B0aW9ucykge1xuICAgIGNvbnN0IGFyY2hpdGVjdCA9IHRoaXMuY29udGV4dC5hcmNoaXRlY3Q7XG4gICAgY29uc3QgW3Byb2plY3QsIHRhcmdldCwgY29uZmlndXJhdGlvbl0gPSBvcHRpb25zLmJyb3dzZXJUYXJnZXQuc3BsaXQoJzonKTtcbiAgICAvLyBPdmVycmlkZSBicm93c2VyIGJ1aWxkIHdhdGNoIHNldHRpbmcuXG4gICAgY29uc3Qgb3ZlcnJpZGVzID0geyB3YXRjaDogb3B0aW9ucy53YXRjaCB9O1xuICAgIGNvbnN0IGJyb3dzZXJUYXJnZXRTcGVjID0geyBwcm9qZWN0LCB0YXJnZXQsIGNvbmZpZ3VyYXRpb24sIG92ZXJyaWRlcyB9O1xuICAgIGNvbnN0IGJ1aWxkZXJDb25maWcgPSBhcmNoaXRlY3QuZ2V0QnVpbGRlckNvbmZpZ3VyYXRpb248QnJvd3NlckJ1aWxkZXJTY2hlbWE+KFxuICAgICAgYnJvd3NlclRhcmdldFNwZWMpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBicm93c2VyIG9wdGlvbnMgd2l0aCB0aGUgc2FtZSBvcHRpb25zIHdlIHN1cHBvcnQgaW4gc2VydmUsIGlmIGRlZmluZWQuXG4gICAgYnVpbGRlckNvbmZpZy5vcHRpb25zID0ge1xuICAgICAgLi4uKG9wdGlvbnMub3B0aW1pemF0aW9uICE9PSB1bmRlZmluZWQgPyB7IG9wdGltaXphdGlvbjogb3B0aW9ucy5vcHRpbWl6YXRpb24gfSA6IHt9KSxcbiAgICAgIC4uLihvcHRpb25zLmFvdCAhPT0gdW5kZWZpbmVkID8geyBhb3Q6IG9wdGlvbnMuYW90IH0gOiB7fSksXG4gICAgICAuLi4ob3B0aW9ucy5zb3VyY2VNYXAgIT09IHVuZGVmaW5lZCA/IHsgc291cmNlTWFwOiBvcHRpb25zLnNvdXJjZU1hcCB9IDoge30pLFxuICAgICAgLi4uKG9wdGlvbnMuZXZhbFNvdXJjZU1hcCAhPT0gdW5kZWZpbmVkID8geyBldmFsU291cmNlTWFwOiBvcHRpb25zLmV2YWxTb3VyY2VNYXAgfSA6IHt9KSxcbiAgICAgIC4uLihvcHRpb25zLnZlbmRvckNodW5rICE9PSB1bmRlZmluZWQgPyB7IHZlbmRvckNodW5rOiBvcHRpb25zLnZlbmRvckNodW5rIH0gOiB7fSksXG4gICAgICAuLi4ob3B0aW9ucy5jb21tb25DaHVuayAhPT0gdW5kZWZpbmVkID8geyBjb21tb25DaHVuazogb3B0aW9ucy5jb21tb25DaHVuayB9IDoge30pLFxuICAgICAgLi4uKG9wdGlvbnMuYmFzZUhyZWYgIT09IHVuZGVmaW5lZCA/IHsgYmFzZUhyZWY6IG9wdGlvbnMuYmFzZUhyZWYgfSA6IHt9KSxcbiAgICAgIC4uLihvcHRpb25zLnByb2dyZXNzICE9PSB1bmRlZmluZWQgPyB7IHByb2dyZXNzOiBvcHRpb25zLnByb2dyZXNzIH0gOiB7fSksXG4gICAgICAuLi4ob3B0aW9ucy5wb2xsICE9PSB1bmRlZmluZWQgPyB7IHBvbGw6IG9wdGlvbnMucG9sbCB9IDoge30pLFxuXG4gICAgICAuLi5idWlsZGVyQ29uZmlnLm9wdGlvbnMsXG4gICAgfTtcblxuICAgIHJldHVybiBhcmNoaXRlY3QuZ2V0QnVpbGRlckRlc2NyaXB0aW9uKGJ1aWxkZXJDb25maWcpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoYnJvd3NlckRlc2NyaXB0aW9uID0+XG4gICAgICAgIGFyY2hpdGVjdC52YWxpZGF0ZUJ1aWxkZXJPcHRpb25zKGJ1aWxkZXJDb25maWcsIGJyb3dzZXJEZXNjcmlwdGlvbikpLFxuICAgICAgbWFwKGJyb3dzZXJDb25maWcgPT4gYnJvd3NlckNvbmZpZy5vcHRpb25zKSxcbiAgICApO1xuICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgRGV2U2VydmVyQnVpbGRlcjtcbiJdfQ==