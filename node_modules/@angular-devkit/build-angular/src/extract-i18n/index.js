"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const path = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const webpack = require("webpack");
const webpack_configs_1 = require("../angular-cli-files/models/webpack-configs");
const utils_1 = require("../angular-cli-files/models/webpack-configs/utils");
const read_tsconfig_1 = require("../angular-cli-files/utilities/read-tsconfig");
const stats_1 = require("../angular-cli-files/utilities/stats");
const MemoryFS = require('memory-fs');
const webpackMerge = require('webpack-merge');
class ExtractI18nBuilder {
    constructor(context) {
        this.context = context;
    }
    run(builderConfig) {
        const architect = this.context.architect;
        const options = builderConfig.options;
        const root = this.context.workspace.root;
        const projectRoot = core_1.resolve(root, builderConfig.root);
        const [project, targetName, configuration] = options.browserTarget.split(':');
        // Override browser build watch setting.
        const overrides = { watch: false };
        const browserTargetSpec = { project, target: targetName, configuration, overrides };
        const browserBuilderConfig = architect.getBuilderConfiguration(browserTargetSpec);
        return architect.getBuilderDescription(browserBuilderConfig).pipe(operators_1.concatMap(browserDescription => architect.validateBuilderOptions(browserBuilderConfig, browserDescription)), operators_1.map(browserBuilderConfig => browserBuilderConfig.options), operators_1.concatMap((validatedBrowserOptions) => new rxjs_1.Observable(obs => {
            const browserOptions = validatedBrowserOptions;
            // We need to determine the outFile name so that AngularCompiler can retrieve it.
            let outFile = options.outFile || getI18nOutfile(options.i18nFormat);
            if (options.outputPath) {
                // AngularCompilerPlugin doesn't support genDir so we have to adjust outFile instead.
                outFile = path.join(options.outputPath, outFile);
            }
            // Extracting i18n uses the browser target webpack config with some specific options.
            const webpackConfig = this.buildWebpackConfig(root, projectRoot, Object.assign({}, browserOptions, { optimization: false, i18nLocale: options.i18nLocale, i18nFormat: options.i18nFormat, i18nFile: outFile, aot: true, assets: [], scripts: [], styles: [] }));
            const webpackCompiler = webpack(webpackConfig);
            webpackCompiler.outputFileSystem = new MemoryFS();
            const statsConfig = utils_1.getWebpackStatsConfig();
            const callback = (err, stats) => {
                if (err) {
                    return obs.error(err);
                }
                const json = stats.toJson('verbose');
                if (stats.hasWarnings()) {
                    this.context.logger.warn(stats_1.statsWarningsToString(json, statsConfig));
                }
                if (stats.hasErrors()) {
                    this.context.logger.error(stats_1.statsErrorsToString(json, statsConfig));
                }
                obs.next({ success: !stats.hasErrors() });
                obs.complete();
            };
            try {
                webpackCompiler.run(callback);
            }
            catch (err) {
                if (err) {
                    this.context.logger.error('\nAn error occured during the extraction:\n' + ((err && err.stack) || err));
                }
                throw err;
            }
        })));
    }
    buildWebpackConfig(root, projectRoot, options) {
        let wco;
        const host = new core_1.virtualFs.AliasHost(this.context.host);
        const tsConfigPath = core_1.getSystemPath(core_1.normalize(core_1.resolve(root, core_1.normalize(options.tsConfig))));
        const tsConfig = read_tsconfig_1.readTsconfig(tsConfigPath);
        wco = {
            root: core_1.getSystemPath(root),
            projectRoot: core_1.getSystemPath(projectRoot),
            // TODO: use only this.options, it contains all flags and configs items already.
            buildOptions: options,
            tsConfig,
            tsConfigPath,
            supportES2015: false,
        };
        const webpackConfigs = [
            webpack_configs_1.getCommonConfig(wco),
            webpack_configs_1.getAotConfig(wco, host, true),
            webpack_configs_1.getStylesConfig(wco),
        ];
        return webpackMerge(webpackConfigs);
    }
}
exports.ExtractI18nBuilder = ExtractI18nBuilder;
function getI18nOutfile(format) {
    switch (format) {
        case 'xmb':
            return 'messages.xmb';
        case 'xlf':
        case 'xlif':
        case 'xliff':
        case 'xlf2':
        case 'xliff2':
            return 'messages.xlf';
        default:
            throw new Error(`Unsupported format "${format}"`);
    }
}
exports.default = ExtractI18nBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2V4dHJhY3QtaTE4bi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLCtDQUEwRjtBQUUxRiw2QkFBNkI7QUFDN0IsK0JBQWtDO0FBQ2xDLDhDQUFnRDtBQUNoRCxtQ0FBbUM7QUFFbkMsaUZBSXFEO0FBQ3JELDZFQUEwRjtBQUMxRixnRkFBNEU7QUFDNUUsZ0VBQWtHO0FBR2xHLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN0QyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFXOUM7SUFFRSxZQUFtQixPQUF1QjtRQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtJQUFJLENBQUM7SUFFL0MsR0FBRyxDQUFDLGFBQThEO1FBQ2hFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ3pDLE1BQU0sV0FBVyxHQUFHLGNBQU8sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlFLHdDQUF3QztRQUN4QyxNQUFNLFNBQVMsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUVuQyxNQUFNLGlCQUFpQixHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxD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QztJQUN0QyxDQUFDO0NBQ0Y7QUE5R0QsZ0RBOEdDO0FBRUQsd0JBQXdCLE1BQWM7SUFDcEMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNmLEtBQUssS0FBSztZQUNSLE1BQU0sQ0FBQyxjQUFjLENBQUM7UUFDeEIsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLE1BQU0sQ0FBQztRQUNaLEtBQUssT0FBTyxDQUFDO1FBQ2IsS0FBSyxNQUFNLENBQUM7UUFDWixLQUFLLFFBQVE7WUFDWCxNQUFNLENBQUMsY0FBYyxDQUFDO1FBQ3hCO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0FBQ0gsQ0FBQztBQUVELGtCQUFlLGtCQUFrQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgQnVpbGRFdmVudCxcbiAgQnVpbGRlcixcbiAgQnVpbGRlckNvbmZpZ3VyYXRpb24sXG4gIEJ1aWxkZXJDb250ZXh0LFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvYXJjaGl0ZWN0JztcbmltcG9ydCB7IFBhdGgsIGdldFN5c3RlbVBhdGgsIG5vcm1hbGl6ZSwgcmVzb2x2ZSwgdmlydHVhbEZzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNvbmNhdE1hcCwgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0ICogYXMgd2VicGFjayBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IFdlYnBhY2tDb25maWdPcHRpb25zIH0gZnJvbSAnLi4vYW5ndWxhci1jbGktZmlsZXMvbW9kZWxzL2J1aWxkLW9wdGlvbnMnO1xuaW1wb3J0IHtcbiAgZ2V0QW90Q29uZmlnLFxuICBnZXRDb21tb25Db25maWcsXG4gIGdldFN0eWxlc0NvbmZpZyxcbn0gZnJvbSAnLi4vYW5ndWxhci1jbGktZmlsZXMvbW9kZWxzL3dlYnBhY2stY29uZmlncyc7XG5pbXBvcnQgeyBnZXRXZWJwYWNrU3RhdHNDb25maWcgfSBmcm9tICcuLi9hbmd1bGFyLWNsaS1maWxlcy9tb2RlbHMvd2VicGFjay1jb25maWdzL3V0aWxzJztcbmltcG9ydCB7IHJlYWRUc2NvbmZpZyB9IGZyb20gJy4uL2FuZ3VsYXItY2xpLWZpbGVzL3V0aWxpdGllcy9yZWFkLXRzY29uZmlnJztcbmltcG9ydCB7IHN0YXRzRXJyb3JzVG9TdHJpbmcsIHN0YXRzV2FybmluZ3NUb1N0cmluZyB9IGZyb20gJy4uL2FuZ3VsYXItY2xpLWZpbGVzL3V0aWxpdGllcy9zdGF0cyc7XG5pbXBvcnQgeyBOb3JtYWxpemVkQnJvd3NlckJ1aWxkZXJTY2hlbWEgfSBmcm9tICcuLi9icm93c2VyJztcbmltcG9ydCB7IEJyb3dzZXJCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi4vYnJvd3Nlci9zY2hlbWEnO1xuY29uc3QgTWVtb3J5RlMgPSByZXF1aXJlKCdtZW1vcnktZnMnKTtcbmNvbnN0IHdlYnBhY2tNZXJnZSA9IHJlcXVpcmUoJ3dlYnBhY2stbWVyZ2UnKTtcblxuXG5leHBvcnQgaW50ZXJmYWNlIEV4dHJhY3RJMThuQnVpbGRlck9wdGlvbnMge1xuICBicm93c2VyVGFyZ2V0OiBzdHJpbmc7XG4gIGkxOG5Gb3JtYXQ6IHN0cmluZztcbiAgaTE4bkxvY2FsZTogc3RyaW5nO1xuICBvdXRwdXRQYXRoPzogc3RyaW5nO1xuICBvdXRGaWxlPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRXh0cmFjdEkxOG5CdWlsZGVyIGltcGxlbWVudHMgQnVpbGRlcjxFeHRyYWN0STE4bkJ1aWxkZXJPcHRpb25zPiB7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0KSB7IH1cblxuICBydW4oYnVpbGRlckNvbmZpZzogQnVpbGRlckNvbmZpZ3VyYXRpb248RXh0cmFjdEkxOG5CdWlsZGVyT3B0aW9ucz4pOiBPYnNlcnZhYmxlPEJ1aWxkRXZlbnQ+IHtcbiAgICBjb25zdCBhcmNoaXRlY3QgPSB0aGlzLmNvbnRleHQuYXJjaGl0ZWN0O1xuICAgIGNvbnN0IG9wdGlvbnMgPSBidWlsZGVyQ29uZmlnLm9wdGlvbnM7XG4gICAgY29uc3Qgcm9vdCA9IHRoaXMuY29udGV4dC53b3Jrc3BhY2Uucm9vdDtcbiAgICBjb25zdCBwcm9qZWN0Um9vdCA9IHJlc29sdmUocm9vdCwgYnVpbGRlckNvbmZpZy5yb290KTtcbiAgICBjb25zdCBbcHJvamVjdCwgdGFyZ2V0TmFtZSwgY29uZmlndXJhdGlvbl0gPSBvcHRpb25zLmJyb3dzZXJUYXJnZXQuc3BsaXQoJzonKTtcbiAgICAvLyBPdmVycmlkZSBicm93c2VyIGJ1aWxkIHdhdGNoIHNldHRpbmcuXG4gICAgY29uc3Qgb3ZlcnJpZGVzID0geyB3YXRjaDogZmFsc2UgfTtcblxuICAgIGNvbnN0IGJyb3dzZXJUYXJnZXRTcGVjID0geyBwcm9qZWN0LCB0YXJnZXQ6IHRhcmdldE5hbWUsIGNvbmZpZ3VyYXRpb24sIG92ZXJyaWRlcyB9O1xuICAgIGNvbnN0IGJyb3dzZXJCdWlsZGVyQ29uZmlnID0gYXJjaGl0ZWN0LmdldEJ1aWxkZXJDb25maWd1cmF0aW9uPEJyb3dzZXJCdWlsZGVyU2NoZW1hPihcbiAgICAgIGJyb3dzZXJUYXJnZXRTcGVjKTtcblxuICAgIHJldHVybiBhcmNoaXRlY3QuZ2V0QnVpbGRlckRlc2NyaXB0aW9uKGJyb3dzZXJCdWlsZGVyQ29uZmlnKS5waXBlKFxuICAgICAgY29uY2F0TWFwKGJyb3dzZXJEZXNjcmlwdGlvbiA9PlxuICAgICAgICBhcmNoaXRlY3QudmFsaWRhdGVCdWlsZGVyT3B0aW9ucyhicm93c2VyQnVpbGRlckNvbmZpZywgYnJvd3NlckRlc2NyaXB0aW9uKSksXG4gICAgICBtYXAoYnJvd3NlckJ1aWxkZXJDb25maWcgPT4gYnJvd3NlckJ1aWxkZXJDb25maWcub3B0aW9ucyksXG4gICAgICBjb25jYXRNYXAoKHZhbGlkYXRlZEJyb3dzZXJPcHRpb25zKSA9PiBuZXcgT2JzZXJ2YWJsZShvYnMgPT4ge1xuICAgICAgICBjb25zdCBicm93c2VyT3B0aW9ucyA9IHZhbGlkYXRlZEJyb3dzZXJPcHRpb25zO1xuXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gZGV0ZXJtaW5lIHRoZSBvdXRGaWxlIG5hbWUgc28gdGhhdCBBbmd1bGFyQ29tcGlsZXIgY2FuIHJldHJpZXZlIGl0LlxuICAgICAgICBsZXQgb3V0RmlsZSA9IG9wdGlvbnMub3V0RmlsZSB8fCBnZXRJMThuT3V0ZmlsZShvcHRpb25zLmkxOG5Gb3JtYXQpO1xuICAgICAgICBpZiAob3B0aW9ucy5vdXRwdXRQYXRoKSB7XG4gICAgICAgICAgLy8gQW5ndWxhckNvbXBpbGVyUGx1Z2luIGRvZXNuJ3Qgc3VwcG9ydCBnZW5EaXIgc28gd2UgaGF2ZSB0byBhZGp1c3Qgb3V0RmlsZSBpbnN0ZWFkLlxuICAgICAgICAgIG91dEZpbGUgPSBwYXRoLmpvaW4ob3B0aW9ucy5vdXRwdXRQYXRoLCBvdXRGaWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV4dHJhY3RpbmcgaTE4biB1c2VzIHRoZSBicm93c2VyIHRhcmdldCB3ZWJwYWNrIGNvbmZpZyB3aXRoIHNvbWUgc3BlY2lmaWMgb3B0aW9ucy5cbiAgICAgICAgY29uc3Qgd2VicGFja0NvbmZpZyA9IHRoaXMuYnVpbGRXZWJwYWNrQ29uZmlnKHJvb3QsIHByb2plY3RSb290LCB7XG4gICAgICAgICAgLi4uYnJvd3Nlck9wdGlvbnMsXG4gICAgICAgICAgb3B0aW1pemF0aW9uOiBmYWxzZSxcbiAgICAgICAgICBpMThuTG9jYWxlOiBvcHRpb25zLmkxOG5Mb2NhbGUsXG4gICAgICAgICAgaTE4bkZvcm1hdDogb3B0aW9ucy5pMThuRm9ybWF0LFxuICAgICAgICAgIGkxOG5GaWxlOiBvdXRGaWxlLFxuICAgICAgICAgIGFvdDogdHJ1ZSxcbiAgICAgICAgICBhc3NldHM6IFtdLFxuICAgICAgICAgIHNjcmlwdHM6IFtdLFxuICAgICAgICAgIHN0eWxlczogW10sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHdlYnBhY2tDb21waWxlciA9IHdlYnBhY2sod2VicGFja0NvbmZpZyk7XG4gICAgICAgIHdlYnBhY2tDb21waWxlci5vdXRwdXRGaWxlU3lzdGVtID0gbmV3IE1lbW9yeUZTKCk7XG4gICAgICAgIGNvbnN0IHN0YXRzQ29uZmlnID0gZ2V0V2VicGFja1N0YXRzQ29uZmlnKCk7XG5cbiAgICAgICAgY29uc3QgY2FsbGJhY2s6IHdlYnBhY2suY29tcGlsZXIuQ29tcGlsZXJDYWxsYmFjayA9IChlcnIsIHN0YXRzKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIG9icy5lcnJvcihlcnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGpzb24gPSBzdGF0cy50b0pzb24oJ3ZlcmJvc2UnKTtcbiAgICAgICAgICBpZiAoc3RhdHMuaGFzV2FybmluZ3MoKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci53YXJuKHN0YXRzV2FybmluZ3NUb1N0cmluZyhqc29uLCBzdGF0c0NvbmZpZykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzdGF0cy5oYXNFcnJvcnMoKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci5lcnJvcihzdGF0c0Vycm9yc1RvU3RyaW5nKGpzb24sIHN0YXRzQ29uZmlnKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb2JzLm5leHQoeyBzdWNjZXNzOiAhc3RhdHMuaGFzRXJyb3JzKCkgfSk7XG5cbiAgICAgICAgICBvYnMuY29tcGxldGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHdlYnBhY2tDb21waWxlci5ydW4oY2FsbGJhY2spO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAnXFxuQW4gZXJyb3Igb2NjdXJlZCBkdXJpbmcgdGhlIGV4dHJhY3Rpb246XFxuJyArICgoZXJyICYmIGVyci5zdGFjaykgfHwgZXJyKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgfSkpLFxuICAgICk7XG4gIH1cblxuICBidWlsZFdlYnBhY2tDb25maWcoXG4gICAgcm9vdDogUGF0aCxcbiAgICBwcm9qZWN0Um9vdDogUGF0aCxcbiAgICBvcHRpb25zOiBOb3JtYWxpemVkQnJvd3NlckJ1aWxkZXJTY2hlbWEsXG4gICkge1xuICAgIGxldCB3Y286IFdlYnBhY2tDb25maWdPcHRpb25zO1xuXG4gICAgY29uc3QgaG9zdCA9IG5ldyB2aXJ0dWFsRnMuQWxpYXNIb3N0KHRoaXMuY29udGV4dC5ob3N0IGFzIHZpcnR1YWxGcy5Ib3N0PGZzLlN0YXRzPik7XG5cbiAgICBjb25zdCB0c0NvbmZpZ1BhdGggPSBnZXRTeXN0ZW1QYXRoKG5vcm1hbGl6ZShyZXNvbHZlKHJvb3QsIG5vcm1hbGl6ZShvcHRpb25zLnRzQ29uZmlnKSkpKTtcbiAgICBjb25zdCB0c0NvbmZpZyA9IHJlYWRUc2NvbmZpZyh0c0NvbmZpZ1BhdGgpO1xuXG4gICAgd2NvID0ge1xuICAgICAgcm9vdDogZ2V0U3lzdGVtUGF0aChyb290KSxcbiAgICAgIHByb2plY3RSb290OiBnZXRTeXN0ZW1QYXRoKHByb2plY3RSb290KSxcbiAgICAgIC8vIFRPRE86IHVzZSBvbmx5IHRoaXMub3B0aW9ucywgaXQgY29udGFpbnMgYWxsIGZsYWdzIGFuZCBjb25maWdzIGl0ZW1zIGFscmVhZHkuXG4gICAgICBidWlsZE9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICB0c0NvbmZpZyxcbiAgICAgIHRzQ29uZmlnUGF0aCxcbiAgICAgIHN1cHBvcnRFUzIwMTU6IGZhbHNlLFxuICAgIH07XG5cbiAgICBjb25zdCB3ZWJwYWNrQ29uZmlnczoge31bXSA9IFtcbiAgICAgIGdldENvbW1vbkNvbmZpZyh3Y28pLFxuICAgICAgZ2V0QW90Q29uZmlnKHdjbywgaG9zdCwgdHJ1ZSksXG4gICAgICBnZXRTdHlsZXNDb25maWcod2NvKSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHdlYnBhY2tNZXJnZSh3ZWJwYWNrQ29uZmlncyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0STE4bk91dGZpbGUoZm9ybWF0OiBzdHJpbmcpIHtcbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICBjYXNlICd4bWInOlxuICAgICAgcmV0dXJuICdtZXNzYWdlcy54bWInO1xuICAgIGNhc2UgJ3hsZic6XG4gICAgY2FzZSAneGxpZic6XG4gICAgY2FzZSAneGxpZmYnOlxuICAgIGNhc2UgJ3hsZjInOlxuICAgIGNhc2UgJ3hsaWZmMic6XG4gICAgICByZXR1cm4gJ21lc3NhZ2VzLnhsZic7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZm9ybWF0IFwiJHtmb3JtYXR9XCJgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFeHRyYWN0STE4bkJ1aWxkZXI7XG4iXX0=