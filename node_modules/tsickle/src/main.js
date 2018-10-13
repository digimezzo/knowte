#!/usr/bin/env node
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
        define("tsickle/src/main", ["require", "exports", "fs", "minimist", "mkdirp", "path", "tsickle/src/typescript", "tsickle/src/cli_support", "tsickle/src/tsickle", "tsickle/src/tsickle", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs");
    var minimist = require("minimist");
    var mkdirp = require("mkdirp");
    var path = require("path");
    var ts = require("tsickle/src/typescript");
    var cliSupport = require("tsickle/src/cli_support");
    var tsickle = require("tsickle/src/tsickle");
    var tsickle_1 = require("tsickle/src/tsickle");
    var util_1 = require("tsickle/src/util");
    function usage() {
        console.error("usage: tsickle [tsickle options] -- [tsc options]\n\nexample:\n  tsickle --externs=foo/externs.js -- -p src --noImplicitAny\n\ntsickle flags are:\n  --externs=PATH        save generated Closure externs.js to PATH\n  --typed               [experimental] attempt to provide Closure types instead of {?}\n  --disableAutoQuoting  do not automatically apply quotes to property accesses\n");
    }
    /**
     * Parses the command-line arguments, extracting the tsickle settings and
     * the arguments to pass on to tsc.
     */
    function loadSettingsFromArgs(args) {
        var e_1, _a;
        var settings = {};
        var parsedArgs = minimist(args);
        try {
            for (var _b = __values(Object.keys(parsedArgs)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var flag = _c.value;
                switch (flag) {
                    case 'h':
                    case 'help':
                        usage();
                        process.exit(0);
                        break;
                    case 'externs':
                        settings.externsPath = parsedArgs[flag];
                        break;
                    case 'typed':
                        settings.isTyped = true;
                        break;
                    case 'verbose':
                        settings.verbose = true;
                        break;
                    case 'disableAutoQuoting':
                        settings.disableAutoQuoting = true;
                        break;
                    case '_':
                        // This is part of the minimist API, and holds args after the '--'.
                        break;
                    default:
                        console.error("unknown flag '--" + flag + "'");
                        usage();
                        process.exit(1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Arguments after the '--' arg are arguments to tsc.
        var tscArgs = parsedArgs['_'];
        return { settings: settings, tscArgs: tscArgs };
    }
    /**
     * Loads the tsconfig.json from a directory.
     *
     * TODO(martinprobst): use ts.findConfigFile to match tsc behaviour.
     *
     * @param args tsc command-line arguments.
     */
    function loadTscConfig(args) {
        var _a;
        // Gather tsc options/input files from command line.
        var _b = ts.parseCommandLine(args), options = _b.options, fileNames = _b.fileNames, errors = _b.errors;
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // Store file arguments
        var tsFileArguments = fileNames;
        // Read further settings from tsconfig.json.
        var projectDir = options.project || '.';
        var configFileName = path.join(projectDir, 'tsconfig.json');
        var _c = ts.readConfigFile(configFileName, function (path) { return fs.readFileSync(path, 'utf-8'); }), json = _c.config, error = _c.error;
        if (error) {
            return { options: {}, fileNames: [], errors: [error] };
        }
        (_a = ts.parseJsonConfigFileContent(json, ts.sys, projectDir, options, configFileName), options = _a.options, fileNames = _a.fileNames, errors = _a.errors);
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // if file arguments were given to the typescript transpiler then transpile only those files
        fileNames = tsFileArguments.length > 0 ? tsFileArguments : fileNames;
        return { options: options, fileNames: fileNames, errors: [] };
    }
    /**
     * Compiles TypeScript code into Closure-compiler-ready JS.
     */
    function toClosureJS(options, fileNames, settings, writeFile) {
        // Use absolute paths to determine what files to process since files may be imported using
        // relative or absolute paths
        var absoluteFileNames = fileNames.map(function (i) { return path.resolve(i); });
        var compilerHost = ts.createCompilerHost(options);
        var program = ts.createProgram(fileNames, options, compilerHost);
        var filesToProcess = new Set(absoluteFileNames);
        var rootModulePath = options.rootDir || util_1.getCommonParentDirectory(absoluteFileNames);
        var transformerHost = {
            shouldSkipTsickleProcessing: function (fileName) {
                return !filesToProcess.has(path.resolve(fileName));
            },
            shouldIgnoreWarningsForPath: function (fileName) { return false; },
            pathToModuleName: cliSupport.pathToModuleName.bind(null, rootModulePath),
            fileNameToModuleId: function (fileName) { return path.relative(rootModulePath, fileName); },
            es5Mode: true,
            googmodule: true,
            transformDecorators: true,
            transformTypesToClosure: true,
            typeBlackListPaths: new Set(),
            disableAutoQuoting: settings.disableAutoQuoting,
            untyped: false,
            logWarning: function (warning) { return console.error(ts.formatDiagnostics([warning], compilerHost)); },
            options: options,
            host: compilerHost,
        };
        var diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length > 0) {
            return {
                diagnostics: diagnostics,
                modulesManifest: new tsickle_1.ModulesManifest(),
                externs: {},
                emitSkipped: true,
                emittedFiles: [],
            };
        }
        return tsickle.emitWithTsickle(program, transformerHost, compilerHost, options, undefined, writeFile);
    }
    exports.toClosureJS = toClosureJS;
    function main(args) {
        var _a = loadSettingsFromArgs(args), settings = _a.settings, tscArgs = _a.tscArgs;
        var config = loadTscConfig(tscArgs);
        if (config.errors.length) {
            console.error(ts.formatDiagnostics(config.errors, ts.createCompilerHost(config.options)));
            return 1;
        }
        if (config.options.module !== ts.ModuleKind.CommonJS) {
            // This is not an upstream TypeScript diagnostic, therefore it does not go
            // through the diagnostics array mechanism.
            console.error('tsickle converts TypeScript modules to Closure modules via CommonJS internally. ' +
                'Set tsconfig.js "module": "commonjs"');
            return 1;
        }
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var result = toClosureJS(config.options, config.fileNames, settings, function (filePath, contents) {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, contents, { encoding: 'utf-8' });
        });
        if (result.diagnostics.length) {
            console.error(ts.formatDiagnostics(result.diagnostics, ts.createCompilerHost(config.options)));
            return 1;
        }
        if (settings.externsPath) {
            mkdirp.sync(path.dirname(settings.externsPath));
            fs.writeFileSync(settings.externsPath, tsickle.getGeneratedExterns(result.externs));
        }
        return 0;
    }
    // CLI entry point
    if (require.main === module) {
        process.exit(main(process.argv.splice(2)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFVQSx1QkFBeUI7SUFDekIsbUNBQXFDO0lBQ3JDLCtCQUFpQztJQUNqQywyQkFBNkI7SUFDN0IsMkNBQW1DO0lBRW5DLG9EQUE0QztJQUM1Qyw2Q0FBcUM7SUFDckMsK0NBQTBDO0lBQzFDLHlDQUFnRDtJQWlCaEQ7UUFDRSxPQUFPLENBQUMsS0FBSyxDQUFDLGdZQVNmLENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCw4QkFBOEIsSUFBYzs7UUFDMUMsSUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO1FBQzlCLElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7WUFDbEMsS0FBbUIsSUFBQSxLQUFBLFNBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQSxnQkFBQSw0QkFBRTtnQkFBdkMsSUFBTSxJQUFJLFdBQUE7Z0JBQ2IsUUFBUSxJQUFJLEVBQUU7b0JBQ1osS0FBSyxHQUFHLENBQUM7b0JBQ1QsS0FBSyxNQUFNO3dCQUNULEtBQUssRUFBRSxDQUFDO3dCQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLE1BQU07b0JBQ1IsS0FBSyxTQUFTO3dCQUNaLFFBQVEsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN4QyxNQUFNO29CQUNSLEtBQUssT0FBTzt3QkFDVixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDeEIsTUFBTTtvQkFDUixLQUFLLFNBQVM7d0JBQ1osUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7d0JBQ3hCLE1BQU07b0JBQ1IsS0FBSyxvQkFBb0I7d0JBQ3ZCLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENB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LGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0YsT0FBTyxDQUFDLENBQUM7U0FDVjtRQUVELElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNyRjtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELGtCQUFrQjtJQUNsQixJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtaW5pbWlzdCBmcm9tICdtaW5pbWlzdCc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQgKiBhcyBjbGlTdXBwb3J0IGZyb20gJy4vY2xpX3N1cHBvcnQnO1xuaW1wb3J0ICogYXMgdHNpY2tsZSBmcm9tICcuL3RzaWNrbGUnO1xuaW1wb3J0IHtNb2R1bGVzTWFuaWZlc3R9IGZyb20gJy4vdHNpY2tsZSc7XG5pbXBvcnQge2dldENvbW1vblBhcmVudERpcmVjdG9yeX0gZnJvbSAnLi91dGlsJztcblxuLyoqIFRzaWNrbGUgc2V0dGluZ3MgcGFzc2VkIG9uIHRoZSBjb21tYW5kIGxpbmUuICovXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzIHtcbiAgLyoqIElmIHByb3ZpZGVkLCBkbyBub3QgbW9kaWZ5IHF1b3Rpbmcgb2YgcHJvcGVydHkgYWNjZXNzZXMuICovXG4gIGRpc2FibGVBdXRvUXVvdGluZz86IGJvb2xlYW47XG5cbiAgLyoqIElmIHByb3ZpZGVkLCBwYXRoIHRvIHNhdmUgZXh0ZXJucyB0by4gKi9cbiAgZXh0ZXJuc1BhdGg/OiBzdHJpbmc7XG5cbiAgLyoqIElmIHByb3ZpZGVkLCBhdHRlbXB0IHRvIHByb3ZpZGUgdHlwZXMgcmF0aGVyIHRoYW4gez99LiAqL1xuICBpc1R5cGVkPzogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSwgbG9nIGludGVybmFsIGRlYnVnIHdhcm5pbmdzIHRvIHRoZSBjb25zb2xlLiAqL1xuICB2ZXJib3NlPzogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gdXNhZ2UoKSB7XG4gIGNvbnNvbGUuZXJyb3IoYHVzYWdlOiB0c2lja2xlIFt0c2lja2xlIG9wdGlvbnNdIC0tIFt0c2Mgb3B0aW9uc11cblxuZXhhbXBsZTpcbiAgdHNpY2tsZSAtLWV4dGVybnM9Zm9vL2V4dGVybnMuanMgLS0gLXAgc3JjIC0tbm9JbXBsaWNpdEFueVxuXG50c2lja2xlIGZsYWdzIGFyZTpcbiAgLS1leHRlcm5zPVBBVEggICAgICAgIHNhdmUgZ2VuZXJhdGVkIENsb3N1cmUgZXh0ZXJucy5qcyB0byBQQVRIXG4gIC0tdHlwZWQgICAgICAgICAgICAgICBbZXhwZXJpbWVudGFsXSBhdHRlbXB0IHRvIHByb3ZpZGUgQ2xvc3VyZSB0eXBlcyBpbnN0ZWFkIG9mIHs/fVxuICAtLWRpc2FibGVBdXRvUXVvdGluZyAgZG8gbm90IGF1dG9tYXRpY2FsbHkgYXBwbHkgcXVvdGVzIHRvIHByb3BlcnR5IGFjY2Vzc2VzXG5gKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGNvbW1hbmQtbGluZSBhcmd1bWVudHMsIGV4dHJhY3RpbmcgdGhlIHRzaWNrbGUgc2V0dGluZ3MgYW5kXG4gKiB0aGUgYXJndW1lbnRzIHRvIHBhc3Mgb24gdG8gdHNjLlxuICovXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3NGcm9tQXJncyhhcmdzOiBzdHJpbmdbXSk6IHtzZXR0aW5nczogU2V0dGluZ3MsIHRzY0FyZ3M6IHN0cmluZ1tdfSB7XG4gIGNvbnN0IHNldHRpbmdzOiBTZXR0aW5ncyA9IHt9O1xuICBjb25zdCBwYXJzZWRBcmdzID0gbWluaW1pc3QoYXJncyk7XG4gIGZvciAoY29uc3QgZmxhZyBvZiBPYmplY3Qua2V5cyhwYXJzZWRBcmdzKSkge1xuICAgIHN3aXRjaCAoZmxhZykge1xuICAgICAgY2FzZSAnaCc6XG4gICAgICBjYXNlICdoZWxwJzpcbiAgICAgICAgdXNhZ2UoKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2V4dGVybnMnOlxuICAgICAgICBzZXR0aW5ncy5leHRlcm5zUGF0aCA9IHBhcnNlZEFyZ3NbZmxhZ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndHlwZWQnOlxuICAgICAgICBzZXR0aW5ncy5pc1R5cGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd2ZXJib3NlJzpcbiAgICAgICAgc2V0dGluZ3MudmVyYm9zZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGlzYWJsZUF1dG9RdW90aW5nJzpcbiAgICAgICAgc2V0dGluZ3MuZGlzYWJsZUF1dG9RdW90aW5nID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdfJzpcbiAgICAgICAgLy8gVGhpcyBpcyBwYXJ0IG9mIHRoZSBtaW5pbWlzdCBBUEksIGFuZCBob2xkcyBhcmdzIGFmdGVyIHRoZSAnLS0nLlxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHVua25vd24gZmxhZyAnLS0ke2ZsYWd9J2ApO1xuICAgICAgICB1c2FnZSgpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9XG4gIC8vIEFyZ3VtZW50cyBhZnRlciB0aGUgJy0tJyBhcmcgYXJlIGFyZ3VtZW50cyB0byB0c2MuXG4gIGNvbnN0IHRzY0FyZ3MgPSBwYXJzZWRBcmdzWydfJ107XG4gIHJldHVybiB7c2V0dGluZ3MsIHRzY0FyZ3N9O1xufVxuXG4vKipcbiAqIExvYWRzIHRoZSB0c2NvbmZpZy5qc29uIGZyb20gYSBkaXJlY3RvcnkuXG4gKlxuICogVE9ETyhtYXJ0aW5wcm9ic3QpOiB1c2UgdHMuZmluZENvbmZpZ0ZpbGUgdG8gbWF0Y2ggdHNjIGJlaGF2aW91ci5cbiAqXG4gKiBAcGFyYW0gYXJncyB0c2MgY29tbWFuZC1saW5lIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gbG9hZFRzY0NvbmZpZyhhcmdzOiBzdHJpbmdbXSk6XG4gICAge29wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucywgZmlsZU5hbWVzOiBzdHJpbmdbXSwgZXJyb3JzOiB0cy5EaWFnbm9zdGljW119IHtcbiAgLy8gR2F0aGVyIHRzYyBvcHRpb25zL2lucHV0IGZpbGVzIGZyb20gY29tbWFuZCBsaW5lLlxuICBsZXQge29wdGlvbnMsIGZpbGVOYW1lcywgZXJyb3JzfSA9IHRzLnBhcnNlQ29tbWFuZExpbmUoYXJncyk7XG4gIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7b3B0aW9uczoge30sIGZpbGVOYW1lczogW10sIGVycm9yc307XG4gIH1cblxuICAvLyBTdG9yZSBmaWxlIGFyZ3VtZW50c1xuICBjb25zdCB0c0ZpbGVBcmd1bWVudHMgPSBmaWxlTmFtZXM7XG5cbiAgLy8gUmVhZCBmdXJ0aGVyIHNldHRpbmdzIGZyb20gdHNjb25maWcuanNvbi5cbiAgY29uc3QgcHJvamVjdERpciA9IG9wdGlvbnMucHJvamVjdCB8fCAnLic7XG4gIGNvbnN0IGNvbmZpZ0ZpbGVOYW1lID0gcGF0aC5qb2luKHByb2plY3REaXIsICd0c2NvbmZpZy5qc29uJyk7XG4gIGNvbnN0IHtjb25maWc6IGpzb24sIGVycm9yfSA9XG4gICAgICB0cy5yZWFkQ29uZmlnRmlsZShjb25maWdGaWxlTmFtZSwgcGF0aCA9PiBmcy5yZWFkRmlsZVN5bmMocGF0aCwgJ3V0Zi04JykpO1xuICBpZiAoZXJyb3IpIHtcbiAgICByZXR1cm4ge29wdGlvbnM6IHt9LCBmaWxlTmFtZXM6IFtdLCBlcnJvcnM6IFtlcnJvcl19O1xuICB9XG4gICh7b3B0aW9ucywgZmlsZU5hbWVzLCBlcnJvcnN9ID1cbiAgICAgICB0cy5wYXJzZUpzb25Db25maWdGaWxlQ29udGVudChqc29uLCB0cy5zeXMsIHByb2plY3REaXIsIG9wdGlvbnMsIGNvbmZpZ0ZpbGVOYW1lKSk7XG4gIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7b3B0aW9uczoge30sIGZpbGVOYW1lczogW10sIGVycm9yc307XG4gIH1cblxuICAvLyBpZiBmaWxlIGFyZ3VtZW50cyB3ZXJlIGdpdmVuIHRvIHRoZSB0eXBlc2NyaXB0IHRyYW5zcGlsZXIgdGhlbiB0cmFuc3BpbGUgb25seSB0aG9zZSBmaWxlc1xuICBmaWxlTmFtZXMgPSB0c0ZpbGVBcmd1bWVudHMubGVuZ3RoID4gMCA/IHRzRmlsZUFyZ3VtZW50cyA6IGZpbGVOYW1lcztcblxuICByZXR1cm4ge29wdGlvbnMsIGZpbGVOYW1lcywgZXJyb3JzOiBbXX07XG59XG5cbi8qKlxuICogQ29tcGlsZXMgVHlwZVNjcmlwdCBjb2RlIGludG8gQ2xvc3VyZS1jb21waWxlci1yZWFkeSBKUy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvQ2xvc3VyZUpTKFxuICAgIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucywgZmlsZU5hbWVzOiBzdHJpbmdbXSwgc2V0dGluZ3M6IFNldHRpbmdzLFxuICAgIHdyaXRlRmlsZT86IHRzLldyaXRlRmlsZUNhbGxiYWNrKTogdHNpY2tsZS5FbWl0UmVzdWx0IHtcbiAgLy8gVXNlIGFic29sdXRlIHBhdGhzIHRvIGRldGVybWluZSB3aGF0IGZpbGVzIHRvIHByb2Nlc3Mgc2luY2UgZmlsZXMgbWF5IGJlIGltcG9ydGVkIHVzaW5nXG4gIC8vIHJlbGF0aXZlIG9yIGFic29sdXRlIHBhdGhzXG4gIGNvbnN0IGFic29sdXRlRmlsZU5hbWVzID0gZmlsZU5hbWVzLm1hcChpID0+IHBhdGgucmVzb2x2ZShpKSk7XG5cbiAgY29uc3QgY29tcGlsZXJIb3N0ID0gdHMuY3JlYXRlQ29tcGlsZXJIb3N0KG9wdGlvbnMpO1xuICBjb25zdCBwcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbShmaWxlTmFtZXMsIG9wdGlvbnMsIGNvbXBpbGVySG9zdCk7XG4gIGNvbnN0IGZpbGVzVG9Qcm9jZXNzID0gbmV3IFNldChhYnNvbHV0ZUZpbGVOYW1lcyk7XG4gIGNvbnN0IHJvb3RNb2R1bGVQYXRoID0gb3B0aW9ucy5yb290RGlyIHx8IGdldENvbW1vblBhcmVudERpcmVjdG9yeShhYnNvbHV0ZUZpbGVOYW1lcyk7XG4gIGNvbnN0IHRyYW5zZm9ybWVySG9zdDogdHNpY2tsZS5Uc2lja2xlSG9zdCA9IHtcbiAgICBzaG91bGRTa2lwVHNpY2tsZVByb2Nlc3Npbmc6IChmaWxlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gIWZpbGVzVG9Qcm9jZXNzLmhhcyhwYXRoLnJlc29sdmUoZmlsZU5hbWUpKTtcbiAgICB9LFxuICAgIHNob3VsZElnbm9yZVdhcm5pbmdzRm9yUGF0aDogKGZpbGVOYW1lOiBzdHJpbmcpID0+IGZhbHNlLFxuICAgIHBhdGhUb01vZHVsZU5hbWU6IGNsaVN1cHBvcnQucGF0aFRvTW9kdWxlTmFtZS5iaW5kKG51bGwsIHJvb3RNb2R1bGVQYXRoKSxcbiAgICBmaWxlTmFtZVRvTW9kdWxlSWQ6IChmaWxlTmFtZSkgPT4gcGF0aC5yZWxhdGl2ZShyb290TW9kdWxlUGF0aCwgZmlsZU5hbWUpLFxuICAgIGVzNU1vZGU6IHRydWUsXG4gICAgZ29vZ21vZHVsZTogdHJ1ZSxcbiAgICB0cmFuc2Zvcm1EZWNvcmF0b3JzOiB0cnVlLFxuICAgIHRyYW5zZm9ybVR5cGVzVG9DbG9zdXJlOiB0cnVlLFxuICAgIHR5cGVCbGFja0xpc3RQYXRoczogbmV3IFNldCgpLFxuICAgIGRpc2FibGVBdXRvUXVvdGluZzogc2V0dGluZ3MuZGlzYWJsZUF1dG9RdW90aW5nLFxuICAgIHVudHlwZWQ6IGZhbHNlLFxuICAgIGxvZ1dhcm5pbmc6ICh3YXJuaW5nKSA9PiBjb25zb2xlLmVycm9yKHRzLmZvcm1hdERpYWdub3N0aWNzKFt3YXJuaW5nXSwgY29tcGlsZXJIb3N0KSksXG4gICAgb3B0aW9ucyxcbiAgICBob3N0OiBjb21waWxlckhvc3QsXG4gIH07XG4gIGNvbnN0IGRpYWdub3N0aWNzID0gdHMuZ2V0UHJlRW1pdERpYWdub3N0aWNzKHByb2dyYW0pO1xuICBpZiAoZGlhZ25vc3RpY3MubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBkaWFnbm9zdGljcyxcbiAgICAgIG1vZHVsZXNNYW5pZmVzdDogbmV3IE1vZHVsZXNNYW5pZmVzdCgpLFxuICAgICAgZXh0ZXJuczoge30sXG4gICAgICBlbWl0U2tpcHBlZDogdHJ1ZSxcbiAgICAgIGVtaXR0ZWRGaWxlczogW10sXG4gICAgfTtcbiAgfVxuICByZXR1cm4gdHNpY2tsZS5lbWl0V2l0aFRzaWNrbGUoXG4gICAgICBwcm9ncmFtLCB0cmFuc2Zvcm1lckhvc3QsIGNvbXBpbGVySG9zdCwgb3B0aW9ucywgdW5kZWZpbmVkLCB3cml0ZUZpbGUpO1xufVxuXG5mdW5jdGlvbiBtYWluKGFyZ3M6IHN0cmluZ1tdKTogbnVtYmVyIHtcbiAgY29uc3Qge3NldHRpbmdzLCB0c2NBcmdzfSA9IGxvYWRTZXR0aW5nc0Zyb21BcmdzKGFyZ3MpO1xuICBjb25zdCBjb25maWcgPSBsb2FkVHNjQ29uZmlnKHRzY0FyZ3MpO1xuICBpZiAoY29uZmlnLmVycm9ycy5sZW5ndGgpIHtcbiAgICBjb25zb2xlLmVycm9yKHRzLmZvcm1hdERpYWdub3N0aWNzKGNvbmZpZy5lcnJvcnMsIHRzLmNyZWF0ZUNvbXBpbGVySG9zdChjb25maWcub3B0aW9ucykpKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGlmIChjb25maWcub3B0aW9ucy5tb2R1bGUgIT09IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlMpIHtcbiAgICAvLyBUaGlzIGlzIG5vdCBhbiB1cHN0cmVhbSBUeXBlU2NyaXB0IGRpYWdub3N0aWMsIHRoZXJlZm9yZSBpdCBkb2VzIG5vdCBnb1xuICAgIC8vIHRocm91Z2ggdGhlIGRpYWdub3N0aWNzIGFycmF5IG1lY2hhbmlzbS5cbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAndHNpY2tsZSBjb252ZXJ0cyBUeXBlU2NyaXB0IG1vZHVsZXMgdG8gQ2xvc3VyZSBtb2R1bGVzIHZpYSBDb21tb25KUyBpbnRlcm5hbGx5LiAnICtcbiAgICAgICAgJ1NldCB0c2NvbmZpZy5qcyBcIm1vZHVsZVwiOiBcImNvbW1vbmpzXCInKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIFJ1biB0c2lja2xlK1RTQyB0byBjb252ZXJ0IGlucHV0cyB0byBDbG9zdXJlIEpTIGZpbGVzLlxuICBjb25zdCByZXN1bHQgPSB0b0Nsb3N1cmVKUyhcbiAgICAgIGNvbmZpZy5vcHRpb25zLCBjb25maWcuZmlsZU5hbWVzLCBzZXR0aW5ncywgKGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbWtkaXJwLnN5bmMocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSk7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbnRlbnRzLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9KTtcbiAgICAgIH0pO1xuICBpZiAocmVzdWx0LmRpYWdub3N0aWNzLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZXJyb3IodHMuZm9ybWF0RGlhZ25vc3RpY3MocmVzdWx0LmRpYWdub3N0aWNzLCB0cy5jcmVhdGVDb21waWxlckhvc3QoY29uZmlnLm9wdGlvbnMpKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBpZiAoc2V0dGluZ3MuZXh0ZXJuc1BhdGgpIHtcbiAgICBta2RpcnAuc3luYyhwYXRoLmRpcm5hbWUoc2V0dGluZ3MuZXh0ZXJuc1BhdGgpKTtcbiAgICBmcy53cml0ZUZpbGVTeW5jKHNldHRpbmdzLmV4dGVybnNQYXRoLCB0c2lja2xlLmdldEdlbmVyYXRlZEV4dGVybnMocmVzdWx0LmV4dGVybnMpKTtcbiAgfVxuICByZXR1cm4gMDtcbn1cblxuLy8gQ0xJIGVudHJ5IHBvaW50XG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgcHJvY2Vzcy5leGl0KG1haW4ocHJvY2Vzcy5hcmd2LnNwbGljZSgyKSkpO1xufVxuIl19