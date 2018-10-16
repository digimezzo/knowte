/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define("@angular/cdk/coercion",["exports"],n):n((e.ng=e.ng||{},e.ng.cdk=e.ng.cdk||{},e.ng.cdk.coercion={}))}(this,function(e){"use strict";function n(e){return null!=e&&""+e!="false"}function r(e,n){return void 0===n&&(n=0),o(e)?Number(e):n}function o(e){return!isNaN(parseFloat(e))&&!isNaN(Number(e))}function t(e){return Array.isArray(e)?e:[e]}function c(e){return null==e?"":"string"==typeof e?e:e+"px"}e.coerceBooleanProperty=n,e.coerceNumberProperty=r,e._isNumberValue=o,e.coerceArray=t,e.coerceCssPixelValue=c,Object.defineProperty(e,"__esModule",{value:!0})});
//# sourceMappingURL=cdk-coercion.umd.min.js.map
