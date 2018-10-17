/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { BEFORE_APP_SERIALIZED } from '@angular/platform-server';
import { BREAKPOINTS, CLASS_NAME, SERVER_TOKEN, MatchMedia, StylesheetMap, ServerMatchMedia } from '@angular/flex-layout/core';
import { NgModule } from '@angular/core';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Activate all of the registered breakpoints in sequence, and then
 * retrieve the associated stylings from the virtual stylesheet
 * @param {?} serverSheet the virtual stylesheet that stores styles for each
 *        element
 * @param {?} matchMedia the service to activate/deactive breakpoints
 * @param {?} breakpoints the registered breakpoints to activate/deactivate
 * @return {?}
 */
function generateStaticFlexLayoutStyles(serverSheet, matchMedia, breakpoints) {
    /** @type {?} */
    var classMap = new Map();
    /** @type {?} */
    var defaultStyles = new Map(serverSheet.stylesheet);
    /** @type {?} */
    var styleText = generateCss(defaultStyles, 'all', classMap);
    breakpoints.reverse();
    breakpoints.forEach(function (bp, i) {
        serverSheet.clearStyles();
        (/** @type {?} */ (matchMedia)).activateBreakpoint(bp);
        /** @type {?} */
        var stylesheet = new Map(serverSheet.stylesheet);
        if (stylesheet.size > 0) {
            styleText += generateCss(stylesheet, bp.mediaQuery, classMap);
        }
        (/** @type {?} */ (matchMedia)).deactivateBreakpoint(breakpoints[i]);
    });
    return styleText;
}
/**
 * Create a style tag populated with the dynamic stylings from Flex
 * components and attach it to the head of the DOM
 * @param {?} serverSheet
 * @param {?} matchMedia
 * @param {?} _document
 * @param {?} breakpoints
 * @return {?}
 */
function FLEX_SSR_SERIALIZER_FACTORY(serverSheet, matchMedia, _document, breakpoints) {
    return function () {
        /** @type {?} */
        var styleTag = _document.createElement('style');
        /** @type {?} */
        var styleText = generateStaticFlexLayoutStyles(serverSheet, matchMedia, breakpoints);
        styleTag.classList.add(CLASS_NAME + "ssr");
        styleTag.textContent = styleText;
        _document.head.appendChild(styleTag);
    };
}
/** *
 *  Provider to set static styles on the server
  @type {?} */
var SERVER_PROVIDERS = [
    {
        provide: /** @type {?} */ (BEFORE_APP_SERIALIZED),
        useFactory: FLEX_SSR_SERIALIZER_FACTORY,
        deps: [
            StylesheetMap,
            MatchMedia,
            DOCUMENT,
            BREAKPOINTS,
        ],
        multi: true
    },
    {
        provide: SERVER_TOKEN,
        useValue: true
    },
    {
        provide: MatchMedia,
        useClass: ServerMatchMedia
    }
];
/** @type {?} */
var nextId = 0;
/** @type {?} */
var IS_DEBUG_MODE = false;
/**
 * create \@media queries based on a virtual stylesheet
 * * Adds a unique class to each element and stores it
 *   in a shared classMap for later reuse
 * @param {?} stylesheet the virtual stylesheet that stores styles for each
 *        element
 * @param {?} mediaQuery the given \@media CSS selector for the current breakpoint
 * @param {?} classMap the map of HTML elements to class names to avoid duplications
 * @return {?}
 */
function generateCss(stylesheet, mediaQuery, classMap) {
    /** @type {?} */
    var css = '';
    stylesheet.forEach(function (styles, el) {
        /** @type {?} */
        var keyVals = '';
        /** @type {?} */
        var className = getClassName(el, classMap);
        styles.forEach(function (v, k) {
            keyVals += v ? format(k + ":" + v + ";") : '';
        });
        // Build list of CSS styles; each with a className
        css += format("." + className + " {", keyVals, '}');
    });
    // Group 1 or more styles (each with className) in a specific mediaQuery
    return format("@media " + mediaQuery + " {", css, '}');
}
/**
 * For debugging purposes, prefix css segment with linefeed(s) for easy
 * debugging purposes.
 * @param {...?} list
 * @return {?}
 */
function format() {
    var list = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        list[_i] = arguments[_i];
    }
    /** @type {?} */
    var result = '';
    list.forEach(function (css, i) {
        result += IS_DEBUG_MODE ? formatSegment(css, i != 0) : css;
    });
    return result;
}
/**
 * @param {?} css
 * @param {?=} asPrefix
 * @return {?}
 */
function formatSegment(css, asPrefix) {
    if (asPrefix === void 0) { asPrefix = true; }
    return asPrefix ? '\n' + css : css + '\n';
}
/**
 * Get className associated with CSS styling
 * If not found, generate global className and set
 * association.
 * @param {?} stylesheet
 * @param {?} classMap
 * @return {?}
 */
function getClassName(stylesheet, classMap) {
    /** @type {?} */
    var className = classMap.get(stylesheet);
    if (!className) {
        className = "" + CLASS_NAME + nextId++;
        classMap.set(stylesheet, className);
    }
    stylesheet.classList.add(className);
    return className;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
var FlexLayoutServerModule = /** @class */ (function () {
    function FlexLayoutServerModule() {
    }
    FlexLayoutServerModule.decorators = [
        { type: NgModule, args: [{
                    providers: [SERVER_PROVIDERS]
                },] },
    ];
    return FlexLayoutServerModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { FlexLayoutServerModule, generateStaticFlexLayoutStyles, FLEX_SSR_SERIALIZER_FACTORY, SERVER_PROVIDERS };
//# sourceMappingURL=server.es5.js.map
