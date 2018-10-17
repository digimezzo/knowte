/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __extends } from 'tslib';
import { Directive, ElementRef, Input, NgModule } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils, CoreModule } from '@angular/flex-layout/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY = 'align';
/** @type {?} */
var ROW_DEFAULT = 'stretch';
/** @type {?} */
var COL_DEFAULT = 'stretch';
/**
 * 'align' CSS Grid styling directive for grid children
 *  Defines positioning of child elements along row and column axis in a grid container
 *  Optional values: {row-axis} values or {row-axis column-axis} value pairs
 *
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-justify-self
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-align-self
 */
var GridAlignDirective = /** @class */ (function (_super) {
    __extends(GridAlignDirective, _super);
    /* tslint:enable */
    function GridAlignDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridAlignDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * @param {?} changes
     * @return {?}
     */
    GridAlignDirective.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridAlignDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY, ROW_DEFAULT, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     *
     */
    /**
     *
     * @param {?=} value
     * @return {?}
     */
    GridAlignDirective.prototype._updateWithValue = /**
     *
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY) || ROW_DEFAULT;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} align
     * @return {?}
     */
    GridAlignDirective.prototype._buildCSS = /**
     * @param {?} align
     * @return {?}
     */
    function (align) {
        /** @type {?} */
        var css = {};
        var _a = align.split(' '), rowAxis = _a[0], columnAxis = _a[1];
        // Row axis
        switch (rowAxis) {
            case 'end':
                css['justify-self'] = 'end';
                break;
            case 'center':
                css['justify-self'] = 'center';
                break;
            case 'stretch':
                css['justify-self'] = 'stretch';
                break;
            case 'start':
                css['justify-self'] = 'start';
                break;
            default:
                css['justify-self'] = ROW_DEFAULT; // default row axis
                break;
        }
        // Column axis
        switch (columnAxis) {
            case 'end':
                css['align-self'] = 'end';
                break;
            case 'center':
                css['align-self'] = 'center';
                break;
            case 'stretch':
                css['align-self'] = 'stretch';
                break;
            case 'start':
                css['align-self'] = 'start';
                break;
            default:
                css['align-self'] = COL_DEFAULT; // default column axis
                break;
        }
        return css;
    };
    GridAlignDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdGridAlign],\n  [gdGridAlign.xs], [gdGridAlign.sm], [gdGridAlign.md], [gdGridAlign.lg],[gdGridAlign.xl],\n  [gdGridAlign.lt-sm], [gdGridAlign.lt-md], [gdGridAlign.lt-lg], [gdGridAlign.lt-xl],\n  [gdGridAlign.gt-xs], [gdGridAlign.gt-sm], [gdGridAlign.gt-md], [gdGridAlign.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridAlignDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridAlignDirective.propDecorators = {
        align: [{ type: Input, args: ['gdGridAlign',] }],
        alignXs: [{ type: Input, args: ['gdGridAlign.xs',] }],
        alignSm: [{ type: Input, args: ['gdGridAlign.sm',] }],
        alignMd: [{ type: Input, args: ['gdGridAlign.md',] }],
        alignLg: [{ type: Input, args: ['gdGridAlign.lg',] }],
        alignXl: [{ type: Input, args: ['gdGridAlign.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdGridAlign.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdGridAlign.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdGridAlign.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdGridAlign.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdGridAlign.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdGridAlign.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdGridAlign.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdGridAlign.lt-xl',] }]
    };
    return GridAlignDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Extends an object with the *enumerable* and *own* properties of one or more source objects,
 * similar to Object.assign.
 *
 * @param {?} dest The object which will have properties copied to it.
 * @param {...?} sources The source objects from which properties will be copied.
 * @return {?}
 */
function extendObject(dest) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    if (dest == null) {
        throw TypeError('Cannot convert undefined or null to object');
    }
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        if (source != null) {
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    dest[key] = source[key];
                }
            }
        }
    }
    return dest;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$1 = 'alignColumns';
/** @type {?} */
var DEFAULT_MAIN = 'start';
/** @type {?} */
var DEFAULT_CROSS = 'stretch';
/**
 * 'column alignment' CSS Grid styling directive
 * Configures the alignment in the column direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-19
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-21
 */
