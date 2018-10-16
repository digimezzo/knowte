/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, NgModule } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils, CoreModule } from '@angular/flex-layout/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY = 'align';
/** @type {?} */
const ROW_DEFAULT = 'stretch';
/** @type {?} */
const COL_DEFAULT = 'stretch';
/**
 * 'align' CSS Grid styling directive for grid children
 *  Defines positioning of child elements along row and column axis in a grid container
 *  Optional values: {row-axis} values or {row-axis column-axis} value pairs
 *
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-justify-self
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-align-self
 */
class GridAlignDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY}LtXl`, val); }
    ;
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY, ROW_DEFAULT, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     *
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY) || ROW_DEFAULT;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} align
     * @return {?}
     */
    _buildCSS(align = '') {
        /** @type {?} */
        let css = {};
        let [rowAxis, columnAxis] = align.split(' ');
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
    }
}
GridAlignDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdGridAlign],
  [gdGridAlign.xs], [gdGridAlign.sm], [gdGridAlign.md], [gdGridAlign.lg],[gdGridAlign.xl],
  [gdGridAlign.lt-sm], [gdGridAlign.lt-md], [gdGridAlign.lt-lg], [gdGridAlign.lt-xl],
  [gdGridAlign.gt-xs], [gdGridAlign.gt-sm], [gdGridAlign.gt-md], [gdGridAlign.gt-lg]
` },] },
];
/** @nocollapse */
GridAlignDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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
function extendObject(dest, ...sources) {
    if (dest == null) {
        throw TypeError('Cannot convert undefined or null to object');
    }
    for (let source of sources) {
        if (source != null) {
            for (let key in source) {
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
const CACHE_KEY$1 = 'alignColumns';
/** @type {?} */
const DEFAULT_MAIN = 'start';
/** @type {?} */
const DEFAULT_CROSS = 'stretch';
/**
 * 'column alignment' CSS Grid styling directive
 * Configures the alignment in the column direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-19
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-21
 */
class GridAlignColumnsDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$1}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$1}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$1}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$1}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$1}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$1}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$1}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$1}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$1}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$1}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$1}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$1}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$1}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$1}LtXl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._cacheInput('inline', coerceBooleanProperty(val)); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$1] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$1, `${DEFAULT_MAIN} ${DEFAULT_CROSS}`, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$1) || `${DEFAULT_MAIN} ${DEFAULT_CROSS}`;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} align
     * @return {?}
     */
    _buildCSS(align = '') {
        /** @type {?} */
        let css = {};
        let [mainAxis, crossAxis] = align.split(' ');
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
    }
}
GridAlignColumnsDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdAlignColumns],
  [gdAlignColumns.xs], [gdAlignColumns.sm], [gdAlignColumns.md],
  [gdAlignColumns.lg], [gdAlignColumns.xl], [gdAlignColumns.lt-sm],
  [gdAlignColumns.lt-md], [gdAlignColumns.lt-lg], [gdAlignColumns.lt-xl],
  [gdAlignColumns.gt-xs], [gdAlignColumns.gt-sm], [gdAlignColumns.gt-md],
  [gdAlignColumns.gt-lg]
