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
// Force Webpack to throw compilation errors. Useful with karma-webpack when in single-run mode.
// Workaround for https://github.com/webpack-contrib/karma-webpack/issues/66
class KarmaWebpackFailureCb {
    constructor(callback) {
        this.callback = callback;
    }
    apply(compiler) {
        compiler.hooks.done.tap('KarmaWebpackFailureCb', (stats) => {
            if (stats.compilation.errors.length > 0) {
                this.callback();
            }
        });
    }
}
exports.KarmaWebpackFailureCb = KarmaWebpackFailureCb;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FybWEtd2VicGFjay1mYWlsdXJlLWNiLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9hbmd1bGFyLWNsaS1maWxlcy9wbHVnaW5zL2thcm1hLXdlYnBhY2stZmFpbHVyZS1jYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HO0FBQ0gsaUJBQWlCO0FBQ2pCLCtEQUErRDs7QUFFL0QsZ0dBQWdHO0FBQ2hHLDRFQUE0RTtBQUU1RTtJQUNFLFlBQW9CLFFBQW9CO1FBQXBCLGFBQVEsR0FBUixRQUFRLENBQVk7SUFBSSxDQUFDO0lBRTdDLEtBQUssQ0FBQyxRQUFhO1FBQ2pCLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEtBQVUsRUFBRSxFQUFFO1lBQzlELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbEIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBVkQsc0RBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vLyB0c2xpbnQ6ZGlzYWJsZVxuLy8gVE9ETzogY2xlYW51cCB0aGlzIGZpbGUsIGl0J3MgY29waWVkIGFzIGlzIGZyb20gQW5ndWxhciBDTEkuXG5cbi8vIEZvcmNlIFdlYnBhY2sgdG8gdGhyb3cgY29tcGlsYXRpb24gZXJyb3JzLiBVc2VmdWwgd2l0aCBrYXJtYS13ZWJwYWNrIHdoZW4gaW4gc2luZ2xlLXJ1biBtb2RlLlxuLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9rYXJtYS13ZWJwYWNrL2lzc3Vlcy82NlxuXG5leHBvcnQgY2xhc3MgS2FybWFXZWJwYWNrRmFpbHVyZUNiIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjYWxsYmFjazogKCkgPT4gdm9pZCkgeyB9XG5cbiAgYXBwbHkoY29tcGlsZXI6IGFueSk6IHZvaWQge1xuICAgIGNvbXBpbGVyLmhvb2tzLmRvbmUudGFwKCdLYXJtYVdlYnBhY2tGYWlsdXJlQ2InLCAoc3RhdHM6IGFueSkgPT4ge1xuICAgICAgaWYgKHN0YXRzLmNvbXBpbGF0aW9uLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19