var GridAlignColumnsDirective = /** @class */ (function (_super) {
    __extends(GridAlignColumnsDirective, _super);
    /* tslint:enable */
    function GridAlignColumnsDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridAlignColumnsDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$1, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$1 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignColumnsDirective.prototype, "inline", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput('inline', coerceBooleanProperty(val)); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridAlignColumnsDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$1] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridAlignColumnsDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$1, DEFAULT_MAIN + " " + DEFAULT_CROSS, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridAlignColumnsDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$1) || DEFAULT_MAIN + " " + DEFAULT_CROSS;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} align
     * @return {?}
     */
    GridAlignColumnsDirective.prototype._buildCSS = /**
     * @param {?} align
     * @return {?}
     */
    function (align) {
        /** @type {?} */
        var css = {};
        var _a = align.split(' '), mainAxis = _a[0], crossAxis = _a[1];
        // Main axis
        switch (mainAxis) {
            case 'center':
                css['align-content'] = 'center';
                break;
            case 'space-around':
                css['align-content'] = 'space-around';
                break;
            case 'space-between':
                css['align-content'] = 'space-between';
                break;
            case 'space-evenly':
                css['align-content'] = 'space-evenly';
                break;
            case 'end':
                css['align-content'] = 'end';
                break;
            case 'start':
                css['align-content'] = 'start';
                break;
            case 'stretch':
                css['align-content'] = 'stretch';
                break;
            default:
                css['align-content'] = DEFAULT_MAIN; // default main axis
                break;
        }
        // Cross-axis
        switch (crossAxis) {
            case 'start':
                css['align-items'] = 'start';
                break;
            case 'center':
                css['align-items'] = 'center';
                break;
            case 'end':
                css['align-items'] = 'end';
                break;
            case 'stretch':
                css['align-items'] = 'stretch';
                break;
            default: // 'stretch'
                // 'stretch'
                css['align-items'] = DEFAULT_CROSS; // default cross axis
                break;
        }
        return extendObject(css, { 'display': this._queryInput('inline') ? 'inline-grid' : 'grid' });
    };
    GridAlignColumnsDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdAlignColumns],\n  [gdAlignColumns.xs], [gdAlignColumns.sm], [gdAlignColumns.md],\n  [gdAlignColumns.lg], [gdAlignColumns.xl], [gdAlignColumns.lt-sm],\n  [gdAlignColumns.lt-md], [gdAlignColumns.lt-lg], [gdAlignColumns.lt-xl],\n  [gdAlignColumns.gt-xs], [gdAlignColumns.gt-sm], [gdAlignColumns.gt-md],\n  [gdAlignColumns.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridAlignColumnsDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridAlignColumnsDirective.propDecorators = {
        align: [{ type: Input, args: ['gdAlignColumns',] }],
        alignXs: [{ type: Input, args: ['gdAlignColumns.xs',] }],
        alignSm: [{ type: Input, args: ['gdAlignColumns.sm',] }],
        alignMd: [{ type: Input, args: ['gdAlignColumns.md',] }],
        alignLg: [{ type: Input, args: ['gdAlignColumns.lg',] }],
        alignXl: [{ type: Input, args: ['gdAlignColumns.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdAlignColumns.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdAlignColumns.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdAlignColumns.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdAlignColumns.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdAlignColumns.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdAlignColumns.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdAlignColumns.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdAlignColumns.lt-xl',] }],
        inline: [{ type: Input, args: ['gdInline',] }]
    };
    return GridAlignColumnsDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$2 = 'alignRows';
/** @type {?} */
var DEFAULT_MAIN$1 = 'start';
/** @type {?} */
var DEFAULT_CROSS$1 = 'stretch';
/**
 * 'row alignment' CSS Grid styling directive
 * Configures the alignment in the row direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-18
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-20
 */
var GridAlignRowsDirective = /** @class */ (function (_super) {
    __extends(GridAlignRowsDirective, _super);
    /* tslint:enable */
    function GridAlignRowsDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridAlignRowsDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$2, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$2 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAlignRowsDirective.prototype, "inline", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput('inline', coerceBooleanProperty(val)); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridAlignRowsDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$2] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridAlignRowsDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$2, DEFAULT_MAIN$1 + " " + DEFAULT_CROSS$1, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridAlignRowsDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$2) || DEFAULT_MAIN$1 + " " + DEFAULT_CROSS$1;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} align
     * @return {?}
     */
    GridAlignRowsDirective.prototype._buildCSS = /**
     * @param {?} align
     * @return {?}
     */
    function (align) {
        /** @type {?} */
        var css = {};
        var _a = align.split(' '), mainAxis = _a[0], crossAxis = _a[1];
        // Main axis
        switch (mainAxis) {
            case 'center':
            case 'space-around':
            case 'space-between':
            case 'space-evenly':
            case 'end':
            case 'start':
            case 'stretch':
                css['justify-content'] = mainAxis;
                break;
            default:
                css['justify-content'] = DEFAULT_MAIN$1; // default main axis
                break;
        }
        // Cross-axis
        switch (crossAxis) {
            case 'start':
            case 'center':
            case 'end':
            case 'stretch':
                css['justify-items'] = crossAxis;
                break;
            default: // 'stretch'
                // 'stretch'
                css['justify-items'] = DEFAULT_CROSS$1; // default cross axis
                break;
        }
        return extendObject(css, { 'display': this._queryInput('inline') ? 'inline-grid' : 'grid' });
    };
    GridAlignRowsDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdAlignRows],\n  [gdAlignRows.xs], [gdAlignRows.sm], [gdAlignRows.md],\n  [gdAlignRows.lg], [gdAlignRows.xl], [gdAlignRows.lt-sm],\n  [gdAlignRows.lt-md], [gdAlignRows.lt-lg], [gdAlignRows.lt-xl],\n  [gdAlignRows.gt-xs], [gdAlignRows.gt-sm], [gdAlignRows.gt-md],\n  [gdAlignRows.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridAlignRowsDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridAlignRowsDirective.propDecorators = {
        align: [{ type: Input, args: ['gdAlignRows',] }],
        alignXs: [{ type: Input, args: ['gdAlignRows.xs',] }],
        alignSm: [{ type: Input, args: ['gdAlignRows.sm',] }],
        alignMd: [{ type: Input, args: ['gdAlignRows.md',] }],
        alignLg: [{ type: Input, args: ['gdAlignRows.lg',] }],
        alignXl: [{ type: Input, args: ['gdAlignRows.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdAlignRows.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdAlignRows.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdAlignRows.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdAlignRows.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdAlignRows.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdAlignRows.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdAlignRows.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdAlignRows.lt-xl',] }],
        inline: [{ type: Input, args: ['gdInline',] }]
    };
    return GridAlignRowsDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$3 = 'area';
/** @type {?} */
var DEFAULT_VALUE = 'auto';
/**
 * 'grid-area' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-27
 */
var GridAreaDirective = /** @class */ (function (_super) {
    __extends(GridAreaDirective, _super);
    /* tslint:enable */
    function GridAreaDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridAreaDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$3, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreaDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$3 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridAreaDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$3] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridAreaDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$3, DEFAULT_VALUE, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridAreaDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$3) || DEFAULT_VALUE;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    GridAreaDirective.prototype._buildCSS = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        return { 'grid-area': value };
    };
    GridAreaDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdArea],\n  [gdArea.xs], [gdArea.sm], [gdArea.md], [gdArea.lg], [gdArea.xl],\n  [gdArea.lt-sm], [gdArea.lt-md], [gdArea.lt-lg], [gdArea.lt-xl],\n  [gdArea.gt-xs], [gdArea.gt-sm], [gdArea.gt-md], [gdArea.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridAreaDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridAreaDirective.propDecorators = {
        align: [{ type: Input, args: ['gdArea',] }],
        alignXs: [{ type: Input, args: ['gdArea.xs',] }],
        alignSm: [{ type: Input, args: ['gdArea.sm',] }],
        alignMd: [{ type: Input, args: ['gdArea.md',] }],
        alignLg: [{ type: Input, args: ['gdArea.lg',] }],
        alignXl: [{ type: Input, args: ['gdArea.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdArea.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdArea.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdArea.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdArea.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdArea.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdArea.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdArea.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdArea.lt-xl',] }]
    };
    return GridAreaDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$4 = 'areas';
/** @type {?} */
var DEFAULT_VALUE$1 = 'none';
/** @type {?} */
var DELIMETER = '|';
/**
 * 'grid-template-areas' CSS Grid styling directive
 * Configures the names of elements within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-14
 */
var GridAreasDirective = /** @class */ (function (_super) {
    __extends(GridAreasDirective, _super);
    /* tslint:enable */
    function GridAreasDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridAreasDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$4, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$4 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAreasDirective.prototype, "inline", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput('inline', coerceBooleanProperty(val)); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridAreasDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$4] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridAreasDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$4, DEFAULT_VALUE$1, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridAreasDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$4) || DEFAULT_VALUE$1;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    GridAreasDirective.prototype._buildCSS = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var areas = value.split(DELIMETER).map(function (v) { return "\"" + v.trim() + "\""; });
        return {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-template-areas': areas.join(' ')
        };
    };
    GridAreasDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdAreas],\n  [gdAreas.xs], [gdAreas.sm], [gdAreas.md], [gdAreas.lg], [gdAreas.xl],\n  [gdAreas.lt-sm], [gdAreas.lt-md], [gdAreas.lt-lg], [gdAreas.lt-xl],\n  [gdAreas.gt-xs], [gdAreas.gt-sm], [gdAreas.gt-md], [gdAreas.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridAreasDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridAreasDirective.propDecorators = {
        align: [{ type: Input, args: ['gdAreas',] }],
        alignXs: [{ type: Input, args: ['gdAreas.xs',] }],
        alignSm: [{ type: Input, args: ['gdAreas.sm',] }],
        alignMd: [{ type: Input, args: ['gdAreas.md',] }],
        alignLg: [{ type: Input, args: ['gdAreas.lg',] }],
        alignXl: [{ type: Input, args: ['gdAreas.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdAreas.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdAreas.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdAreas.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdAreas.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdAreas.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdAreas.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdAreas.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdAreas.lt-xl',] }],
        inline: [{ type: Input, args: ['gdInline',] }]
    };
    return GridAreasDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$5 = 'autoFlow';
/** @type {?} */
var DEFAULT_VALUE$2 = 'initial';
/**
 * 'grid-auto-flow' CSS Grid styling directive
 * Configures the auto placement algorithm for the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-23
 */
var GridAutoDirective = /** @class */ (function (_super) {
    __extends(GridAutoDirective, _super);
    /* tslint:enable */
    function GridAutoDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridAutoDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$5, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$5 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridAutoDirective.prototype, "inline", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput('inline', coerceBooleanProperty(val)); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridAutoDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$5] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridAutoDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$5, DEFAULT_VALUE$2, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridAutoDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$5) || DEFAULT_VALUE$2;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    GridAutoDirective.prototype._buildCSS = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        var _a = value.split(' '), direction = _a[0], dense = _a[1];
        if (direction !== 'column' && direction !== 'row' && direction !== 'dense') {
            direction = 'row';
        }
        dense = (dense === 'dense' && direction !== 'dense') ? ' dense' : '';
        return {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-auto-flow': direction + dense
        };
    };
    GridAutoDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdAuto],\n  [gdAuto.xs], [gdAuto.sm], [gdAuto.md], [gdAuto.lg], [gdAuto.xl],\n  [gdAuto.lt-sm], [gdAuto.lt-md], [gdAuto.lt-lg], [gdAuto.lt-xl],\n  [gdAuto.gt-xs], [gdAuto.gt-sm], [gdAuto.gt-md], [gdAuto.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridAutoDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridAutoDirective.propDecorators = {
        align: [{ type: Input, args: ['gdAuto',] }],
        alignXs: [{ type: Input, args: ['gdAuto.xs',] }],
        alignSm: [{ type: Input, args: ['gdAuto.sm',] }],
        alignMd: [{ type: Input, args: ['gdAuto.md',] }],
        alignLg: [{ type: Input, args: ['gdAuto.lg',] }],
        alignXl: [{ type: Input, args: ['gdAuto.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdAuto.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdAuto.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdAuto.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdAuto.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdAuto.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdAuto.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdAuto.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdAuto.lt-xl',] }],
        inline: [{ type: Input, args: ['gdInline',] }]
    };
    return GridAutoDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$6 = 'column';
/** @type {?} */
var DEFAULT_VALUE$3 = 'auto';
/**
 * 'grid-column' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
var GridColumnDirective = /** @class */ (function (_super) {
    __extends(GridColumnDirective, _super);
    /* tslint:enable */
    function GridColumnDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridColumnDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$6, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$6 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridColumnDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$6] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridColumnDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$6, DEFAULT_VALUE$3, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridColumnDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$6) || DEFAULT_VALUE$3;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    GridColumnDirective.prototype._buildCSS = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        return { 'grid-column': value };
    };
    GridColumnDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdColumn],\n  [gdColumn.xs], [gdColumn.sm], [gdColumn.md], [gdColumn.lg], [gdColumn.xl],\n  [gdColumn.lt-sm], [gdColumn.lt-md], [gdColumn.lt-lg], [gdColumn.lt-xl],\n  [gdColumn.gt-xs], [gdColumn.gt-sm], [gdColumn.gt-md], [gdColumn.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridColumnDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridColumnDirective.propDecorators = {
        align: [{ type: Input, args: ['gdColumn',] }],
        alignXs: [{ type: Input, args: ['gdColumn.xs',] }],
        alignSm: [{ type: Input, args: ['gdColumn.sm',] }],
        alignMd: [{ type: Input, args: ['gdColumn.md',] }],
        alignLg: [{ type: Input, args: ['gdColumn.lg',] }],
        alignXl: [{ type: Input, args: ['gdColumn.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdColumn.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdColumn.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdColumn.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdColumn.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdColumn.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdColumn.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdColumn.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdColumn.lt-xl',] }]
    };
    return GridColumnDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$7 = 'columns';
/** @type {?} */
var DEFAULT_VALUE$4 = 'none';
/** @type {?} */
var AUTO_SPECIFIER = '!';
/**
 * 'grid-template-columns' CSS Grid styling directive
 * Configures the sizing for the columns in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
var GridColumnsDirective = /** @class */ (function (_super) {
    __extends(GridColumnsDirective, _super);
    /* tslint:enable */
    function GridColumnsDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridColumnsDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$7, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$7 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridColumnsDirective.prototype, "inline", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput('inline', coerceBooleanProperty(val)); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridColumnsDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$7] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridColumnsDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$7, DEFAULT_VALUE$4, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridColumnsDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$7) || DEFAULT_VALUE$4;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    GridColumnsDirective.prototype._buildCSS = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var auto = false;
        if (value.endsWith(AUTO_SPECIFIER)) {
            value = value.substring(0, value.indexOf(AUTO_SPECIFIER));
            auto = true;
        }
        /** @type {?} */
        var css = {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-auto-columns': '',
            'grid-template-columns': '',
        };
        /** @type {?} */
        var key = (auto ? 'grid-auto-columns' : 'grid-template-columns');
        css[key] = value;
        return css;
    };
    GridColumnsDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdColumns],\n  [gdColumns.xs], [gdColumns.sm], [gdColumns.md], [gdColumns.lg], [gdColumns.xl],\n  [gdColumns.lt-sm], [gdColumns.lt-md], [gdColumns.lt-lg], [gdColumns.lt-xl],\n  [gdColumns.gt-xs], [gdColumns.gt-sm], [gdColumns.gt-md], [gdColumns.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridColumnsDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridColumnsDirective.propDecorators = {
        align: [{ type: Input, args: ['gdColumns',] }],
        alignXs: [{ type: Input, args: ['gdColumns.xs',] }],
        alignSm: [{ type: Input, args: ['gdColumns.sm',] }],
        alignMd: [{ type: Input, args: ['gdColumns.md',] }],
        alignLg: [{ type: Input, args: ['gdColumns.lg',] }],
        alignXl: [{ type: Input, args: ['gdColumns.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdColumns.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdColumns.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdColumns.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdColumns.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdColumns.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdColumns.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdColumns.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdColumns.lt-xl',] }],
        inline: [{ type: Input, args: ['gdInline',] }]
    };
    return GridColumnsDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$8 = 'gap';
/** @type {?} */
var DEFAULT_VALUE$5 = '0';
/**
 * 'grid-gap' CSS Grid styling directive
 * Configures the gap between items in the grid
 * Syntax: <row gap> [<column-gap>]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-17
 */
var GridGapDirective = /** @class */ (function (_super) {
    __extends(GridGapDirective, _super);
    /* tslint:enable */
    function GridGapDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridGapDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$8, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$8 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridGapDirective.prototype, "inline", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput('inline', coerceBooleanProperty(val)); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridGapDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$8] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridGapDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$8, DEFAULT_VALUE$5, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridGapDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$8) || DEFAULT_VALUE$5;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    GridGapDirective.prototype._buildCSS = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        return {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-gap': value
        };
    };
    GridGapDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdGap],\n  [gdGap.xs], [gdGap.sm], [gdGap.md], [gdGap.lg], [gdGap.xl],\n  [gdGap.lt-sm], [gdGap.lt-md], [gdGap.lt-lg], [gdGap.lt-xl],\n  [gdGap.gt-xs], [gdGap.gt-sm], [gdGap.gt-md], [gdGap.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridGapDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridGapDirective.propDecorators = {
        align: [{ type: Input, args: ['gdGap',] }],
        alignXs: [{ type: Input, args: ['gdGap.xs',] }],
        alignSm: [{ type: Input, args: ['gdGap.sm',] }],
        alignMd: [{ type: Input, args: ['gdGap.md',] }],
        alignLg: [{ type: Input, args: ['gdGap.lg',] }],
        alignXl: [{ type: Input, args: ['gdGap.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdGap.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdGap.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdGap.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdGap.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdGap.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdGap.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdGap.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdGap.lt-xl',] }],
        inline: [{ type: Input, args: ['gdInline',] }]
    };
    return GridGapDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$9 = 'row';
/** @type {?} */
var DEFAULT_VALUE$6 = 'auto';
/**
 * 'grid-row' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
var GridRowDirective = /** @class */ (function (_super) {
    __extends(GridRowDirective, _super);
    /* tslint:enable */
    function GridRowDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridRowDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$9, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$9 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridRowDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$9] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridRowDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$9, DEFAULT_VALUE$6, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridRowDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$9) || DEFAULT_VALUE$6;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    GridRowDirective.prototype._buildCSS = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        return { 'grid-row': value };
    };
    GridRowDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdRow],\n  [gdRow.xs], [gdRow.sm], [gdRow.md], [gdRow.lg], [gdRow.xl],\n  [gdRow.lt-sm], [gdRow.lt-md], [gdRow.lt-lg], [gdRow.lt-xl],\n  [gdRow.gt-xs], [gdRow.gt-sm], [gdRow.gt-md], [gdRow.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridRowDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridRowDirective.propDecorators = {
        align: [{ type: Input, args: ['gdRow',] }],
        alignXs: [{ type: Input, args: ['gdRow.xs',] }],
        alignSm: [{ type: Input, args: ['gdRow.sm',] }],
        alignMd: [{ type: Input, args: ['gdRow.md',] }],
        alignLg: [{ type: Input, args: ['gdRow.lg',] }],
        alignXl: [{ type: Input, args: ['gdRow.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdRow.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdRow.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdRow.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdRow.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdRow.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdRow.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdRow.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdRow.lt-xl',] }]
    };
    return GridRowDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var CACHE_KEY$10 = 'rows';
/** @type {?} */
var DEFAULT_VALUE$7 = 'none';
/** @type {?} */
var AUTO_SPECIFIER$1 = '!';
/**
 * 'grid-template-rows' CSS Grid styling directive
 * Configures the sizing for the rows in the grid
 * Syntax: <row value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
var GridRowsDirective = /** @class */ (function (_super) {
    __extends(GridRowsDirective, _super);
    /* tslint:enable */
    function GridRowsDirective(monitor, elRef, styleUtils) {
        return _super.call(this, monitor, elRef, styleUtils) || this;
    }
    Object.defineProperty(GridRowsDirective.prototype, "align", {
        /* tslint:disable */
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput("" + CACHE_KEY$10, val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "Xs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "Sm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "Md", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "Lg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "Xl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignGtXs", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "GtXs", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignGtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "GtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignGtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "GtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignGtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "GtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignLtSm", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "LtSm", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignLtMd", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "LtMd", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignLtLg", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "LtLg", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "alignLtXl", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput(CACHE_KEY$10 + "LtXl", val); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridRowsDirective.prototype, "inline", {
        set: /**
         * @param {?} val
         * @return {?}
         */
        function (val) { this._cacheInput('inline', coerceBooleanProperty(val)); },
        enumerable: true,
        configurable: true
    });
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    GridRowsDirective.prototype.ngOnChanges = /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes[CACHE_KEY$10] != null || this._mqActivation) {
            this._updateWithValue();
        }
    };
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    GridRowsDirective.prototype.ngOnInit = /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this._listenForMediaQueryChanges(CACHE_KEY$10, DEFAULT_VALUE$7, function (changes) {
            _this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    };
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     * @param {?=} value
     * @return {?}
     */
    GridRowsDirective.prototype._updateWithValue = /**
     * @param {?=} value
     * @return {?}
     */
    function (value) {
        value = value || this._queryInput(CACHE_KEY$10) || DEFAULT_VALUE$7;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    };
    /**
     * @param {?} value
     * @return {?}
     */
    GridRowsDirective.prototype._buildCSS = /**
     * @param {?} value
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var auto = false;
        if (value.endsWith(AUTO_SPECIFIER$1)) {
            value = value.substring(0, value.indexOf(AUTO_SPECIFIER$1));
            auto = true;
        }
        /** @type {?} */
        var css = {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-auto-rows': '',
            'grid-template-rows': '',
        };
        /** @type {?} */
        var key = (auto ? 'grid-auto-rows' : 'grid-template-rows');
        css[key] = value;
        return css;
    };
    GridRowsDirective.decorators = [
        { type: Directive, args: [{ selector: "\n  [gdRows],\n  [gdRows.xs], [gdRows.sm], [gdRows.md], [gdRows.lg], [gdRows.xl],\n  [gdRows.lt-sm], [gdRows.lt-md], [gdRows.lt-lg], [gdRows.lt-xl],\n  [gdRows.gt-xs], [gdRows.gt-sm], [gdRows.gt-md], [gdRows.gt-lg]\n" },] },
    ];
    /** @nocollapse */
    GridRowsDirective.ctorParameters = function () { return [
        { type: MediaMonitor },
        { type: ElementRef },
        { type: StyleUtils }
    ]; };
    GridRowsDirective.propDecorators = {
        align: [{ type: Input, args: ['gdRows',] }],
        alignXs: [{ type: Input, args: ['gdRows.xs',] }],
        alignSm: [{ type: Input, args: ['gdRows.sm',] }],
        alignMd: [{ type: Input, args: ['gdRows.md',] }],
        alignLg: [{ type: Input, args: ['gdRows.lg',] }],
        alignXl: [{ type: Input, args: ['gdRows.xl',] }],
        alignGtXs: [{ type: Input, args: ['gdRows.gt-xs',] }],
        alignGtSm: [{ type: Input, args: ['gdRows.gt-sm',] }],
        alignGtMd: [{ type: Input, args: ['gdRows.gt-md',] }],
        alignGtLg: [{ type: Input, args: ['gdRows.gt-lg',] }],
        alignLtSm: [{ type: Input, args: ['gdRows.lt-sm',] }],
        alignLtMd: [{ type: Input, args: ['gdRows.lt-md',] }],
        alignLtLg: [{ type: Input, args: ['gdRows.lt-lg',] }],
        alignLtXl: [{ type: Input, args: ['gdRows.lt-xl',] }],
        inline: [{ type: Input, args: ['gdInline',] }]
    };
    return GridRowsDirective;
}(BaseDirective));

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
var ALL_DIRECTIVES = [
    GridAlignDirective,
    GridAlignColumnsDirective,
    GridAlignRowsDirective,
    GridAreaDirective,
    GridAreasDirective,
    GridAutoDirective,
    GridColumnDirective,
    GridColumnsDirective,
    GridGapDirective,
    GridRowDirective,
    GridRowsDirective,
];
/**
 * *****************************************************************
 * Define module for the CSS Grid API
 * *****************************************************************
 */
var GridModule = /** @class */ (function () {
    function GridModule() {
    }
    GridModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CoreModule],
                    declarations: ALL_DIRECTIVES.slice(),
                    exports: ALL_DIRECTIVES.slice()
                },] },
    ];
    return GridModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { GridModule, GridAlignColumnsDirective as ɵb, GridAlignRowsDirective as ɵc, GridAreaDirective as ɵd, GridAreasDirective as ɵe, GridAutoDirective as ɵf, GridColumnDirective as ɵg, GridColumnsDirective as ɵh, GridGapDirective as ɵi, GridAlignDirective as ɵa, GridRowDirective as ɵj, GridRowsDirective as ɵk };
//# sourceMappingURL=grid.es5.js.map