` },] },
];
/** @nocollapse */
GridAlignColumnsDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$2 = 'alignRows';
/** @type {?} */
const DEFAULT_MAIN$1 = 'start';
/** @type {?} */
const DEFAULT_CROSS$1 = 'stretch';
/**
 * 'row alignment' CSS Grid styling directive
 * Configures the alignment in the row direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-18
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-20
 */
class GridAlignRowsDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$2}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$2}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$2}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$2}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$2}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$2}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$2}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$2}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$2}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$2}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$2}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$2}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$2}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$2}LtXl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._cacheInput('inline', coerceBooleanProperty(val)); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$2] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$2, `${DEFAULT_MAIN$1} ${DEFAULT_CROSS$1}`, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$2) || `${DEFAULT_MAIN$1} ${DEFAULT_CROSS$1}`;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} align
     * @return {?}
     */
    _buildCSS(align = '') {
        /** @type {?} */
        let css = {};
        let [mainAxis, crossAxis] = align.split(' ');
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
    }
}
GridAlignRowsDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdAlignRows],
  [gdAlignRows.xs], [gdAlignRows.sm], [gdAlignRows.md],
  [gdAlignRows.lg], [gdAlignRows.xl], [gdAlignRows.lt-sm],
  [gdAlignRows.lt-md], [gdAlignRows.lt-lg], [gdAlignRows.lt-xl],
  [gdAlignRows.gt-xs], [gdAlignRows.gt-sm], [gdAlignRows.gt-md],
  [gdAlignRows.gt-lg]
` },] },
];
/** @nocollapse */
GridAlignRowsDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$3 = 'area';
/** @type {?} */
const DEFAULT_VALUE = 'auto';
/**
 * 'grid-area' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-27
 */
class GridAreaDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$3}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$3}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$3}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$3}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$3}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$3}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$3}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$3}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$3}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$3}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$3}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$3}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$3}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$3}LtXl`, val); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$3] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$3, DEFAULT_VALUE, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$3) || DEFAULT_VALUE;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = '') {
        return { 'grid-area': value };
    }
}
GridAreaDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdArea],
  [gdArea.xs], [gdArea.sm], [gdArea.md], [gdArea.lg], [gdArea.xl],
  [gdArea.lt-sm], [gdArea.lt-md], [gdArea.lt-lg], [gdArea.lt-xl],
  [gdArea.gt-xs], [gdArea.gt-sm], [gdArea.gt-md], [gdArea.gt-lg]
` },] },
];
/** @nocollapse */
GridAreaDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$4 = 'areas';
/** @type {?} */
const DEFAULT_VALUE$1 = 'none';
/** @type {?} */
const DELIMETER = '|';
/**
 * 'grid-template-areas' CSS Grid styling directive
 * Configures the names of elements within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-14
 */
class GridAreasDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$4}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$4}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$4}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$4}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$4}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$4}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$4}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$4}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$4}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$4}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$4}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$4}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$4}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$4}LtXl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._cacheInput('inline', coerceBooleanProperty(val)); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$4] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$4, DEFAULT_VALUE$1, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$4) || DEFAULT_VALUE$1;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = '') {
        /** @type {?} */
        const areas = value.split(DELIMETER).map(v => `"${v.trim()}"`);
        return {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-template-areas': areas.join(' ')
        };
    }
}
GridAreasDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdAreas],
  [gdAreas.xs], [gdAreas.sm], [gdAreas.md], [gdAreas.lg], [gdAreas.xl],
  [gdAreas.lt-sm], [gdAreas.lt-md], [gdAreas.lt-lg], [gdAreas.lt-xl],
  [gdAreas.gt-xs], [gdAreas.gt-sm], [gdAreas.gt-md], [gdAreas.gt-lg]
