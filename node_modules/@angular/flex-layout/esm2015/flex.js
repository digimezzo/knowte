/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, Self, Optional, NgZone, Inject, SkipSelf, NgModule } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils, LAYOUT_CONFIG, validateBasis, CoreModule } from '@angular/flex-layout/core';
import { ReplaySubject } from 'rxjs';
import { Directionality, BidiModule } from '@angular/cdk/bidi';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
  @type {?} */
const INLINE = 'inline';
/** @type {?} */
const LAYOUT_VALUES = ['row', 'column', 'row-reverse', 'column-reverse'];
/**
 * Validate the direction|'direction wrap' value and then update the host's inline flexbox styles
 * @param {?} value
 * @return {?}
 */
function buildLayoutCSS(value) {
    let [direction, wrap, isInline] = validateValue(value);
    return buildCSS(direction, wrap, isInline);
}
/**
 * Validate the value to be one of the acceptable value options
 * Use default fallback of 'row'
 * @param {?} value
 * @return {?}
 */
function validateValue(value) {
    value = value ? value.toLowerCase() : '';
    let [direction, wrap, inline] = value.split(' ');
    // First value must be the `flex-direction`
    if (!LAYOUT_VALUES.find(x => x === direction)) {
        direction = LAYOUT_VALUES[0];
    }
    if (wrap === INLINE) {
        wrap = (inline !== INLINE) ? inline : '';
        inline = INLINE;
    }
    return [direction, validateWrapValue(wrap), !!inline];
}
/**
 * Determine if the validated, flex-direction value specifies
 * a horizontal/row flow.
 * @param {?} value
 * @return {?}
 */
function isFlowHorizontal(value) {
    let [flow,] = validateValue(value);
    return flow.indexOf('row') > -1;
}
/**
 * Convert layout-wrap='<value>' to expected flex-wrap style
 * @param {?} value
 * @return {?}
 */
function validateWrapValue(value) {
    if (!!value) {
        switch (value.toLowerCase()) {
            case 'reverse':
            case 'wrap-reverse':
            case 'reverse-wrap':
                value = 'wrap-reverse';
                break;
            case 'no':
            case 'none':
            case 'nowrap':
                value = 'nowrap';
                break;
            // All other values fallback to 'wrap'
            default:
                value = 'wrap';
                break;
        }
    }
    return value;
}
/**
 * Build the CSS that should be assigned to the element instance
 * BUG:
 *   1) min-height on a column flex container won’t apply to its flex item children in IE 10-11.
 *      Use height instead if possible; height : <xxx>vh;
 *
 *  This way any padding or border specified on the child elements are
 *  laid out and drawn inside that element's specified width and height.
 * @param {?} direction
 * @param {?=} wrap
 * @param {?=} inline
 * @return {?}
 */
