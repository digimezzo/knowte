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
const core_1 = require("@angular-devkit/core");
exports.ngAppResolve = (resolvePath) => {
    return path.resolve(process.cwd(), resolvePath);
};
const webpackOutputOptions = {
    colors: true,
    hash: true,
    timings: true,
    chunks: true,
    chunkModules: false,
    children: false,
    modules: false,
    reasons: false,
    warnings: true,
    errors: true,
    assets: true,
    version: false,
    errorDetails: false,
    moduleTrace: false,
};
const verboseWebpackOutputOptions = {
    children: true,
    assets: true,
    version: true,
    reasons: true,
    chunkModules: false,
    errorDetails: true,
    moduleTrace: true,
};
function getWebpackStatsConfig(verbose = false) {
    return verbose
        ? Object.assign(webpackOutputOptions, verboseWebpackOutputOptions)
        : webpackOutputOptions;
}
exports.getWebpackStatsConfig = getWebpackStatsConfig;
function getOutputHashFormat(option, length = 20) {
    /* tslint:disable:max-line-length */
    const hashFormats = {
        none: { chunk: '', extract: '', file: '', script: '' },
        media: { chunk: '', extract: '', file: `.[hash:${length}]`, script: '' },
        bundles: { chunk: `.[chunkhash:${length}]`, extract: `.[contenthash:${length}]`, file: '', script: `.[hash:${length}]` },
        all: { chunk: `.[chunkhash:${length}]`, extract: `.[contenthash:${length}]`, file: `.[hash:${length}]`, script: `.[hash:${length}]` },
    };
    /* tslint:enable:max-line-length */
    return hashFormats[option] || hashFormats['none'];
}
exports.getOutputHashFormat = getOutputHashFormat;
function normalizeExtraEntryPoints(extraEntryPoints, defaultBundleName) {
    return extraEntryPoints.map(entry => {
        let normalizedEntry;
        if (typeof entry === 'string') {
            normalizedEntry = { input: entry, lazy: false, bundleName: defaultBundleName };
        }
        else {
            let bundleName;
            if (entry.bundleName) {
                bundleName = entry.bundleName;
            }
            else if (entry.lazy) {
                // Lazy entry points use the file name as bundle name.
                bundleName = core_1.basename(core_1.normalize(entry.input.replace(/\.(js|css|scss|sass|less|styl)$/i, '')));
            }
            else {
                bundleName = defaultBundleName;
            }
            normalizedEntry = Object.assign({}, entry, { bundleName });
        }
        return normalizedEntry;
    });
}
exports.normalizeExtraEntryPoints = normalizeExtraEntryPoints;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2FuZ3VsYXItY2xpLWZpbGVzL21vZGVscy93ZWJwYWNrLWNvbmZpZ3MvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILGlCQUFpQjtBQUNqQiwrREFBK0Q7O0FBRS9ELDZCQUE2QjtBQUM3QiwrQ0FBMkQ7QUFHOUMsUUFBQSxZQUFZLEdBQUcsQ0FBQyxXQUFtQixFQUFVLEVBQUU7SUFDMUQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ2xELENBQUMsQ0FBQztBQUVGLE1BQU0sb0JBQW9CLEdBQUc7SUFDM0IsTUFBTSxFQUFFLElBQUk7SUFDWixJQUFJLEVBQUUsSUFBSTtJQUNWLE9BQU8sRUFBRSxJQUFJO0lBQ2IsTUFBTSxFQUFFLElBQUk7SUFDWixZQUFZLEVBQUUsS0FBSztJQUNuQixRQUFRLEVBQUUsS0FBSztJQUNmLE9BQU8sRUFBRSxLQUFLO0lBQ2QsT0FBTyxFQUFFLEtBQUs7SUFDZCxRQUFRLEVBQUUsSUFBSTtJQUNkLE1BQU0sRUFBRSxJQUFJO0lBQ1osTUFBTSxFQUFFLElBQUk7SUFDWixPQUFPLEVBQUUsS0FBSztJQUNkLFlBQVksRUFBRSxLQUFLO0lBQ25CLFdBQVcsRUFBRSxLQUFLO0NBQ25CLENBQUM7QUFFRixNQUFNLDJCQUEyQixHQUFHO0lBQ2xDLFFBQVEsRUFBRSxJQUFJO0lBQ2QsTUFBTSxFQUFFLElBQUk7SUFDWixPQUFPLEVBQUUsSUFBSTtJQUNiLE9BQU8sRUFBRSxJQUFJO0lBQ2IsWUFBWSxFQUFFLEtBQUs7SUFDbkIsWUFBWSxFQUFFLElBQUk7SUFDbEIsV0FBVyxFQUFFLElBQUk7Q0FDbEIsQ0FBQztBQUVGLCtCQUFzQyxPQUFPLEdBQUcsS0FBSztJQUNuRCxNQUFNLENBQUMsT0FBTztRQUNaLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFLDJCQUEyQixDQUFDO1FBQ2xFLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztBQUMzQixDQUFDO0FBSkQsc0RBSUM7QUFTRCw2QkFBb0MsTUFBYyxFQUFFLE1BQU0sR0FBRyxFQUFFO0lBQzdELG9DQUFvQztJQUNwQyxNQUFNLFdBQVcsR0FBcUM7UUFDcEQsSUFBSSxFQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBd0IsT0FBTyxFQUFFLEVBQUUsRUFBMEIsSUFBSSxFQUFFLEVBQUUsRUFBbUIsTUFBTSxFQUFFLEVBQUUsRUFBRTtRQUN4SCxLQUFLLEVBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUF3QixPQUFPLEVBQUUsRUFBRSxFQUEwQixJQUFJLEVBQUUsVUFBVSxNQUFNLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFHO1FBQ3pILE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxlQUFlLE1BQU0sR0FBRyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsTUFBTSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBbUIsTUFBTSxFQUFFLFVBQVUsTUFBTSxHQUFHLEVBQUc7UUFDMUksR0FBRyxFQUFNLEVBQUUsS0FBSyxFQUFFLGVBQWUsTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixNQUFNLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxNQUFNLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBVSxNQUFNLEdBQUcsRUFBRztLQUMzSSxDQUFDO0lBQ0YsbUNBQW1DO0lBQ25DLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFWRCxrREFVQztBQUlELG1DQUNFLGdCQUFtQyxFQUNuQyxpQkFBeUI7SUFFekIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNsQyxJQUFJLGVBQWUsQ0FBQztRQUVwQixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzlCLGVBQWUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQztRQUNqRixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLFVBQVUsQ0FBQztZQUVmLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUNoQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixzREFBc0Q7Z0JBQ3RELFVBQVUsR0FBRyxlQUFRLENBQ25CLGdCQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FDdkUsQ0FBQztZQUNKLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixVQUFVLEdBQUcsaUJBQWlCLENBQUM7WUFDakMsQ0FBQztZQUVELGVBQWUscUJBQU8sS0FBSyxJQUFFLFVBQVUsR0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQTVCRCw4REE0QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vLyB0c2xpbnQ6ZGlzYWJsZVxuLy8gVE9ETzogY2xlYW51cCB0aGlzIGZpbGUsIGl0J3MgY29waWVkIGFzIGlzIGZyb20gQW5ndWxhciBDTEkuXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBiYXNlbmFtZSwgbm9ybWFsaXplIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgRXh0cmFFbnRyeVBvaW50LCBFeHRyYUVudHJ5UG9pbnRPYmplY3QgfSBmcm9tICcuLi8uLi8uLi9icm93c2VyL3NjaGVtYSc7XG5cbmV4cG9ydCBjb25zdCBuZ0FwcFJlc29sdmUgPSAocmVzb2x2ZVBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgcmVzb2x2ZVBhdGgpO1xufTtcblxuY29uc3Qgd2VicGFja091dHB1dE9wdGlvbnMgPSB7XG4gIGNvbG9yczogdHJ1ZSxcbiAgaGFzaDogdHJ1ZSwgLy8gcmVxdWlyZWQgYnkgY3VzdG9tIHN0YXQgb3V0cHV0XG4gIHRpbWluZ3M6IHRydWUsIC8vIHJlcXVpcmVkIGJ5IGN1c3RvbSBzdGF0IG91dHB1dFxuICBjaHVua3M6IHRydWUsIC8vIHJlcXVpcmVkIGJ5IGN1c3RvbSBzdGF0IG91dHB1dFxuICBjaHVua01vZHVsZXM6IGZhbHNlLFxuICBjaGlsZHJlbjogZmFsc2UsIC8vIGxpc3RpbmcgYWxsIGNoaWxkcmVuIGlzIHZlcnkgbm9pc3kgaW4gQU9UIGFuZCBoaWRlcyB3YXJuaW5ncy9lcnJvcnNcbiAgbW9kdWxlczogZmFsc2UsXG4gIHJlYXNvbnM6IGZhbHNlLFxuICB3YXJuaW5nczogdHJ1ZSxcbiAgZXJyb3JzOiB0cnVlLFxuICBhc3NldHM6IHRydWUsIC8vIHJlcXVpcmVkIGJ5IGN1c3RvbSBzdGF0IG91dHB1dFxuICB2ZXJzaW9uOiBmYWxzZSxcbiAgZXJyb3JEZXRhaWxzOiBmYWxzZSxcbiAgbW9kdWxlVHJhY2U6IGZhbHNlLFxufTtcblxuY29uc3QgdmVyYm9zZVdlYnBhY2tPdXRwdXRPcHRpb25zID0ge1xuICBjaGlsZHJlbjogdHJ1ZSxcbiAgYXNzZXRzOiB0cnVlLFxuICB2ZXJzaW9uOiB0cnVlLFxuICByZWFzb25zOiB0cnVlLFxuICBjaHVua01vZHVsZXM6IGZhbHNlLCAvLyBUT0RPOiBzZXQgdG8gdHJ1ZSB3aGVuIGNvbnNvbGUgdG8gZmlsZSBvdXRwdXQgaXMgZml4ZWRcbiAgZXJyb3JEZXRhaWxzOiB0cnVlLFxuICBtb2R1bGVUcmFjZTogdHJ1ZSxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRXZWJwYWNrU3RhdHNDb25maWcodmVyYm9zZSA9IGZhbHNlKSB7XG4gIHJldHVybiB2ZXJib3NlXG4gICAgPyBPYmplY3QuYXNzaWduKHdlYnBhY2tPdXRwdXRPcHRpb25zLCB2ZXJib3NlV2VicGFja091dHB1dE9wdGlvbnMpXG4gICAgOiB3ZWJwYWNrT3V0cHV0T3B0aW9ucztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIYXNoRm9ybWF0IHtcbiAgY2h1bms6IHN0cmluZztcbiAgZXh0cmFjdDogc3RyaW5nO1xuICBmaWxlOiBzdHJpbmc7XG4gIHNjcmlwdDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3V0cHV0SGFzaEZvcm1hdChvcHRpb246IHN0cmluZywgbGVuZ3RoID0gMjApOiBIYXNoRm9ybWF0IHtcbiAgLyogdHNsaW50OmRpc2FibGU6bWF4LWxpbmUtbGVuZ3RoICovXG4gIGNvbnN0IGhhc2hGb3JtYXRzOiB7IFtvcHRpb246IHN0cmluZ106IEhhc2hGb3JtYXQgfSA9IHtcbiAgICBub25lOiAgICB7IGNodW5rOiAnJywgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3Q6ICcnLCAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiAnJyAgICAgICAgICAgICAgICAgLCBzY3JpcHQ6ICcnIH0sXG4gICAgbWVkaWE6ICAgeyBjaHVuazogJycsICAgICAgICAgICAgICAgICAgICAgICBleHRyYWN0OiAnJywgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogYC5baGFzaDoke2xlbmd0aH1dYCwgc2NyaXB0OiAnJyAgfSxcbiAgICBidW5kbGVzOiB7IGNodW5rOiBgLltjaHVua2hhc2g6JHtsZW5ndGh9XWAsIGV4dHJhY3Q6IGAuW2NvbnRlbnRoYXNoOiR7bGVuZ3RofV1gLCBmaWxlOiAnJyAgICAgICAgICAgICAgICAgLCBzY3JpcHQ6IGAuW2hhc2g6JHtsZW5ndGh9XWAgIH0sXG4gICAgYWxsOiAgICAgeyBjaHVuazogYC5bY2h1bmtoYXNoOiR7bGVuZ3RofV1gLCBleHRyYWN0OiBgLltjb250ZW50aGFzaDoke2xlbmd0aH1dYCwgZmlsZTogYC5baGFzaDoke2xlbmd0aH1dYCwgc2NyaXB0OiBgLltoYXNoOiR7bGVuZ3RofV1gICB9LFxuICB9O1xuICAvKiB0c2xpbnQ6ZW5hYmxlOm1heC1saW5lLWxlbmd0aCAqL1xuICByZXR1cm4gaGFzaEZvcm1hdHNbb3B0aW9uXSB8fCBoYXNoRm9ybWF0c1snbm9uZSddO1xufVxuXG5leHBvcnQgdHlwZSBOb3JtYWxpemVkRW50cnlQb2ludCA9IEV4dHJhRW50cnlQb2ludE9iamVjdCAmIHsgYnVuZGxlTmFtZTogc3RyaW5nIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVFeHRyYUVudHJ5UG9pbnRzKFxuICBleHRyYUVudHJ5UG9pbnRzOiBFeHRyYUVudHJ5UG9pbnRbXSxcbiAgZGVmYXVsdEJ1bmRsZU5hbWU6IHN0cmluZ1xuKTogTm9ybWFsaXplZEVudHJ5UG9pbnRbXSB7XG4gIHJldHVybiBleHRyYUVudHJ5UG9pbnRzLm1hcChlbnRyeSA9PiB7XG4gICAgbGV0IG5vcm1hbGl6ZWRFbnRyeTtcblxuICAgIGlmICh0eXBlb2YgZW50cnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBub3JtYWxpemVkRW50cnkgPSB7IGlucHV0OiBlbnRyeSwgbGF6eTogZmFsc2UsIGJ1bmRsZU5hbWU6IGRlZmF1bHRCdW5kbGVOYW1lIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBidW5kbGVOYW1lO1xuXG4gICAgICBpZiAoZW50cnkuYnVuZGxlTmFtZSkge1xuICAgICAgICBidW5kbGVOYW1lID0gZW50cnkuYnVuZGxlTmFtZTtcbiAgICAgIH0gZWxzZSBpZiAoZW50cnkubGF6eSkge1xuICAgICAgICAvLyBMYXp5IGVudHJ5IHBvaW50cyB1c2UgdGhlIGZpbGUgbmFtZSBhcyBidW5kbGUgbmFtZS5cbiAgICAgICAgYnVuZGxlTmFtZSA9IGJhc2VuYW1lKFxuICAgICAgICAgIG5vcm1hbGl6ZShlbnRyeS5pbnB1dC5yZXBsYWNlKC9cXC4oanN8Y3NzfHNjc3N8c2Fzc3xsZXNzfHN0eWwpJC9pLCAnJykpLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVuZGxlTmFtZSA9IGRlZmF1bHRCdW5kbGVOYW1lO1xuICAgICAgfVxuXG4gICAgICBub3JtYWxpemVkRW50cnkgPSB7Li4uZW50cnksIGJ1bmRsZU5hbWV9O1xuICAgIH1cblxuICAgIHJldHVybiBub3JtYWxpemVkRW50cnk7XG4gIH0pXG59XG4iXX0=