` },] },
];
/** @nocollapse */
GridAreasDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$5 = 'autoFlow';
/** @type {?} */
const DEFAULT_VALUE$2 = 'initial';
/**
 * 'grid-auto-flow' CSS Grid styling directive
 * Configures the auto placement algorithm for the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-23
 */
class GridAutoDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$5}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$5}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$5}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$5}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$5}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$5}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$5}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$5}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$5}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$5}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$5}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$5}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$5}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$5}LtXl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._cacheInput('inline', coerceBooleanProperty(val)); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$5] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$5, DEFAULT_VALUE$2, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$5) || DEFAULT_VALUE$2;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = '') {
        let [direction, dense] = value.split(' ');
        if (direction !== 'column' && direction !== 'row' && direction !== 'dense') {
            direction = 'row';
        }
        dense = (dense === 'dense' && direction !== 'dense') ? ' dense' : '';
        return {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-auto-flow': direction + dense
        };
    }
}
GridAutoDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdAuto],
  [gdAuto.xs], [gdAuto.sm], [gdAuto.md], [gdAuto.lg], [gdAuto.xl],
  [gdAuto.lt-sm], [gdAuto.lt-md], [gdAuto.lt-lg], [gdAuto.lt-xl],
  [gdAuto.gt-xs], [gdAuto.gt-sm], [gdAuto.gt-md], [gdAuto.gt-lg]
` },] },
];
/** @nocollapse */
GridAutoDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$6 = 'column';
/** @type {?} */
const DEFAULT_VALUE$3 = 'auto';
/**
 * 'grid-column' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
class GridColumnDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$6}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$6}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$6}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$6}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$6}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$6}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$6}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$6}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$6}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$6}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$6}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$6}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$6}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$6}LtXl`, val); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$6] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$6, DEFAULT_VALUE$3, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$6) || DEFAULT_VALUE$3;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = '') {
        return { 'grid-column': value };
    }
}
GridColumnDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdColumn],
  [gdColumn.xs], [gdColumn.sm], [gdColumn.md], [gdColumn.lg], [gdColumn.xl],
  [gdColumn.lt-sm], [gdColumn.lt-md], [gdColumn.lt-lg], [gdColumn.lt-xl],
  [gdColumn.gt-xs], [gdColumn.gt-sm], [gdColumn.gt-md], [gdColumn.gt-lg]
` },] },
];
/** @nocollapse */
GridColumnDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$7 = 'columns';
/** @type {?} */
const DEFAULT_VALUE$4 = 'none';
/** @type {?} */
const AUTO_SPECIFIER = '!';
/**
 * 'grid-template-columns' CSS Grid styling directive
 * Configures the sizing for the columns in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
class GridColumnsDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$7}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$7}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$7}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$7}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$7}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$7}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$7}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$7}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$7}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$7}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$7}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$7}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$7}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$7}LtXl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._cacheInput('inline', coerceBooleanProperty(val)); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$7] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$7, DEFAULT_VALUE$4, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$7) || DEFAULT_VALUE$4;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = '') {
        /** @type {?} */
        let auto = false;
        if (value.endsWith(AUTO_SPECIFIER)) {
            value = value.substring(0, value.indexOf(AUTO_SPECIFIER));
            auto = true;
        }
        /** @type {?} */
        let css = {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-auto-columns': '',
            'grid-template-columns': '',
        };
        /** @type {?} */
        const key = (auto ? 'grid-auto-columns' : 'grid-template-columns');
        css[key] = value;
        return css;
    }
}
GridColumnsDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdColumns],
  [gdColumns.xs], [gdColumns.sm], [gdColumns.md], [gdColumns.lg], [gdColumns.xl],
  [gdColumns.lt-sm], [gdColumns.lt-md], [gdColumns.lt-lg], [gdColumns.lt-xl],
  [gdColumns.gt-xs], [gdColumns.gt-sm], [gdColumns.gt-md], [gdColumns.gt-lg]