function buildCSS(direction, wrap = null, inline = false) {
    return {
        'display': inline ? 'inline-flex' : 'flex',
        'box-sizing': 'border-box',
        'flex-direction': direction,
        'flex-wrap': !!wrap ? wrap : null
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * 'layout' flexbox styling directive
 * Defines the positioning flow direction for the child elements: row or column
 * Optional values: column or row (default)
 * @see https://css-tricks.com/almanac/properties/f/flex-direction/
 *
 */
class LayoutDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
        this._announcer = new ReplaySubject(1);
        this.layout$ = this._announcer.asObservable();
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set layout(val) { this._cacheInput('layout', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutXs(val) { this._cacheInput('layoutXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutSm(val) { this._cacheInput('layoutSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutMd(val) { this._cacheInput('layoutMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutLg(val) { this._cacheInput('layoutLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutXl(val) { this._cacheInput('layoutXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutGtXs(val) { this._cacheInput('layoutGtXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutGtSm(val) { this._cacheInput('layoutGtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutGtMd(val) { this._cacheInput('layoutGtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutGtLg(val) { this._cacheInput('layoutGtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutLtSm(val) { this._cacheInput('layoutLtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutLtMd(val) { this._cacheInput('layoutLtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutLtLg(val) { this._cacheInput('layoutLtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set layoutLtXl(val) { this._cacheInput('layoutLtXl', val); }
    ;
    /**
     * On changes to any \@Input properties...
     * Default to use the non-responsive Input value ('fxLayout')
     * Then conditionally override with the mq-activated Input's current value
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes['layout'] != null || this._mqActivation) {
            this._updateWithDirection();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges('layout', 'row', (changes) => {
            this._updateWithDirection(changes.value);
        });
    }
    /**
     * Validate the direction value and then update the host's inline flexbox styles
     * @param {?=} value
     * @return {?}
     */
    _updateWithDirection(value) {
        value = value || this._queryInput('layout') || 'row';
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        /** @type {?} */
        let css = buildLayoutCSS(!!value ? value : '');
        this._applyStyleToElement(css);
        this._announcer.next({
            direction: css['flex-direction'],
            wrap: !!css['flex-wrap'] && css['flex-wrap'] !== 'nowrap'
        });
    }
}
LayoutDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [fxLayout],
  [fxLayout.xs], [fxLayout.sm], [fxLayout.md], [fxLayout.lg], [fxLayout.xl],
  [fxLayout.lt-sm], [fxLayout.lt-md], [fxLayout.lt-lg], [fxLayout.lt-xl],
  [fxLayout.gt-xs], [fxLayout.gt-sm], [fxLayout.gt-md], [fxLayout.gt-lg]
` },] },
];
/** @nocollapse */
LayoutDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
LayoutDirective.propDecorators = {
    layout: [{ type: Input, args: ['fxLayout',] }],
    layoutXs: [{ type: Input, args: ['fxLayout.xs',] }],
    layoutSm: [{ type: Input, args: ['fxLayout.sm',] }],
    layoutMd: [{ type: Input, args: ['fxLayout.md',] }],
    layoutLg: [{ type: Input, args: ['fxLayout.lg',] }],
    layoutXl: [{ type: Input, args: ['fxLayout.xl',] }],
    layoutGtXs: [{ type: Input, args: ['fxLayout.gt-xs',] }],
    layoutGtSm: [{ type: Input, args: ['fxLayout.gt-sm',] }],
    layoutGtMd: [{ type: Input, args: ['fxLayout.gt-md',] }],
    layoutGtLg: [{ type: Input, args: ['fxLayout.gt-lg',] }],
    layoutLtSm: [{ type: Input, args: ['fxLayout.lt-sm',] }],
    layoutLtMd: [{ type: Input, args: ['fxLayout.lt-md',] }],
    layoutLtLg: [{ type: Input, args: ['fxLayout.lt-lg',] }],
    layoutLtXl: [{ type: Input, args: ['fxLayout.lt-xl',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * 'layout-padding' styling directive
 *  Defines padding of child elements in a layout container
 */
class LayoutGapDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} container
     * @param {?} _zone
     * @param {?} _directionality
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, container, _zone, _directionality, styleUtils) {
        super(monitor, elRef, styleUtils);
        this._zone = _zone;
        this._directionality = _directionality;
        this._layout = 'row';
        if (container) { // Subscribe to layout direction changes
            // Subscribe to layout direction changes
            this._layoutWatcher = container.layout$.subscribe(this._onLayoutChange.bind(this));
        }
        this._directionWatcher =
            this._directionality.change.subscribe(this._updateWithValue.bind(this));
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set gap(val) { this._cacheInput('gap', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set gapXs(val) { this._cacheInput('gapXs', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set gapSm(val) { this._cacheInput('gapSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapMd(val) { this._cacheInput('gapMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapLg(val) { this._cacheInput('gapLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapXl(val) { this._cacheInput('gapXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapGtXs(val) { this._cacheInput('gapGtXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapGtSm(val) { this._cacheInput('gapGtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapGtMd(val) { this._cacheInput('gapGtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapGtLg(val) { this._cacheInput('gapGtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapLtSm(val) { this._cacheInput('gapLtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapLtMd(val) { this._cacheInput('gapLtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapLtLg(val) { this._cacheInput('gapLtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set gapLtXl(val) { this._cacheInput('gapLtXl', val); }
    ;
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes['gap'] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngAfterContentInit() {
        this._watchContentChanges();
        this._listenForMediaQueryChanges('gap', '0', (changes) => {
            this._updateWithValue(changes.value);
        });
        this._updateWithValue();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._layoutWatcher) {
            this._layoutWatcher.unsubscribe();
        }
        if (this._observer) {
            this._observer.disconnect();
        }
        if (this._directionWatcher) {
            this._directionWatcher.unsubscribe();
        }
    }
    /**
     * Watch for child nodes to be added... and apply the layout gap styles to each.
     * NOTE: this does NOT! differentiate between viewChildren and contentChildren
     * @return {?}
     */
    _watchContentChanges() {
        this._zone.runOutsideAngular(() => {
            if (typeof MutationObserver !== 'undefined') {
                this._observer = new MutationObserver((mutations) => {
                    /** @type {?} */
                    const validatedChanges = (it) => {
                        return (it.addedNodes && it.addedNodes.length > 0) ||
                            (it.removedNodes && it.removedNodes.length > 0);
                    };
                    // update gap styles only for child 'added' or 'removed' events
                    if (mutations.some(validatedChanges)) {
                        this._updateWithValue();
                    }
                });
                this._observer.observe(this.nativeElement, { childList: true });
            }
        });
    }
    /**
     * Cache the parent container 'flex-direction' and update the 'margin' styles
     * @param {?} layout
     * @return {?}
     */
    _onLayoutChange(layout) {
        this._layout = (layout.direction || '').toLowerCase();
        if (!LAYOUT_VALUES.find(x => x === this._layout)) {
            this._layout = 'row';
        }
        this._updateWithValue();
    }
    /**
     *
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        /** @type {?} */
        let gapValue = value || this._queryInput('gap') || '0';
        if (this._mqActivation) {
            gapValue = this._mqActivation.activatedInput;
        }
        /** @type {?} */
        const items = this.childrenNodes
            .filter(el => el.nodeType === 1 && this._getDisplayStyle(el) != 'none')
            .sort((a, b) => {
            /** @type {?} */
            const orderA = +this._styler.lookupStyle(a, 'order');
            /** @type {?} */
            const orderB = +this._styler.lookupStyle(b, 'order');
            if (isNaN(orderA) || isNaN(orderB) || orderA === orderB) {
                return 0;
            }
            else {
                return orderA > orderB ? 1 : -1;
            }
        });
        if (items.length > 0) {
            if (gapValue.endsWith(GRID_SPECIFIER)) {
                gapValue = gapValue.substring(0, gapValue.indexOf(GRID_SPECIFIER));
                // For each `element` children, set the padding
                this._applyStyleToElements(this._buildGridPadding(gapValue), items);
                // Add the margin to the host element
                this._applyStyleToElement(this._buildGridMargin(gapValue));
            }
            else {
                /** @type {?} */
                const lastItem = items.pop();
                // For each `element` children EXCEPT the last,
                // set the margin right/bottom styles...
                this._applyStyleToElements(this._buildCSS(gapValue), items);
                // Clear all gaps for all visible elements
                this._applyStyleToElements(this._buildCSS(), [lastItem]);
            }
        }
    }
    /**
     *
     * @param {?} value
     * @return {?}
     */
    _buildGridPadding(value) {
        /** @type {?} */
        let paddingTop = '0px';
        /** @type {?} */
        let paddingRight = '0px';
        /** @type {?} */
        let paddingBottom = value;
        /** @type {?} */
        let paddingLeft = '0px';
        if (this._directionality.value === 'rtl') {
            paddingLeft = value;
        }
        else {
            paddingRight = value;
        }
        return { 'padding': `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}` };
    }
    /**
     * Prepare margin CSS, remove any previous explicitly
     * assigned margin assignments
     * Note: this will not work with calc values (negative calc values are invalid)
     * @param {?} value
     * @return {?}
     */
    _buildGridMargin(value) {
        /** @type {?} */
        let marginTop = '0px';
        /** @type {?} */
        let marginRight = '0px';
        /** @type {?} */
        let marginBottom = '-' + value;
        /** @type {?} */
        let marginLeft = '0px';
        if (this._directionality.value === 'rtl') {
            marginLeft = '-' + value;
        }
        else {
            marginRight = '-' + value;
        }
        return { 'margin': `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}` };
    }
    /**
     * Prepare margin CSS, remove any previous explicitly
     * assigned margin assignments
     * @param {?=} value
     * @return {?}
     */
    _buildCSS(value = null) {
        /** @type {?} */
        let key;
        /** @type {?} */
        let margins = {
            'margin-left': null,
            'margin-right': null,
            'margin-top': null,
            'margin-bottom': null
        };
        switch (this._layout) {
            case 'column':
                key = 'margin-bottom';
                break;
            case 'column-reverse':
                key = 'margin-top';
                break;
            case 'row':
                key = this._directionality.value === 'rtl' ? 'margin-left' : 'margin-right';
                break;
            case 'row-reverse':
                key = this._directionality.value === 'rtl' ? 'margin-right' : 'margin-left';
                break;
            default:
                key = this._directionality.value === 'rtl' ? 'margin-left' : 'margin-right';
                break;
        }
        margins[key] = value;
        return margins;
    }
}
LayoutGapDirective.decorators = [
    { type: Directive, args: [{
                selector: `
  [fxLayoutGap],
  [fxLayoutGap.xs], [fxLayoutGap.sm], [fxLayoutGap.md], [fxLayoutGap.lg], [fxLayoutGap.xl],
  [fxLayoutGap.lt-sm], [fxLayoutGap.lt-md], [fxLayoutGap.lt-lg], [fxLayoutGap.lt-xl],
  [fxLayoutGap.gt-xs], [fxLayoutGap.gt-sm], [fxLayoutGap.gt-md], [fxLayoutGap.gt-lg]
`
            },] },
];
/** @nocollapse */
LayoutGapDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: LayoutDirective, decorators: [{ type: Optional }, { type: Self }] },
    { type: NgZone },
    { type: Directionality },
    { type: StyleUtils }
];
LayoutGapDirective.propDecorators = {
    gap: [{ type: Input, args: ['fxLayoutGap',] }],
    gapXs: [{ type: Input, args: ['fxLayoutGap.xs',] }],
    gapSm: [{ type: Input, args: ['fxLayoutGap.sm',] }],
    gapMd: [{ type: Input, args: ['fxLayoutGap.md',] }],
    gapLg: [{ type: Input, args: ['fxLayoutGap.lg',] }],
    gapXl: [{ type: Input, args: ['fxLayoutGap.xl',] }],
    gapGtXs: [{ type: Input, args: ['fxLayoutGap.gt-xs',] }],
    gapGtSm: [{ type: Input, args: ['fxLayoutGap.gt-sm',] }],
    gapGtMd: [{ type: Input, args: ['fxLayoutGap.gt-md',] }],
    gapGtLg: [{ type: Input, args: ['fxLayoutGap.gt-lg',] }],
    gapLtSm: [{ type: Input, args: ['fxLayoutGap.lt-sm',] }],
    gapLtMd: [{ type: Input, args: ['fxLayoutGap.lt-md',] }],
    gapLtLg: [{ type: Input, args: ['fxLayoutGap.lt-lg',] }],
    gapLtXl: [{ type: Input, args: ['fxLayoutGap.lt-xl',] }]
};
/** @type {?} */
const GRID_SPECIFIER = ' grid';

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
/**
 * Directive to control the size of a flex item using flex-basis, flex-grow, and flex-shrink.
 * Corresponds to the css `flex` shorthand property.
 *
 * @see https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
class FlexDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} _container
     * @param {?} styleUtils
     * @param {?} layoutConfig
     */
    constructor(monitor, elRef, _container, styleUtils, layoutConfig) {
        super(monitor, elRef, styleUtils);
        this._container = _container;
        this.styleUtils = styleUtils;
        this.layoutConfig = layoutConfig;
        this._cacheInput('flex', '');
        this._cacheInput('shrink', 1);
        this._cacheInput('grow', 1);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set shrink(val) { this._cacheInput('shrink', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set grow(val) { this._cacheInput('grow', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flex(val) { this._cacheInput('flex', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexXs(val) { this._cacheInput('flexXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexSm(val) { this._cacheInput('flexSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexMd(val) { this._cacheInput('flexMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexLg(val) { this._cacheInput('flexLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexXl(val) { this._cacheInput('flexXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexGtXs(val) { this._cacheInput('flexGtXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexGtSm(val) { this._cacheInput('flexGtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexGtMd(val) { this._cacheInput('flexGtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexGtLg(val) { this._cacheInput('flexGtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexLtSm(val) { this._cacheInput('flexLtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexLtMd(val) { this._cacheInput('flexLtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexLtLg(val) { this._cacheInput('flexLtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set flexLtXl(val) { this._cacheInput('flexLtXl', val); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes['flex'] != null || this._mqActivation) {
            this._updateStyle();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges('flex', '', (changes) => {
            this._updateStyle(changes.value);
        });
        if (this._container) {
            // If this flex item is inside of a flex container marked with
            // Subscribe to layout immediate parent direction changes
            this._layoutWatcher = this._container.layout$.subscribe((layout) => {
                // `direction` === null if parent container does not have a `fxLayout`
                this._onLayoutChange(layout);
            });
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._layoutWatcher) {
            this._layoutWatcher.unsubscribe();
        }
    }
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     * @param {?=} layout
     * @return {?}
     */
    _onLayoutChange(layout) {
        this._layout = layout || this._layout || { direction: 'row', wrap: false };
        this._updateStyle();
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateStyle(value) {
        /** @type {?} */
        let flexBasis = value || this._queryInput('flex') || '';
        if (this._mqActivation) {
            flexBasis = this._mqActivation.activatedInput;
        }
        /** @type {?} */
        let basis = String(flexBasis).replace(';', '');
        /** @type {?} */
        let parts = validateBasis(basis, this._queryInput('grow'), this._queryInput('shrink'));
        this._applyStyleToElement(this._validateValue.apply(this, parts));
    }
    /**
     * Validate the value to be one of the acceptable value options
     * Use default fallback of 'row'
     * @param {?} grow
     * @param {?} shrink
     * @param {?} basis
     * @return {?}
     */
    _validateValue(grow, shrink, basis) {
        /** @type {?} */
        let addFlexToParent = this.layoutConfig.addFlexToParent !== false;
        /** @type {?} */
        let layout = this._getFlexFlowDirection(this.parentElement, addFlexToParent);
        /** @type {?} */
        let direction = (layout.indexOf('column') > -1) ? 'column' : 'row';
        /** @type {?} */
        let max = isFlowHorizontal(direction) ? 'max-width' : 'max-height';
        /** @type {?} */
        let min = isFlowHorizontal(direction) ? 'min-width' : 'min-height';
        /** @type {?} */
        let hasCalc = String(basis).indexOf('calc') > -1;
        /** @type {?} */
        let usingCalc = hasCalc || (basis == 'auto');
        /** @type {?} */
        let isPercent = String(basis).indexOf('%') > -1 && !hasCalc;
        /** @type {?} */
        let hasUnits = String(basis).indexOf('px') > -1 || String(basis).indexOf('em') > -1 ||
            String(basis).indexOf('vw') > -1 || String(basis).indexOf('vh') > -1;
        /** @type {?} */
        let isPx = String(basis).indexOf('px') > -1 || usingCalc;
        /** @type {?} */
        let isValue = (hasCalc || hasUnits);
        grow = (grow == '0') ? 0 : grow;
        shrink = (shrink == '0') ? 0 : shrink;
        /** @type {?} */
        let isFixed = !grow && !shrink;
        /** @type {?} */
        let css = {};
        /** @type {?} */
        let clearStyles = {
            'max-width': null,
            'max-height': null,
            'min-width': null,
            'min-height': null
        };
        switch (basis || '') {
            case '':
                /** @type {?} */
                const useColumnBasisZero = this.layoutConfig.useColumnBasisZero !== false;
                basis = direction === 'row' ? '0%' : (useColumnBasisZero ? '0.000000001px' : 'auto');
                break;
            case 'initial': // default
            case 'nogrow':
                grow = 0;
                basis = 'auto';
                break;
            case 'grow':
                basis = '100%';
                break;
            case 'noshrink':
                shrink = 0;
                basis = 'auto';
                break;
            case 'auto':
                break;
            case 'none':
                grow = 0;
                shrink = 0;
                basis = 'auto';
                break;
            default:
                // Defaults to percentage sizing unless `px` is explicitly set
                if (!isValue && !isPercent && !isNaN(/** @type {?} */ (basis))) {
                    basis = basis + '%';
                }
                // Fix for issue 280
                if (basis === '0%') {
                    isValue = true;
                }
                if (basis === '0px') {
                    basis = '0%';
                }
                // fix issue #5345
                if (hasCalc) {
                    css = extendObject(clearStyles, {
                        'flex-grow': grow,
                        'flex-shrink': shrink,
                        'flex-basis': isValue ? basis : '100%'
                    });
                }
                else {
                    css = extendObject(clearStyles, {
                        'flex': `${grow} ${shrink} ${isValue ? basis : '100%'}`
                    });
                }
                break;
        }
        if (!(css['flex'] || css['flex-grow'])) {
            if (hasCalc) {
                css = extendObject(clearStyles, {
                    'flex-grow': grow,
                    'flex-shrink': shrink,
                    'flex-basis': basis
                });
            }
            else {
                css = extendObject(clearStyles, {
                    'flex': `${grow} ${shrink} ${basis}`
                });
            }
        }
        // Fix for issues 277, 534, and 728
        if (basis !== '0%' && basis !== '0px' && basis !== '0.000000001px' && basis !== 'auto') {
            css[min] = isFixed || (isPx && grow) ? basis : null;
            css[max] = isFixed || (!usingCalc && shrink) ? basis : null;
        }
        // Fix for issue 528
        if (!css[min] && !css[max]) {
            if (hasCalc) {
                css = extendObject(clearStyles, {
                    'flex-grow': grow,
                    'flex-shrink': shrink,
                    'flex-basis': basis
                });
            }
            else {
                css = extendObject(clearStyles, {
                    'flex': `${grow} ${shrink} ${basis}`
                });
            }
        }
        else {
            // Fix for issue 660
            if (this._layout && this._layout.wrap) {
                css[hasCalc ? 'flex-basis' : 'flex'] = css[max] ?
                    (hasCalc ? css[max] : `${grow} ${shrink} ${css[max]}`) :
                    (hasCalc ? css[min] : `${grow} ${shrink} ${css[min]}`);
            }
        }
        return extendObject(css, { 'box-sizing': 'border-box' });
    }
}
FlexDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [fxFlex],
  [fxFlex.xs], [fxFlex.sm], [fxFlex.md], [fxFlex.lg], [fxFlex.xl],
  [fxFlex.lt-sm], [fxFlex.lt-md], [fxFlex.lt-lg], [fxFlex.lt-xl],
  [fxFlex.gt-xs], [fxFlex.gt-sm], [fxFlex.gt-md], [fxFlex.gt-lg],
`
            },] },
];
/** @nocollapse */
FlexDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: LayoutDirective, decorators: [{ type: Optional }, { type: SkipSelf }] },
    { type: StyleUtils },
    { type: undefined, decorators: [{ type: Inject, args: [LAYOUT_CONFIG,] }] }
];
FlexDirective.propDecorators = {
    shrink: [{ type: Input, args: ['fxShrink',] }],
    grow: [{ type: Input, args: ['fxGrow',] }],
    flex: [{ type: Input, args: ['fxFlex',] }],
    flexXs: [{ type: Input, args: ['fxFlex.xs',] }],
    flexSm: [{ type: Input, args: ['fxFlex.sm',] }],
    flexMd: [{ type: Input, args: ['fxFlex.md',] }],
    flexLg: [{ type: Input, args: ['fxFlex.lg',] }],
    flexXl: [{ type: Input, args: ['fxFlex.xl',] }],
    flexGtXs: [{ type: Input, args: ['fxFlex.gt-xs',] }],
    flexGtSm: [{ type: Input, args: ['fxFlex.gt-sm',] }],
    flexGtMd: [{ type: Input, args: ['fxFlex.gt-md',] }],
    flexGtLg: [{ type: Input, args: ['fxFlex.gt-lg',] }],
    flexLtSm: [{ type: Input, args: ['fxFlex.lt-sm',] }],
    flexLtMd: [{ type: Input, args: ['fxFlex.lt-md',] }],
    flexLtLg: [{ type: Input, args: ['fxFlex.lt-lg',] }],
    flexLtXl: [{ type: Input, args: ['fxFlex.lt-xl',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * 'flex-order' flexbox styling directive
 * Configures the positional ordering of the element in a sorted layout container
 * @see https://css-tricks.com/almanac/properties/o/order/
 */
class FlexOrderDirective extends BaseDirective {
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
    set order(val) { this._cacheInput('order', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set orderXs(val) { this._cacheInput('orderXs', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set orderSm(val) { this._cacheInput('orderSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderMd(val) { this._cacheInput('orderMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderLg(val) { this._cacheInput('orderLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderXl(val) { this._cacheInput('orderXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderGtXs(val) { this._cacheInput('orderGtXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderGtSm(val) { this._cacheInput('orderGtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderGtMd(val) { this._cacheInput('orderGtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderGtLg(val) { this._cacheInput('orderGtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderLtSm(val) { this._cacheInput('orderLtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderLtMd(val) { this._cacheInput('orderLtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderLtLg(val) { this._cacheInput('orderLtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set orderLtXl(val) { this._cacheInput('orderLtXl', val); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes['order'] != null || this._mqActivation) {
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
        this._listenForMediaQueryChanges('order', '0', (changes) => {
            this._updateWithValue(changes.value);
        });
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput('order') || '0';
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?} value
     * @return {?}
     */
    _buildCSS(value) {
        value = parseInt(value, 10);
        return { order: isNaN(value) ? 0 : value };
    }
}
FlexOrderDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [fxFlexOrder],
  [fxFlexOrder.xs], [fxFlexOrder.sm], [fxFlexOrder.md], [fxFlexOrder.lg], [fxFlexOrder.xl],
  [fxFlexOrder.lt-sm], [fxFlexOrder.lt-md], [fxFlexOrder.lt-lg], [fxFlexOrder.lt-xl],
  [fxFlexOrder.gt-xs], [fxFlexOrder.gt-sm], [fxFlexOrder.gt-md], [fxFlexOrder.gt-lg]
` },] },
];
/** @nocollapse */
FlexOrderDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
FlexOrderDirective.propDecorators = {
    order: [{ type: Input, args: ['fxFlexOrder',] }],
    orderXs: [{ type: Input, args: ['fxFlexOrder.xs',] }],
    orderSm: [{ type: Input, args: ['fxFlexOrder.sm',] }],
    orderMd: [{ type: Input, args: ['fxFlexOrder.md',] }],
    orderLg: [{ type: Input, args: ['fxFlexOrder.lg',] }],
    orderXl: [{ type: Input, args: ['fxFlexOrder.xl',] }],
    orderGtXs: [{ type: Input, args: ['fxFlexOrder.gt-xs',] }],
    orderGtSm: [{ type: Input, args: ['fxFlexOrder.gt-sm',] }],
    orderGtMd: [{ type: Input, args: ['fxFlexOrder.gt-md',] }],
    orderGtLg: [{ type: Input, args: ['fxFlexOrder.gt-lg',] }],
    orderLtSm: [{ type: Input, args: ['fxFlexOrder.lt-sm',] }],
    orderLtMd: [{ type: Input, args: ['fxFlexOrder.lt-md',] }],
    orderLtLg: [{ type: Input, args: ['fxFlexOrder.lt-lg',] }],
    orderLtXl: [{ type: Input, args: ['fxFlexOrder.lt-xl',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * 'flex-offset' flexbox styling directive
 * Configures the 'margin-left' of the element in a layout container
 */
class FlexOffsetDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} _container
     * @param {?} _directionality
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, _container, _directionality, styleUtils) {
        super(monitor, elRef, styleUtils);
        this._container = _container;
        this._directionality = _directionality;
        /**
         * The flex-direction of this element's host container. Defaults to 'row'.
         */
        this._layout = { direction: 'row', wrap: false };
        this._directionWatcher =
            this._directionality.change.subscribe(this._updateWithValue.bind(this));
        this.watchParentFlow();
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set offset(val) { this._cacheInput('offset', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetXs(val) { this._cacheInput('offsetXs', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetSm(val) { this._cacheInput('offsetSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetMd(val) { this._cacheInput('offsetMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetLg(val) { this._cacheInput('offsetLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetXl(val) { this._cacheInput('offsetXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetLtSm(val) { this._cacheInput('offsetLtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetLtMd(val) { this._cacheInput('offsetLtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetLtLg(val) { this._cacheInput('offsetLtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetLtXl(val) { this._cacheInput('offsetLtXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetGtXs(val) { this._cacheInput('offsetGtXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetGtSm(val) { this._cacheInput('offsetGtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetGtMd(val) { this._cacheInput('offsetGtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set offsetGtLg(val) { this._cacheInput('offsetGtLg', val); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes['offset'] != null || this._mqActivation) {
            this._updateWithValue();
        }
    }
    /**
     * Cleanup
     * @return {?}
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._layoutWatcher) {
            this._layoutWatcher.unsubscribe();
        }
        if (this._directionWatcher) {
            this._directionWatcher.unsubscribe();
        }
    }
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        this._listenForMediaQueryChanges('offset', 0, (changes) => {
            this._updateWithValue(changes.value);
        });
    }
    /**
     * If parent flow-direction changes, then update the margin property
     * used to offset
     * @return {?}
     */
    watchParentFlow() {
        if (this._container) {
            // Subscribe to layout immediate parent direction changes (if any)
            this._layoutWatcher = this._container.layout$.subscribe((layout) => {
                // `direction` === null if parent container does not have a `fxLayout`
                this._onLayoutChange(layout);
            });
        }
    }
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     * @param {?=} layout
     * @return {?}
     */
    _onLayoutChange(layout) {
        this._layout = layout || this._layout || { direction: 'row', wrap: false };
        this._updateWithValue();
    }
    /**
     * Using the current fxFlexOffset value, update the inline CSS
     * NOTE: this will assign `margin-left` if the parent flex-direction == 'row',
     *       otherwise `margin-top` is used for the offset.
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput('offset') || 0;
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?} offset
     * @return {?}
     */
    _buildCSS(offset) {
        /** @type {?} */
        let isPercent = String(offset).indexOf('%') > -1;
        /** @type {?} */
        let isPx = String(offset).indexOf('px') > -1;
        if (!isPx && !isPercent && !isNaN(offset)) {
            offset = offset + '%';
        }
        /** @type {?} */
        const isRtl = this._directionality.value === 'rtl';
        /** @type {?} */
        const layout = this._getFlexFlowDirection(this.parentElement, true);
        /** @type {?} */
        const horizontalLayoutKey = isRtl ? 'margin-right' : 'margin-left';
        return isFlowHorizontal(layout) ? { [horizontalLayoutKey]: `${offset}` } :
            { 'margin-top': `${offset}` };
    }
}
FlexOffsetDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [fxFlexOffset],
  [fxFlexOffset.xs], [fxFlexOffset.sm], [fxFlexOffset.md], [fxFlexOffset.lg], [fxFlexOffset.xl],
  [fxFlexOffset.lt-sm], [fxFlexOffset.lt-md], [fxFlexOffset.lt-lg], [fxFlexOffset.lt-xl],
  [fxFlexOffset.gt-xs], [fxFlexOffset.gt-sm], [fxFlexOffset.gt-md], [fxFlexOffset.gt-lg]
` },] },
];
/** @nocollapse */
FlexOffsetDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: LayoutDirective, decorators: [{ type: Optional }, { type: SkipSelf }] },
    { type: Directionality },
    { type: StyleUtils }
];
FlexOffsetDirective.propDecorators = {
    offset: [{ type: Input, args: ['fxFlexOffset',] }],
    offsetXs: [{ type: Input, args: ['fxFlexOffset.xs',] }],
    offsetSm: [{ type: Input, args: ['fxFlexOffset.sm',] }],
    offsetMd: [{ type: Input, args: ['fxFlexOffset.md',] }],
    offsetLg: [{ type: Input, args: ['fxFlexOffset.lg',] }],
    offsetXl: [{ type: Input, args: ['fxFlexOffset.xl',] }],
    offsetLtSm: [{ type: Input, args: ['fxFlexOffset.lt-sm',] }],
    offsetLtMd: [{ type: Input, args: ['fxFlexOffset.lt-md',] }],
    offsetLtLg: [{ type: Input, args: ['fxFlexOffset.lt-lg',] }],
    offsetLtXl: [{ type: Input, args: ['fxFlexOffset.lt-xl',] }],
    offsetGtXs: [{ type: Input, args: ['fxFlexOffset.gt-xs',] }],
    offsetGtSm: [{ type: Input, args: ['fxFlexOffset.gt-sm',] }],
    offsetGtMd: [{ type: Input, args: ['fxFlexOffset.gt-md',] }],
    offsetGtLg: [{ type: Input, args: ['fxFlexOffset.gt-lg',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * 'flex-align' flexbox styling directive
 * Allows element-specific overrides for cross-axis alignments in a layout container
 * @see https://css-tricks.com/almanac/properties/a/align-self/
 */
class FlexAlignDirective extends BaseDirective {
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
    set align(val) { this._cacheInput('align', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput('alignXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput('alignSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput('alignMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput('alignLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput('alignXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput('alignLtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput('alignLtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput('alignLtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput('alignLtXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput('alignGtXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput('alignGtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput('alignGtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput('alignGtLg', val); }
    ;
    /**
     * For \@Input changes on the current mq activation property, see onMediaQueryChanges()
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes['align'] != null || this._mqActivation) {
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
        this._listenForMediaQueryChanges('align', 'stretch', (changes) => {
            this._updateWithValue(changes.value);
        });
    }
    /**
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput('align') || 'stretch';
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
    }
    /**
     * @param {?} align
     * @return {?}
     */
    _buildCSS(align) {
        /** @type {?} */
        let css = {};
        // Cross-axis
        switch (align) {
            case 'start':
                css['align-self'] = 'flex-start';
                break;
            case 'end':
                css['align-self'] = 'flex-end';
                break;
            default:
                css['align-self'] = align;
                break;
        }
        return css;
    }
}
FlexAlignDirective.decorators = [
    { type: Directive, args: [{
                selector: `
  [fxFlexAlign],
  [fxFlexAlign.xs], [fxFlexAlign.sm], [fxFlexAlign.md], [fxFlexAlign.lg], [fxFlexAlign.xl],
  [fxFlexAlign.lt-sm], [fxFlexAlign.lt-md], [fxFlexAlign.lt-lg], [fxFlexAlign.lt-xl],
  [fxFlexAlign.gt-xs], [fxFlexAlign.gt-sm], [fxFlexAlign.gt-md], [fxFlexAlign.gt-lg]
`
            },] },
];
/** @nocollapse */
FlexAlignDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];
FlexAlignDirective.propDecorators = {
    align: [{ type: Input, args: ['fxFlexAlign',] }],
    alignXs: [{ type: Input, args: ['fxFlexAlign.xs',] }],
    alignSm: [{ type: Input, args: ['fxFlexAlign.sm',] }],
    alignMd: [{ type: Input, args: ['fxFlexAlign.md',] }],
    alignLg: [{ type: Input, args: ['fxFlexAlign.lg',] }],
    alignXl: [{ type: Input, args: ['fxFlexAlign.xl',] }],
    alignLtSm: [{ type: Input, args: ['fxFlexAlign.lt-sm',] }],
    alignLtMd: [{ type: Input, args: ['fxFlexAlign.lt-md',] }],
    alignLtLg: [{ type: Input, args: ['fxFlexAlign.lt-lg',] }],
    alignLtXl: [{ type: Input, args: ['fxFlexAlign.lt-xl',] }],
    alignGtXs: [{ type: Input, args: ['fxFlexAlign.gt-xs',] }],
    alignGtSm: [{ type: Input, args: ['fxFlexAlign.gt-sm',] }],
    alignGtMd: [{ type: Input, args: ['fxFlexAlign.gt-md',] }],
    alignGtLg: [{ type: Input, args: ['fxFlexAlign.gt-lg',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const FLEX_FILL_CSS = {
    'margin': 0,
    'width': '100%',
    'height': '100%',
    'min-width': '100%',
    'min-height': '100%'
};
/**
 * 'fxFill' flexbox styling directive
 *  Maximizes width and height of element in a layout container
 *
 *  NOTE: fxFill is NOT responsive API!!
 */
class FlexFillDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, styleUtils) {
        super(monitor, elRef, styleUtils);
        this.elRef = elRef;
        this._applyStyleToElement(FLEX_FILL_CSS);
    }
}
FlexFillDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [fxFill],
  [fxFlexFill]
` },] },
];
/** @nocollapse */
FlexFillDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: StyleUtils }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * 'layout-align' flexbox styling directive
 *  Defines positioning of child elements along main and cross axis in a layout container
 *  Optional values: {main-axis} values or {main-axis cross-axis} value pairs
 *
 * @see https://css-tricks.com/almanac/properties/j/justify-content/
 * @see https://css-tricks.com/almanac/properties/a/align-items/
 * @see https://css-tricks.com/almanac/properties/a/align-content/
 */
class LayoutAlignDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} elRef
     * @param {?} container
     * @param {?} styleUtils
     */
    constructor(monitor, elRef, container, styleUtils) {
        super(monitor, elRef, styleUtils);
        this._layout = 'row';
        if (container) { // Subscribe to layout direction changes
            // Subscribe to layout direction changes
            this._layoutWatcher = container.layout$.subscribe(this._onLayoutChange.bind(this));
        }
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set align(val) { this._cacheInput('align', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXs(val) { this._cacheInput('alignXs', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set alignSm(val) { this._cacheInput('alignSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignMd(val) { this._cacheInput('alignMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLg(val) { this._cacheInput('alignLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignXl(val) { this._cacheInput('alignXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtXs(val) { this._cacheInput('alignGtXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtSm(val) { this._cacheInput('alignGtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtMd(val) { this._cacheInput('alignGtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignGtLg(val) { this._cacheInput('alignGtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtSm(val) { this._cacheInput('alignLtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtMd(val) { this._cacheInput('alignLtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtLg(val) { this._cacheInput('alignLtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set alignLtXl(val) { this._cacheInput('alignLtXl', val); }
    ;
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes['align'] != null || this._mqActivation) {
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
        this._listenForMediaQueryChanges('align', 'start stretch', (changes) => {
            this._updateWithValue(changes.value);
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._layoutWatcher) {
            this._layoutWatcher.unsubscribe();
        }
    }
    /**
     *
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._queryInput('align') || 'start stretch';
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._applyStyleToElement(this._buildCSS(value));
        this._allowStretching(value, !this._layout ? 'row' : this._layout);
    }
    /**
     * Cache the parent container 'flex-direction' and update the 'flex' styles
     * @param {?} layout
     * @return {?}
     */
    _onLayoutChange(layout) {
        this._layout = (layout.direction || '').toLowerCase();
        if (!LAYOUT_VALUES.find(x => x === this._layout)) {
            this._layout = 'row';
        }
        /** @type {?} */
        let value = this._queryInput('align') || 'start stretch';
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        this._allowStretching(value, this._layout || 'row');
    }
    /**
     * @param {?} align
     * @return {?}
     */
    _buildCSS(align) {
        /** @type {?} */
        let css = {};
        let [main_axis, cross_axis] = align.split(' '); // tslint:disable-line:variable-name
        // Main axis
        switch (main_axis) {
            case 'center':
                css['justify-content'] = 'center';
                break;
            case 'space-around':
                css['justify-content'] = 'space-around';
                break;
            case 'space-between':
                css['justify-content'] = 'space-between';
                break;
            case 'space-evenly':
                css['justify-content'] = 'space-evenly';
                break;
            case 'end':
            case 'flex-end':
                css['justify-content'] = 'flex-end';
                break;
            case 'start':
            case 'flex-start':
            default:
                css['justify-content'] = 'flex-start'; // default main axis
                break;
        }
        // Cross-axis
        switch (cross_axis) {
            case 'start':
            case 'flex-start':
                css['align-items'] = css['align-content'] = 'flex-start';
                break;
            case 'baseline':
                css['align-items'] = 'baseline';
                break;
            case 'center':
                css['align-items'] = css['align-content'] = 'center';
                break;
            case 'end':
            case 'flex-end':
                css['align-items'] = css['align-content'] = 'flex-end';
                break;
            case 'stretch':
            default: // 'stretch'
                // 'stretch'
                css['align-items'] = css['align-content'] = 'stretch'; // default cross axis
                break;
        }
        return extendObject(css, {
            'display': 'flex',
            'flex-direction': this._layout || 'row',
            'box-sizing': 'border-box'
        });
    }
    /**
     * Update container element to 'stretch' as needed...
     * NOTE: this is only done if the crossAxis is explicitly set to 'stretch'
     * @param {?} align
     * @param {?} layout
     * @return {?}
     */
    _allowStretching(align, layout) {
        let [, cross_axis] = align.split(' '); // tslint:disable-line:variable-name
        if (cross_axis == 'stretch') {
            // Use `null` values to remove style
            this._applyStyleToElement({
                'box-sizing': 'border-box',
                'max-width': !isFlowHorizontal(layout) ? '100%' : null,
                'max-height': isFlowHorizontal(layout) ? '100%' : null
            });
        }
    }
}
LayoutAlignDirective.decorators = [
    { type: Directive, args: [{ selector: `
  [fxLayoutAlign],
  [fxLayoutAlign.xs], [fxLayoutAlign.sm], [fxLayoutAlign.md], [fxLayoutAlign.lg],[fxLayoutAlign.xl],
  [fxLayoutAlign.lt-sm], [fxLayoutAlign.lt-md], [fxLayoutAlign.lt-lg], [fxLayoutAlign.lt-xl],
  [fxLayoutAlign.gt-xs], [fxLayoutAlign.gt-sm], [fxLayoutAlign.gt-md], [fxLayoutAlign.gt-lg]
` },] },
];
/** @nocollapse */
LayoutAlignDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: ElementRef },
    { type: LayoutDirective, decorators: [{ type: Optional }, { type: Self }] },
    { type: StyleUtils }
];
LayoutAlignDirective.propDecorators = {
    align: [{ type: Input, args: ['fxLayoutAlign',] }],
    alignXs: [{ type: Input, args: ['fxLayoutAlign.xs',] }],
    alignSm: [{ type: Input, args: ['fxLayoutAlign.sm',] }],
    alignMd: [{ type: Input, args: ['fxLayoutAlign.md',] }],
    alignLg: [{ type: Input, args: ['fxLayoutAlign.lg',] }],
    alignXl: [{ type: Input, args: ['fxLayoutAlign.xl',] }],
    alignGtXs: [{ type: Input, args: ['fxLayoutAlign.gt-xs',] }],
    alignGtSm: [{ type: Input, args: ['fxLayoutAlign.gt-sm',] }],
    alignGtMd: [{ type: Input, args: ['fxLayoutAlign.gt-md',] }],
    alignGtLg: [{ type: Input, args: ['fxLayoutAlign.gt-lg',] }],
    alignLtSm: [{ type: Input, args: ['fxLayoutAlign.lt-sm',] }],
    alignLtMd: [{ type: Input, args: ['fxLayoutAlign.lt-md',] }],
    alignLtLg: [{ type: Input, args: ['fxLayoutAlign.lt-lg',] }],
    alignLtXl: [{ type: Input, args: ['fxLayoutAlign.lt-xl',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const ALL_DIRECTIVES = [
    LayoutDirective,
    LayoutGapDirective,
    LayoutAlignDirective,
    FlexDirective,
    FlexOrderDirective,
    FlexOffsetDirective,
    FlexFillDirective,
    FlexAlignDirective,
];
/**
 * *****************************************************************
 * Define module for the Flex API
 * *****************************************************************
 */
class FlexModule {
}
FlexModule.decorators = [
    { type: NgModule, args: [{
                imports: [CoreModule, BidiModule],
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

export { FlexModule, FlexDirective, FlexAlignDirective, FlexFillDirective, FlexOffsetDirective, FlexOrderDirective, LayoutDirective, LayoutAlignDirective, LayoutGapDirective };
//# sourceMappingURL=flex.js.map
