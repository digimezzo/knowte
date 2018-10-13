"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// TODO: fix typings.
// tslint:disable-next-line:no-global-tslint-disable
// tslint:disable:no-any
const path = require("path");
const vm = require("vm");
const webpack_sources_1 = require("webpack-sources");
const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const LoaderTargetPlugin = require('webpack/lib/LoaderTargetPlugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
class WebpackResourceLoader {
    constructor() {
        this._fileDependencies = new Map();
        this._cachedSources = new Map();
        this._cachedEvaluatedSources = new Map();
    }
    update(parentCompilation) {
        this._parentCompilation = parentCompilation;
        this._context = parentCompilation.context;
    }
    getResourceDependencies(filePath) {
        return this._fileDependencies.get(filePath) || [];
    }
    _compile(filePath) {
        if (!this._parentCompilation) {
            throw new Error('WebpackResourceLoader cannot be used without parentCompilation');
        }
        // Simple sanity check.
        if (filePath.match(/\.[jt]s$/)) {
            return Promise.reject('Cannot use a JavaScript or TypeScript file for styleUrl.');
        }
        const outputOptions = { filename: filePath };
        const relativePath = path.relative(this._context || '', filePath);
        const childCompiler = this._parentCompilation.createChildCompiler(relativePath, outputOptions);
        childCompiler.context = this._context;
        new NodeTemplatePlugin(outputOptions).apply(childCompiler);
        new NodeTargetPlugin().apply(childCompiler);
        new SingleEntryPlugin(this._context, filePath).apply(childCompiler);
        new LoaderTargetPlugin('node').apply(childCompiler);
        childCompiler.hooks.thisCompilation.tap('ngtools-webpack', (compilation) => {
            compilation.hooks.additionalAssets.tapAsync('ngtools-webpack', (callback) => {
                if (this._cachedEvaluatedSources.has(compilation.fullHash)) {
                    const cachedEvaluatedSource = this._cachedEvaluatedSources.get(compilation.fullHash);
                    compilation.assets[filePath] = cachedEvaluatedSource;
                    callback();
                    return;
                }
                const asset = compilation.assets[filePath];
                if (asset) {
                    this._evaluate({ outputName: filePath, source: asset.source() })
                        .then(output => {
                        const evaluatedSource = new webpack_sources_1.RawSource(output);
                        this._cachedEvaluatedSources.set(compilation.fullHash, evaluatedSource);
                        compilation.assets[filePath] = evaluatedSource;
                        callback();
                    })
                        .catch(err => callback(err));
                }
                else {
                    callback();
                }
            });
        });
        // Compile and return a promise
        return new Promise((resolve, reject) => {
            childCompiler.compile((err, childCompilation) => {
                // Resolve / reject the promise
                if (childCompilation && childCompilation.errors && childCompilation.errors.length) {
                    const errorDetails = childCompilation.errors.map(function (error) {
                        return error.message + (error.error ? ':\n' + error.error : '');
                    }).join('\n');
                    reject(new Error('Child compilation failed:\n' + errorDetails));
                }
                else if (err) {
                    reject(err);
                }
                else {
                    Object.keys(childCompilation.assets).forEach(assetName => {
                        if (assetName !== filePath && this._parentCompilation.assets[assetName] == undefined) {
                            this._parentCompilation.assets[assetName] = childCompilation.assets[assetName];
                        }
                    });
                    // Save the dependencies for this resource.
                    this._fileDependencies.set(filePath, childCompilation.fileDependencies);
                    const compilationHash = childCompilation.fullHash;
                    const maybeSource = this._cachedSources.get(compilationHash);
                    if (maybeSource) {
                        resolve({ outputName: filePath, source: maybeSource });
                    }
                    else {
                        const source = childCompilation.assets[filePath].source();
                        this._cachedSources.set(compilationHash, source);
                        resolve({ outputName: filePath, source });
                    }
                }
            });
        });
    }
    _evaluate({ outputName, source }) {
        try {
            // Evaluate code
            const evaluatedSource = vm.runInNewContext(source, undefined, { filename: outputName });
            if (typeof evaluatedSource == 'string') {
                return Promise.resolve(evaluatedSource);
            }
            return Promise.reject('The loader "' + outputName + '" didn\'t return a string.');
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    get(filePath) {
        return this._compile(filePath)
            .then((result) => result.source);
    }
}
exports.WebpackResourceLoader = WebpackResourceLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9uZ3Rvb2xzL3dlYnBhY2svc3JjL3Jlc291cmNlX2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILHFCQUFxQjtBQUNyQixvREFBb0Q7QUFDcEQsd0JBQXdCO0FBQ3hCLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekIscURBQTRDO0FBRTVDLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDMUUsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsbUNBQW1DLENBQUMsQ0FBQztBQUN0RSxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3JFLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFRbkU7SUFPRTtRQUpRLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBQ2hELG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDM0MsNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFFaEQsQ0FBQztJQUVoQixNQUFNLENBQUMsaUJBQXNCO1FBQzNCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztRQUM1QyxJQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztJQUM1QyxDQUFDO0lBRUQsdUJBQXVCLENBQUMsUUFBZ0I7UUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFFTyxRQUFRLENBQUMsUUFBZ0I7UUFFL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sSUFBSSxL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QUMsZUFBZSxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxVQUFVLEdBQUcsNEJBQTRCLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBRUQsR0FBRyxDQUFDLFFBQWdCO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQzthQUMzQixJQUFJLENBQUMsQ0FBQyxNQUF5QixFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEQsQ0FBQztDQUNGO0FBekhELHNEQXlIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vIFRPRE86IGZpeCB0eXBpbmdzLlxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWdsb2JhbC10c2xpbnQtZGlzYWJsZVxuLy8gdHNsaW50OmRpc2FibGU6bm8tYW55XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdm0gZnJvbSAndm0nO1xuaW1wb3J0IHsgUmF3U291cmNlIH0gZnJvbSAnd2VicGFjay1zb3VyY2VzJztcblxuY29uc3QgTm9kZVRlbXBsYXRlUGx1Z2luID0gcmVxdWlyZSgnd2VicGFjay9saWIvbm9kZS9Ob2RlVGVtcGxhdGVQbHVnaW4nKTtcbmNvbnN0IE5vZGVUYXJnZXRQbHVnaW4gPSByZXF1aXJlKCd3ZWJwYWNrL2xpYi9ub2RlL05vZGVUYXJnZXRQbHVnaW4nKTtcbmNvbnN0IExvYWRlclRhcmdldFBsdWdpbiA9IHJlcXVpcmUoJ3dlYnBhY2svbGliL0xvYWRlclRhcmdldFBsdWdpbicpO1xuY29uc3QgU2luZ2xlRW50cnlQbHVnaW4gPSByZXF1aXJlKCd3ZWJwYWNrL2xpYi9TaW5nbGVFbnRyeVBsdWdpbicpO1xuXG5cbmludGVyZmFjZSBDb21waWxhdGlvbk91dHB1dCB7XG4gIG91dHB1dE5hbWU6IHN0cmluZztcbiAgc291cmNlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJwYWNrUmVzb3VyY2VMb2FkZXIge1xuICBwcml2YXRlIF9wYXJlbnRDb21waWxhdGlvbjogYW55O1xuICBwcml2YXRlIF9jb250ZXh0OiBzdHJpbmc7XG4gIHByaXZhdGUgX2ZpbGVEZXBlbmRlbmNpZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gIHByaXZhdGUgX2NhY2hlZFNvdXJjZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBwcml2YXRlIF9jYWNoZWRFdmFsdWF0ZWRTb3VyY2VzID0gbmV3IE1hcDxzdHJpbmcsIFJhd1NvdXJjZT4oKTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgdXBkYXRlKHBhcmVudENvbXBpbGF0aW9uOiBhbnkpIHtcbiAgICB0aGlzLl9wYXJlbnRDb21waWxhdGlvbiA9IHBhcmVudENvbXBpbGF0aW9uO1xuICAgIHRoaXMuX2NvbnRleHQgPSBwYXJlbnRDb21waWxhdGlvbi5jb250ZXh0O1xuICB9XG5cbiAgZ2V0UmVzb3VyY2VEZXBlbmRlbmNpZXMoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLl9maWxlRGVwZW5kZW5jaWVzLmdldChmaWxlUGF0aCkgfHwgW107XG4gIH1cblxuICBwcml2YXRlIF9jb21waWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPENvbXBpbGF0aW9uT3V0cHV0PiB7XG5cbiAgICBpZiAoIXRoaXMuX3BhcmVudENvbXBpbGF0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYnBhY2tSZXNvdXJjZUxvYWRlciBjYW5ub3QgYmUgdXNlZCB3aXRob3V0IHBhcmVudENvbXBpbGF0aW9uJyk7XG4gICAgfVxuXG4gICAgLy8gU2ltcGxlIHNhbml0eSBjaGVjay5cbiAgICBpZiAoZmlsZVBhdGgubWF0Y2goL1xcLltqdF1zJC8pKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0Nhbm5vdCB1c2UgYSBKYXZhU2NyaXB0IG9yIFR5cGVTY3JpcHQgZmlsZSBmb3Igc3R5bGVVcmwuJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cHV0T3B0aW9ucyA9IHsgZmlsZW5hbWU6IGZpbGVQYXRoIH07XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gcGF0aC5yZWxhdGl2ZSh0aGlzLl9jb250ZXh0IHx8ICcnLCBmaWxlUGF0aCk7XG4gICAgY29uc3QgY2hpbGRDb21waWxlciA9IHRoaXMuX3BhcmVudENvbXBpbGF0aW9uLmNyZWF0ZUNoaWxkQ29tcGlsZXIocmVsYXRpdmVQYXRoLCBvdXRwdXRPcHRpb25zKTtcbiAgICBjaGlsZENvbXBpbGVyLmNvbnRleHQgPSB0aGlzLl9jb250ZXh0O1xuXG4gICAgbmV3IE5vZGVUZW1wbGF0ZVBsdWdpbihvdXRwdXRPcHRpb25zKS5hcHBseShjaGlsZENvbXBpbGVyKTtcbiAgICBuZXcgTm9kZVRhcmdldFBsdWdpbigpLmFwcGx5KGNoaWxkQ29tcGlsZXIpO1xuICAgIG5ldyBTaW5nbGVFbnRyeVBsdWdpbih0aGlzLl9jb250ZXh0LCBmaWxlUGF0aCkuYXBwbHkoY2hpbGRDb21waWxlcik7XG4gICAgbmV3IExvYWRlclRhcmdldFBsdWdpbignbm9kZScpLmFwcGx5KGNoaWxkQ29tcGlsZXIpO1xuXG4gICAgY2hpbGRDb21waWxlci5ob29rcy50aGlzQ29tcGlsYXRpb24udGFwKCduZ3Rvb2xzLXdlYnBhY2snLCAoY29tcGlsYXRpb246IGFueSkgPT4ge1xuICAgICAgY29tcGlsYXRpb24uaG9va3MuYWRkaXRpb25hbEFzc2V0cy50YXBBc3luYygnbmd0b29scy13ZWJwYWNrJyxcbiAgICAgIChjYWxsYmFjazogKGVycj86IEVycm9yKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWRFdmFsdWF0ZWRTb3VyY2VzLmhhcyhjb21waWxhdGlvbi5mdWxsSGFzaCkpIHtcbiAgICAgICAgICBjb25zdCBjYWNoZWRFdmFsdWF0ZWRTb3VyY2UgPSB0aGlzLl9jYWNoZWRFdmFsdWF0ZWRTb3VyY2VzLmdldChjb21waWxhdGlvbi5mdWxsSGFzaCk7XG4gICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW2ZpbGVQYXRoXSA9IGNhY2hlZEV2YWx1YXRlZFNvdXJjZTtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXNzZXQgPSBjb21waWxhdGlvbi5hc3NldHNbZmlsZVBhdGhdO1xuICAgICAgICBpZiAoYXNzZXQpIHtcbiAgICAgICAgICB0aGlzLl9ldmFsdWF0ZSh7IG91dHB1dE5hbWU6IGZpbGVQYXRoLCBzb3VyY2U6IGFzc2V0LnNvdXJjZSgpIH0pXG4gICAgICAgICAgICAudGhlbihvdXRwdXQgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBldmFsdWF0ZWRTb3VyY2UgPSBuZXcgUmF3U291cmNlKG91dHB1dCk7XG4gICAgICAgICAgICAgIHRoaXMuX2NhY2hlZEV2YWx1YXRlZFNvdXJjZXMuc2V0KGNvbXBpbGF0aW9uLmZ1bGxIYXNoLCBldmFsdWF0ZWRTb3VyY2UpO1xuICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbZmlsZVBhdGhdID0gZXZhbHVhdGVkU291cmNlO1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gY2FsbGJhY2soZXJyKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBDb21waWxlIGFuZCByZXR1cm4gYSBwcm9taXNlXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNoaWxkQ29tcGlsZXIuY29tcGlsZSgoZXJyOiBFcnJvciwgY2hpbGRDb21waWxhdGlvbjogYW55KSA9PiB7XG4gICAgICAgIC8vIFJlc29sdmUgLyByZWplY3QgdGhlIHByb21pc2VcbiAgICAgICAgaWYgKGNoaWxkQ29tcGlsYXRpb24gJiYgY2hpbGRDb21waWxhdGlvbi5lcnJvcnMgJiYgY2hpbGRDb21waWxhdGlvbi5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3JEZXRhaWxzID0gY2hpbGRDb21waWxhdGlvbi5lcnJvcnMubWFwKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICByZXR1cm4gZXJyb3IubWVzc2FnZSArIChlcnJvci5lcnJvciA/ICc6XFxuJyArIGVycm9yLmVycm9yIDogJycpO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NoaWxkIGNvbXBpbGF0aW9uIGZhaWxlZDpcXG4nICsgZXJyb3JEZXRhaWxzKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMoY2hpbGRDb21waWxhdGlvbi5hc3NldHMpLmZvckVhY2goYXNzZXROYW1lID0+IHtcbiAgICAgICAgICAgIGlmIChhc3NldE5hbWUgIT09IGZpbGVQYXRoICYmIHRoaXMuX3BhcmVudENvbXBpbGF0aW9uLmFzc2V0c1thc3NldE5hbWVdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICB0aGlzLl9wYXJlbnRDb21waWxhdGlvbi5hc3NldHNbYXNzZXROYW1lXSA9IGNoaWxkQ29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0TmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBTYXZlIHRoZSBkZXBlbmRlbmNpZXMgZm9yIHRoaXMgcmVzb3VyY2UuXG4gICAgICAgICAgdGhpcy5fZmlsZURlcGVuZGVuY2llcy5zZXQoZmlsZVBhdGgsIGNoaWxkQ29tcGlsYXRpb24uZmlsZURlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgICBjb25zdCBjb21waWxhdGlvbkhhc2ggPSBjaGlsZENvbXBpbGF0aW9uLmZ1bGxIYXNoO1xuICAgICAgICAgIGNvbnN0IG1heWJlU291cmNlID0gdGhpcy5fY2FjaGVkU291cmNlcy5nZXQoY29tcGlsYXRpb25IYXNoKTtcbiAgICAgICAgICBpZiAobWF5YmVTb3VyY2UpIHtcbiAgICAgICAgICAgIHJlc29sdmUoeyBvdXRwdXROYW1lOiBmaWxlUGF0aCwgc291cmNlOiBtYXliZVNvdXJjZSB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gY2hpbGRDb21waWxhdGlvbi5hc3NldHNbZmlsZVBhdGhdLnNvdXJjZSgpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVkU291cmNlcy5zZXQoY29tcGlsYXRpb25IYXNoLCBzb3VyY2UpO1xuXG4gICAgICAgICAgICByZXNvbHZlKHsgb3V0cHV0TmFtZTogZmlsZVBhdGgsIHNvdXJjZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZXZhbHVhdGUoeyBvdXRwdXROYW1lLCBzb3VyY2UgfTogQ29tcGlsYXRpb25PdXRwdXQpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBFdmFsdWF0ZSBjb2RlXG4gICAgICBjb25zdCBldmFsdWF0ZWRTb3VyY2UgPSB2bS5ydW5Jbk5ld0NvbnRleHQoc291cmNlLCB1bmRlZmluZWQsIHsgZmlsZW5hbWU6IG91dHB1dE5hbWUgfSk7XG5cbiAgICAgIGlmICh0eXBlb2YgZXZhbHVhdGVkU291cmNlID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZXZhbHVhdGVkU291cmNlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdUaGUgbG9hZGVyIFwiJyArIG91dHB1dE5hbWUgKyAnXCIgZGlkblxcJ3QgcmV0dXJuIGEgc3RyaW5nLicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gIH1cblxuICBnZXQoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBpbGUoZmlsZVBhdGgpXG4gICAgICAudGhlbigocmVzdWx0OiBDb21waWxhdGlvbk91dHB1dCkgPT4gcmVzdWx0LnNvdXJjZSk7XG4gIH1cbn1cbiJdfQ==