` },] },
];
/** @nocollapse */
GridColumnsDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$8 = 'gap';
/** @type {?} */
const DEFAULT_VALUE$5 = '0';
/**
 * 'grid-gap' CSS Grid styling directive
 * Configures the gap between items in the grid
 * Syntax: <row gap> [<column-gap>]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-17
 */
class GridGapDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$8}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$8}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$8}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$8}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$8}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$8}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$8}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$8}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$8}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$8}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$8}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$8}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$8}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$8}LtXl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._cacheInput('inline', coerceBooleanProperty(val)); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$8] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$8, DEFAULT_VALUE$5, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$8) || DEFAULT_VALUE$5;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = '') {
        return {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-gap': value
        };
    }
}
GridGapDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdGap],
  [gdGap.xs], [gdGap.sm], [gdGap.md], [gdGap.lg], [gdGap.xl],
  [gdGap.lt-sm], [gdGap.lt-md], [gdGap.lt-lg], [gdGap.lt-xl],
  [gdGap.gt-xs], [gdGap.gt-sm], [gdGap.gt-md], [gdGap.gt-lg]
` },] },
];
/** @nocollapse */
GridGapDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$9 = 'row';
/** @type {?} */
const DEFAULT_VALUE$6 = 'auto';
/**
 * 'grid-row' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
class GridRowDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$9}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$9}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$9}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$9}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$9}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$9}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$9}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$9}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$9}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$9}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$9}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$9}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$9}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$9}LtXl`, val); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$9] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$9, DEFAULT_VALUE$6, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$9) || DEFAULT_VALUE$6;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = '') {
        return { 'grid-row': value };
    }
}
GridRowDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdRow],
  [gdRow.xs], [gdRow.sm], [gdRow.md], [gdRow.lg], [gdRow.xl],
  [gdRow.lt-sm], [gdRow.lt-md], [gdRow.lt-lg], [gdRow.lt-xl],
  [gdRow.gt-xs], [gdRow.gt-sm], [gdRow.gt-md], [gdRow.gt-lg]
` },] },
];
/** @nocollapse */
GridRowDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CACHE_KEY$10 = 'rows';
/** @type {?} */
const DEFAULT_VALUE$7 = 'none';
/** @type {?} */
const AUTO_SPECIFIER$1 = '!';
/**
 * 'grid-template-rows' CSS Grid styling directive
 * Configures the sizing for the rows in the grid
 * Syntax: <row value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
class GridRowsDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput(`${CACHE_KEY$10}`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput(`${CACHE_KEY$10}Xs`, val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput(`${CACHE_KEY$10}Sm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput(`${CACHE_KEY$10}Md`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput(`${CACHE_KEY$10}Lg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput(`${CACHE_KEY$10}Xl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput(`${CACHE_KEY$10}GtXs`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput(`${CACHE_KEY$10}GtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput(`${CACHE_KEY$10}GtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput(`${CACHE_KEY$10}GtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput(`${CACHE_KEY$10}LtSm`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput(`${CACHE_KEY$10}LtMd`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput(`${CACHE_KEY$10}LtLg`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput(`${CACHE_KEY$10}LtXl`, val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set inline(val) { this._cacheInput('inline', coerceBooleanProperty(val)); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes[CACHE_KEY$10] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges(CACHE_KEY$10, DEFAULT_VALUE$7, (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput(CACHE_KEY$10) || DEFAULT_VALUE$7;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = '') {
        /** @type {?} */
        let auto = false;
        if (value.endsWith(AUTO_SPECIFIER$1)) {
            value = value.substring(0, value.indexOf(AUTO_SPECIFIER$1));
            auto = true;
        }
        /** @type {?} */
        let css = {
            'display': this._queryInput('inline') ? 'inline-grid' : 'grid',
            'grid-auto-rows': '',
            'grid-template-rows': '',
        };
        /** @type {?} */
        const key = (auto ? 'grid-auto-rows' : 'grid-template-rows');
        css[key] = value;
        return css;
    }
}
GridRowsDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [gdRows],
  [gdRows.xs], [gdRows.sm], [gdRows.md], [gdRows.lg], [gdRows.xl],
  [gdRows.lt-sm], [gdRows.lt-md], [gdRows.lt-lg], [gdRows.lt-xl],
  [gdRows.gt-xs], [gdRows.gt-sm], [gdRows.gt-md], [gdRows.gt-lg]
` },] },
];
/** @nocollapse */
GridRowsDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const ALL_DIRECTIVES = [
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
class GridModule {
}
GridModule.decorators = [
    { type: NgModule, args: [{
                imports: [CoreModule],
                declarations: [...ALL_DIRECTIVES],
                exports: [...ALL_DIRECTIVES]
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { GridModule, GridAlignColumnsDirective as ɵb, GridAlignRowsDirective as ɵc, GridAreaDirective as ɵd, GridAreasDirective as ɵe, GridAutoDirective as ɵf, GridColumnDirective as ɵg, GridColumnsDirective as ɵh, GridGapDirective as ɵi, GridAlignDirective as ɵa, GridRowDirective as ɵj, GridRowsDirective as ɵk };
//# sourceMappingURL=grid.js.map
