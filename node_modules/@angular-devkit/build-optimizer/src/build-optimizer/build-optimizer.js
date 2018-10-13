"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const fs_1 = require("fs");
const transform_javascript_1 = require("../helpers/transform-javascript");
const class_fold_1 = require("../transforms/class-fold");
const import_tslib_1 = require("../transforms/import-tslib");
const prefix_classes_1 = require("../transforms/prefix-classes");
const prefix_functions_1 = require("../transforms/prefix-functions");
const scrub_file_1 = require("../transforms/scrub-file");
const wrap_enums_1 = require("../transforms/wrap-enums");
// Angular packages are known to have no side effects.
const whitelistedAngularModules = [
    /[\\/]node_modules[\\/]@angular[\\/]animations[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]common[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]compiler[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]core[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]forms[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]http[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]platform-browser-dynamic[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]platform-browser[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]platform-webworker-dynamic[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]platform-webworker[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]router[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]upgrade[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]material[\\/]/,
    /[\\/]node_modules[\\/]@angular[\\/]cdk[\\/]/,
];
// TODO: this code is very fragile and should be reworked.
//       See: https://github.com/angular/devkit/issues/523
const es5AngularModules = [
    // Angular 4 packaging format has .es5.js as the extension.
    /\.es5\.js$/,
    // Angular 5 has esm5 folders.
    // Angular 6 has fesm5 folders.
    /[\\/]node_modules[\\/]@angular[\\/][^\\/]+[\\/]f?esm5[\\/]/,
    // All Angular versions have UMD with es5.
    /\.umd\.js$/,
];
// Factories created by AOT are known to have no side effects and contain es5 code.
// In Angular 2/4 the file path for factories can be `.ts`, but in Angular 5 it is `.js`.
const ngFactories = [
    /\.ngfactory\.[jt]s/,
    /\.ngstyle\.[jt]s/,
];
function isKnownSideEffectFree(filePath) {
    return ngFactories.some((re) => re.test(filePath)) || (whitelistedAngularModules.some((re) => re.test(filePath))
        && es5AngularModules.some((re) => re.test(filePath)));
}
function buildOptimizer(options) {
    const { inputFilePath } = options;
    let { originalFilePath, content } = options;
    if (!originalFilePath && inputFilePath) {
        originalFilePath = inputFilePath;
    }
    if (!inputFilePath && content === undefined) {
        throw new Error('Either filePath or content must be specified in options.');
    }
    if (content === undefined) {
        content = fs_1.readFileSync(inputFilePath, 'UTF-8');
    }
    if (!content) {
        return {
            content: null,
            sourceMap: null,
            emitSkipped: true,
        };
    }
    const isWebpackBundle = content.indexOf('__webpack_require__') !== -1;
    // Determine which transforms to apply.
    const getTransforms = [];
    let typeCheck = false;
    if (options.isSideEffectFree || originalFilePath && isKnownSideEffectFree(originalFilePath)) {
        getTransforms.push(
        // getPrefixFunctionsTransformer is rather dangerous, apply only to known pure es5 modules.
        // It will mark both `require()` calls and `console.log(stuff)` as pure.
        // We only apply it to whitelisted modules, since we know they are safe.
        // getPrefixFunctionsTransformer needs to be before getFoldFileTransformer.
        prefix_functions_1.getPrefixFunctionsTransformer, scrub_file_1.getScrubFileTransformer, class_fold_1.getFoldFileTransformer);
        typeCheck = true;
    }
    else if (scrub_file_1.testScrubFile(content)) {
        // Always test as these require the type checker
        getTransforms.push(scrub_file_1.getScrubFileTransformer, class_fold_1.getFoldFileTransformer);
        typeCheck = true;
    }
    // tests are not needed for fast path
    // usage will be expanded once transformers are verified safe
    const ignoreTest = !options.emitSourceMap && !typeCheck;
    if (prefix_classes_1.testPrefixClasses(content)) {
        getTransforms.unshift(prefix_classes_1.getPrefixClassesTransformer);
    }
    // This transform introduces import/require() calls, but this won't work properly on libraries
    // built with Webpack. These libraries use __webpack_require__() calls instead, which will break
    // with a new import that wasn't part of it's original module list.
    // We ignore this transform for such libraries.
    if (!isWebpackBundle && (ignoreTest || import_tslib_1.testImportTslib(content))) {
        getTransforms.unshift(import_tslib_1.getImportTslibTransformer);
    }
    getTransforms.unshift(wrap_enums_1.getWrapEnumsTransformer);
    const transformJavascriptOpts = {
        content: content,
        inputFilePath: options.inputFilePath,
        outputFilePath: options.outputFilePath,
        emitSourceMap: options.emitSourceMap,
        strict: options.strict,
        getTransforms,
        typeCheck,
    };
    return transform_javascript_1.transformJavascript(transformJavascriptOpts);
}
exports.buildOptimizer = buildOptimizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtb3B0aW1pemVyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9vcHRpbWl6ZXIvc3JjL2J1aWxkLW9wdGltaXplci9idWlsZC1vcHRpbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwyQkFBa0M7QUFDbEMsMEVBSXlDO0FBQ3pDLHlEQUFrRTtBQUNsRSw2REFBd0Y7QUFDeEYsaUVBQThGO0FBQzlGLHFFQUErRTtBQUMvRSx5REFBa0Y7QUFDbEYseURBQW1FO0FBR25FLHNEQUFzRDtBQUN0RCxNQUFNLHlCQUF5QixHQUFHO0lBQ2hDLG9EQUFvRDtJQUNwRCxnREFBZ0Q7SUFDaEQsa0RBQWtEO0lBQ2xELDhDQUE4QztJQUM5QywrQ0FBK0M7SUFDL0MsOENBQThDO0lBQzlDLGtFQUFrRTtJQUNsRSwwREFBMEQ7SUFDMUQsb0VBQW9FO0lBQ3BFLDREQUE0RDtJQUM1RCxnREFBZ0Q7SUFDaEQsaURBQWlEO0lBQ2pELGtEQUFrRDtJQUNsRCw2Q0FBNkM7Q0FDOUMsQ0FBQztBQUVGLDBEQUEwRDtBQUMxRCwwREFBMEQ7QUFDMUQsTUFBTSxpQkFBaUIsR0FBRztJQUN4QiwyREFBMkQ7SUFDM0QsWUFBWTtJQUNaLDhCQUE4QjtJQUM5QiwrQkFBK0I7SUFDL0IsNERBQTREO0lBQzVELDBDQUEwQztJQUMxQyxZQUFZO0NBQ2IsQ0FBQztBQUVGLG1GQUFtRjtBQUNuRix5RkFBeUY7QUFDekYsTUFBTSxXQUFXLEdBQUc7SUFDbEIsb0JBQW9CO0lBQ3BCLGtCQUFrQjtDQUNuQixDQUFDO0FBRUYsK0JBQStCLFFBQWdCO0lBQzdDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FDcEQseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1dBQ3RELGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUNyRCxDQUFDO0FBQ0osQ0FBQztBQVlELHdCQUErQixPQUE4QjtJQUUzRCxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBQ2xDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFNUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUNuQyxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDNUMsTUFBTSxJQUFJLEtBQUssQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUMxQixPQUFPLEdBQUcsaUJBQVksQ0FBQyxhQUF1QixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDYixNQUFNLENBQUM7WUFDTCxPQUFPLEVBQUUsSUFBSTtZQUNiLFNBQVMsRUFBRSxJQUFJO1lBQ2YsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFdEUsdUNBQXVDO0lBQ3ZDLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUV6QixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDdEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLGdCQUFnQixJQUFJLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVGLGFBQWEsQ0FBQyxJQUFJO1FBQ2hCLDJGQUEyRjtRQUMzRix3RUFBd0U7UUFDeEUsd0VBQXdFO1FBQ3hFLDJFQUEyRTtRQUMzRSxnREFBNkIsRUFDN0Isb0NBQXVCLEVBQ3ZCLG1DQUFzQixDQUN2QixDQUFDO1FBQ0YsU0FBUyxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLDBCQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLGdEQUFnRDtRQUNoRCxhQUFhLENBQUMsSUFBSSxDQUNoQixvQ0FBdUIsRUFDdkIsbUNBQXNCLENBQ3ZCLENBQUM7UUFDRixTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsNkRBQTZEO0lBQzdELE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUV4RCxFQUFFLENBQUMsQ0FBQyxrQ0FBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsYUFBYSxDQUFDLE9BQU8sQ0FBQyw0Q0FBMkIsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCw4RkFBOEY7SUFDOUYsZ0dBQWdHO0lBQ2hHLG1FQUFtRTtJQUNuRSwrQ0FBK0M7SUFDL0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLElBQUksQ0FBQyxVQUFVLElBQUksOEJBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRSxhQUFhLENBQUMsT0FBTyxDQUFDLHdDQUF5QixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELGFBQWEsQ0FBQyxPQUFPLENBQUMsb0NBQXVCLENBQUMsQ0FBQztJQUUvQyxNQUFNLHVCQUF1QixHQUErQjtRQUMxRCxPQUFPLEVBQUUsT0FBTztRQUNoQixhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWE7UUFDcEMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxjQUFjO1FBQ3RDLGFBQWEsRUFBRSxPQUFPLENBQUMsYUFBYTtRQUNwQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07UUFDdEIsYUFBYTtRQUNiLFNBQVM7S0FDVixDQUFDO0lBRUYsTUFBTSxDQUFDLDBDQUFtQixDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDdEQsQ0FBQztBQWhGRCx3Q0FnRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQge1xuICBUcmFuc2Zvcm1KYXZhc2NyaXB0T3B0aW9ucyxcbiAgVHJhbnNmb3JtSmF2YXNjcmlwdE91dHB1dCxcbiAgdHJhbnNmb3JtSmF2YXNjcmlwdCxcbn0gZnJvbSAnLi4vaGVscGVycy90cmFuc2Zvcm0tamF2YXNjcmlwdCc7XG5pbXBvcnQgeyBnZXRGb2xkRmlsZVRyYW5zZm9ybWVyIH0gZnJvbSAnLi4vdHJhbnNmb3Jtcy9jbGFzcy1mb2xkJztcbmltcG9ydCB7IGdldEltcG9ydFRzbGliVHJhbnNmb3JtZXIsIHRlc3RJbXBvcnRUc2xpYiB9IGZyb20gJy4uL3RyYW5zZm9ybXMvaW1wb3J0LXRzbGliJztcbmltcG9ydCB7IGdldFByZWZpeENsYXNzZXNUcmFuc2Zvcm1lciwgdGVzdFByZWZpeENsYXNzZXMgfSBmcm9tICcuLi90cmFuc2Zvcm1zL3ByZWZpeC1jbGFzc2VzJztcbmltcG9ydCB7IGdldFByZWZpeEZ1bmN0aW9uc1RyYW5zZm9ybWVyIH0gZnJvbSAnLi4vdHJhbnNmb3Jtcy9wcmVmaXgtZnVuY3Rpb25zJztcbmltcG9ydCB7IGdldFNjcnViRmlsZVRyYW5zZm9ybWVyLCB0ZXN0U2NydWJGaWxlIH0gZnJvbSAnLi4vdHJhbnNmb3Jtcy9zY3J1Yi1maWxlJztcbmltcG9ydCB7IGdldFdyYXBFbnVtc1RyYW5zZm9ybWVyIH0gZnJvbSAnLi4vdHJhbnNmb3Jtcy93cmFwLWVudW1zJztcblxuXG4vLyBBbmd1bGFyIHBhY2thZ2VzIGFyZSBrbm93biB0byBoYXZlIG5vIHNpZGUgZWZmZWN0cy5cbmNvbnN0IHdoaXRlbGlzdGVkQW5ndWxhck1vZHVsZXMgPSBbXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXWFuaW1hdGlvbnNbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dY29tbW9uW1xcXFwvXS8sXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXWNvbXBpbGVyW1xcXFwvXS8sXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXWNvcmVbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dZm9ybXNbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9daHR0cFtcXFxcL10vLFxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWNbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dcGxhdGZvcm0tYnJvd3NlcltcXFxcL10vLFxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11wbGF0Zm9ybS13ZWJ3b3JrZXItZHluYW1pY1tcXFxcL10vLFxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11wbGF0Zm9ybS13ZWJ3b3JrZXJbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dcm91dGVyW1xcXFwvXS8sXG4gIC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXUBhbmd1bGFyW1xcXFwvXXVwZ3JhZGVbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dbWF0ZXJpYWxbXFxcXC9dLyxcbiAgL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dY2RrW1xcXFwvXS8sXG5dO1xuXG4vLyBUT0RPOiB0aGlzIGNvZGUgaXMgdmVyeSBmcmFnaWxlIGFuZCBzaG91bGQgYmUgcmV3b3JrZWQuXG4vLyAgICAgICBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2RldmtpdC9pc3N1ZXMvNTIzXG5jb25zdCBlczVBbmd1bGFyTW9kdWxlcyA9IFtcbiAgLy8gQW5ndWxhciA0IHBhY2thZ2luZyBmb3JtYXQgaGFzIC5lczUuanMgYXMgdGhlIGV4dGVuc2lvbi5cbiAgL1xcLmVzNVxcLmpzJC8sIC8vIEFuZ3VsYXIgNFxuICAvLyBBbmd1bGFyIDUgaGFzIGVzbTUgZm9sZGVycy5cbiAgLy8gQW5ndWxhciA2IGhhcyBmZXNtNSBmb2xkZXJzLlxuICAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL11AYW5ndWxhcltcXFxcL11bXlxcXFwvXStbXFxcXC9dZj9lc201W1xcXFwvXS8sXG4gIC8vIEFsbCBBbmd1bGFyIHZlcnNpb25zIGhhdmUgVU1EIHdpdGggZXM1LlxuICAvXFwudW1kXFwuanMkLyxcbl07XG5cbi8vIEZhY3RvcmllcyBjcmVhdGVkIGJ5IEFPVCBhcmUga25vd24gdG8gaGF2ZSBubyBzaWRlIGVmZmVjdHMgYW5kIGNvbnRhaW4gZXM1IGNvZGUuXG4vLyBJbiBBbmd1bGFyIDIvNCB0aGUgZmlsZSBwYXRoIGZvciBmYWN0b3JpZXMgY2FuIGJlIGAudHNgLCBidXQgaW4gQW5ndWxhciA1IGl0IGlzIGAuanNgLlxuY29uc3QgbmdGYWN0b3JpZXMgPSBbXG4gIC9cXC5uZ2ZhY3RvcnlcXC5banRdcy8sXG4gIC9cXC5uZ3N0eWxlXFwuW2p0XXMvLFxuXTtcblxuZnVuY3Rpb24gaXNLbm93blNpZGVFZmZlY3RGcmVlKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5nRmFjdG9yaWVzLnNvbWUoKHJlKSA9PiByZS50ZXN0KGZpbGVQYXRoKSkgfHwgKFxuICAgIHdoaXRlbGlzdGVkQW5ndWxhck1vZHVsZXMuc29tZSgocmUpID0+IHJlLnRlc3QoZmlsZVBhdGgpKVxuICAgICYmIGVzNUFuZ3VsYXJNb2R1bGVzLnNvbWUoKHJlKSA9PiByZS50ZXN0KGZpbGVQYXRoKSlcbiAgKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWlsZE9wdGltaXplck9wdGlvbnMge1xuICBjb250ZW50Pzogc3RyaW5nO1xuICBvcmlnaW5hbEZpbGVQYXRoPzogc3RyaW5nO1xuICBpbnB1dEZpbGVQYXRoPzogc3RyaW5nO1xuICBvdXRwdXRGaWxlUGF0aD86IHN0cmluZztcbiAgZW1pdFNvdXJjZU1hcD86IGJvb2xlYW47XG4gIHN0cmljdD86IGJvb2xlYW47XG4gIGlzU2lkZUVmZmVjdEZyZWU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRPcHRpbWl6ZXIob3B0aW9uczogQnVpbGRPcHRpbWl6ZXJPcHRpb25zKTogVHJhbnNmb3JtSmF2YXNjcmlwdE91dHB1dCB7XG5cbiAgY29uc3QgeyBpbnB1dEZpbGVQYXRoIH0gPSBvcHRpb25zO1xuICBsZXQgeyBvcmlnaW5hbEZpbGVQYXRoLCBjb250ZW50IH0gPSBvcHRpb25zO1xuXG4gIGlmICghb3JpZ2luYWxGaWxlUGF0aCAmJiBpbnB1dEZpbGVQYXRoKSB7XG4gICAgb3JpZ2luYWxGaWxlUGF0aCA9IGlucHV0RmlsZVBhdGg7XG4gIH1cblxuICBpZiAoIWlucHV0RmlsZVBhdGggJiYgY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFaXRoZXIgZmlsZVBhdGggb3IgY29udGVudCBtdXN0IGJlIHNwZWNpZmllZCBpbiBvcHRpb25zLicpO1xuICB9XG5cbiAgaWYgKGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoaW5wdXRGaWxlUGF0aCBhcyBzdHJpbmcsICdVVEYtOCcpO1xuICB9XG5cbiAgaWYgKCFjb250ZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnQ6IG51bGwsXG4gICAgICBzb3VyY2VNYXA6IG51bGwsXG4gICAgICBlbWl0U2tpcHBlZDogdHJ1ZSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgaXNXZWJwYWNrQnVuZGxlID0gY29udGVudC5pbmRleE9mKCdfX3dlYnBhY2tfcmVxdWlyZV9fJykgIT09IC0xO1xuXG4gIC8vIERldGVybWluZSB3aGljaCB0cmFuc2Zvcm1zIHRvIGFwcGx5LlxuICBjb25zdCBnZXRUcmFuc2Zvcm1zID0gW107XG5cbiAgbGV0IHR5cGVDaGVjayA9IGZhbHNlO1xuICBpZiAob3B0aW9ucy5pc1NpZGVFZmZlY3RGcmVlIHx8IG9yaWdpbmFsRmlsZVBhdGggJiYgaXNLbm93blNpZGVFZmZlY3RGcmVlKG9yaWdpbmFsRmlsZVBhdGgpKSB7XG4gICAgZ2V0VHJhbnNmb3Jtcy5wdXNoKFxuICAgICAgLy8gZ2V0UHJlZml4RnVuY3Rpb25zVHJhbnNmb3JtZXIgaXMgcmF0aGVyIGRhbmdlcm91cywgYXBwbHkgb25seSB0byBrbm93biBwdXJlIGVzNSBtb2R1bGVzLlxuICAgICAgLy8gSXQgd2lsbCBtYXJrIGJvdGggYHJlcXVpcmUoKWAgY2FsbHMgYW5kIGBjb25zb2xlLmxvZyhzdHVmZilgIGFzIHB1cmUuXG4gICAgICAvLyBXZSBvbmx5IGFwcGx5IGl0IHRvIHdoaXRlbGlzdGVkIG1vZHVsZXMsIHNpbmNlIHdlIGtub3cgdGhleSBhcmUgc2FmZS5cbiAgICAgIC8vIGdldFByZWZpeEZ1bmN0aW9uc1RyYW5zZm9ybWVyIG5lZWRzIHRvIGJlIGJlZm9yZSBnZXRGb2xkRmlsZVRyYW5zZm9ybWVyLlxuICAgICAgZ2V0UHJlZml4RnVuY3Rpb25zVHJhbnNmb3JtZXIsXG4gICAgICBnZXRTY3J1YkZpbGVUcmFuc2Zvcm1lcixcbiAgICAgIGdldEZvbGRGaWxlVHJhbnNmb3JtZXIsXG4gICAgKTtcbiAgICB0eXBlQ2hlY2sgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHRlc3RTY3J1YkZpbGUoY29udGVudCkpIHtcbiAgICAvLyBBbHdheXMgdGVzdCBhcyB0aGVzZSByZXF1aXJlIHRoZSB0eXBlIGNoZWNrZXJcbiAgICBnZXRUcmFuc2Zvcm1zLnB1c2goXG4gICAgICBnZXRTY3J1YkZpbGVUcmFuc2Zvcm1lcixcbiAgICAgIGdldEZvbGRGaWxlVHJhbnNmb3JtZXIsXG4gICAgKTtcbiAgICB0eXBlQ2hlY2sgPSB0cnVlO1xuICB9XG5cbiAgLy8gdGVzdHMgYXJlIG5vdCBuZWVkZWQgZm9yIGZhc3QgcGF0aFxuICAvLyB1c2FnZSB3aWxsIGJlIGV4cGFuZGVkIG9uY2UgdHJhbnNmb3JtZXJzIGFyZSB2ZXJpZmllZCBzYWZlXG4gIGNvbnN0IGlnbm9yZVRlc3QgPSAhb3B0aW9ucy5lbWl0U291cmNlTWFwICYmICF0eXBlQ2hlY2s7XG5cbiAgaWYgKHRlc3RQcmVmaXhDbGFzc2VzKGNvbnRlbnQpKSB7XG4gICAgZ2V0VHJhbnNmb3Jtcy51bnNoaWZ0KGdldFByZWZpeENsYXNzZXNUcmFuc2Zvcm1lcik7XG4gIH1cblxuICAvLyBUaGlzIHRyYW5zZm9ybSBpbnRyb2R1Y2VzIGltcG9ydC9yZXF1aXJlKCkgY2FsbHMsIGJ1dCB0aGlzIHdvbid0IHdvcmsgcHJvcGVybHkgb24gbGlicmFyaWVzXG4gIC8vIGJ1aWx0IHdpdGggV2VicGFjay4gVGhlc2UgbGlicmFyaWVzIHVzZSBfX3dlYnBhY2tfcmVxdWlyZV9fKCkgY2FsbHMgaW5zdGVhZCwgd2hpY2ggd2lsbCBicmVha1xuICAvLyB3aXRoIGEgbmV3IGltcG9ydCB0aGF0IHdhc24ndCBwYXJ0IG9mIGl0J3Mgb3JpZ2luYWwgbW9kdWxlIGxpc3QuXG4gIC8vIFdlIGlnbm9yZSB0aGlzIHRyYW5zZm9ybSBmb3Igc3VjaCBsaWJyYXJpZXMuXG4gIGlmICghaXNXZWJwYWNrQnVuZGxlICYmIChpZ25vcmVUZXN0IHx8IHRlc3RJbXBvcnRUc2xpYihjb250ZW50KSkpIHtcbiAgICBnZXRUcmFuc2Zvcm1zLnVuc2hpZnQoZ2V0SW1wb3J0VHNsaWJUcmFuc2Zvcm1lcik7XG4gIH1cblxuICBnZXRUcmFuc2Zvcm1zLnVuc2hpZnQoZ2V0V3JhcEVudW1zVHJhbnNmb3JtZXIpO1xuXG4gIGNvbnN0IHRyYW5zZm9ybUphdmFzY3JpcHRPcHRzOiBUcmFuc2Zvcm1KYXZhc2NyaXB0T3B0aW9ucyA9IHtcbiAgICBjb250ZW50OiBjb250ZW50LFxuICAgIGlucHV0RmlsZVBhdGg6IG9wdGlvbnMuaW5wdXRGaWxlUGF0aCxcbiAgICBvdXRwdXRGaWxlUGF0aDogb3B0aW9ucy5vdXRwdXRGaWxlUGF0aCxcbiAgICBlbWl0U291cmNlTWFwOiBvcHRpb25zLmVtaXRTb3VyY2VNYXAsXG4gICAgc3RyaWN0OiBvcHRpb25zLnN0cmljdCxcbiAgICBnZXRUcmFuc2Zvcm1zLFxuICAgIHR5cGVDaGVjayxcbiAgfTtcblxuICByZXR1cm4gdHJhbnNmb3JtSmF2YXNjcmlwdCh0cmFuc2Zvcm1KYXZhc2NyaXB0T3B0cyk7XG59XG4iXX0=