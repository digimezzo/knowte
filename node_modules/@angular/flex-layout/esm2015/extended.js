/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, Input, Inject, Optional, PLATFORM_ID, IterableDiffers, KeyValueDiffers, Renderer2, Self, SecurityContext, NgModule } from '@angular/core';
import { isPlatformServer, NgClass, NgStyle } from '@angular/common';
import { BaseDirective, MediaMonitor, SERVER_TOKEN, StyleUtils, BaseDirectiveAdapter, CoreModule } from '@angular/flex-layout/core';
import { LayoutDirective } from '@angular/flex-layout/flex';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * This directive provides a responsive API for the HTML <img> 'src' attribute
 * and will update the img.src property upon each responsive activation.
 *
 * e.g.
 *      <img src="defaultScene.jpg" src.xs="mobileScene.jpg"></img>
 *
 * @see https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-src/
 */
class ImgSrcDirective extends BaseDirective {
    /**
     * @param {?} _elRef
     * @param {?} _monitor
     * @param {?} _styler
     * @param {?} _platformId
     * @param {?} _serverModuleLoaded
     */
    constructor(_elRef, _monitor, _styler, _platformId, _serverModuleLoaded) {
        super(_monitor, _elRef, _styler);
        this._elRef = _elRef;
        this._monitor = _monitor;
        this._styler = _styler;
        this._platformId = _platformId;
        this._serverModuleLoaded = _serverModuleLoaded;
        this._cacheInput('src', _elRef.nativeElement.getAttribute('src') || '');
        if (isPlatformServer(this._platformId) && this._serverModuleLoaded) {
            this.nativeElement.setAttribute('src', '');
        }
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcBase(val) { this.cacheDefaultSrc(val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcXs(val) { this._cacheInput('srcXs', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcSm(val) { this._cacheInput('srcSm', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcMd(val) { this._cacheInput('srcMd', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcLg(val) { this._cacheInput('srcLg', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcXl(val) { this._cacheInput('srcXl', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcLtSm(val) { this._cacheInput('srcLtSm', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcLtMd(val) { this._cacheInput('srcLtMd', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcLtLg(val) { this._cacheInput('srcLtLg', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcLtXl(val) { this._cacheInput('srcLtXl', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcGtXs(val) { this._cacheInput('srcGtXs', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcGtSm(val) { this._cacheInput('srcGtSm', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcGtMd(val) { this._cacheInput('srcGtMd', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set srcGtLg(val) { this._cacheInput('srcGtLg', val); }
    /**
     * Listen for responsive changes to update the img.src attribute
     * @return {?}
     */
    ngOnInit() {
        super.ngOnInit();
        if (this.hasResponsiveKeys) {
            // Listen for responsive changes
            this._listenForMediaQueryChanges('src', this.defaultSrc, () => {
                this._updateSrcFor();
            });
        }
        this._updateSrcFor();
    }
    /**
     * Update the 'src' property of the host <img> element
     * @return {?}
     */
    ngOnChanges() {
        if (this.hasInitialized) {
            this._updateSrcFor();
        }
    }
    /**
     * Use the [responsively] activated input value to update
     * the host img src attribute or assign a default `img.src=''`
     * if the src has not been defined.
     *
     * Do nothing to standard `<img src="">` usages, only when responsive
     * keys are present do we actually call `setAttribute()`
     * @return {?}
     */
    _updateSrcFor() {
        if (this.hasResponsiveKeys) {
            /** @type {?} */
            let url = this.activatedValue || this.defaultSrc;
            if (isPlatformServer(this._platformId) && this._serverModuleLoaded) {
                this._styler.applyStyleToElement(this.nativeElement, { 'content': url ? `url(${url})` : '' });
            }
            else {
                this.nativeElement.setAttribute('src', String(url));
            }
        }
    }
    /**
     * Cache initial value of 'src', this will be used as fallback when breakpoint
     * activations change.
     * NOTE: The default 'src' property is not bound using \@Input(), so perform
     * a post-ngOnInit() lookup of the default src value (if any).
     * @param {?=} value
     * @return {?}
     */
    cacheDefaultSrc(value) {
        this._cacheInput('src', value || '');
    }
    /**
     * Empty values are maintained, undefined values are exposed as ''
     * @return {?}
     */
    get defaultSrc() {
        return this._queryInput('src') || '';
    }
    /**
     * Does the <img> have 1 or more src.<xxx> responsive inputs
     * defined... these will be mapped to activated breakpoints.
     * @return {?}
     */
    get hasResponsiveKeys() {
        return Object.keys(this._inputMap).length > 1;
    }
}
ImgSrcDirective.decorators = [
    { type: Directive, args: [{
                selector: `
  img[src.xs],    img[src.sm],    img[src.md],    img[src.lg],   img[src.xl],
  img[src.lt-sm], img[src.lt-md], img[src.lt-lg], img[src.lt-xl],
  img[src.gt-xs], img[src.gt-sm], img[src.gt-md], img[src.gt-lg]
`
            },] },
];
/** @nocollapse */
ImgSrcDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: MediaMonitor },
    { type: StyleUtils },
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: Boolean, decorators: [{ type: Optional }, { type: Inject, args: [SERVER_TOKEN,] }] }
];
ImgSrcDirective.propDecorators = {
    srcBase: [{ type: Input, args: ['src',] }],
    srcXs: [{ type: Input, args: ['src.xs',] }],
    srcSm: [{ type: Input, args: ['src.sm',] }],
    srcMd: [{ type: Input, args: ['src.md',] }],
    srcLg: [{ type: Input, args: ['src.lg',] }],
    srcXl: [{ type: Input, args: ['src.xl',] }],
    srcLtSm: [{ type: Input, args: ['src.lt-sm',] }],
    srcLtMd: [{ type: Input, args: ['src.lt-md',] }],
    srcLtLg: [{ type: Input, args: ['src.lt-lg',] }],
    srcLtXl: [{ type: Input, args: ['src.lt-xl',] }],
    srcGtXs: [{ type: Input, args: ['src.gt-xs',] }],
    srcGtSm: [{ type: Input, args: ['src.gt-sm',] }],
    srcGtMd: [{ type: Input, args: ['src.gt-md',] }],
    srcGtLg: [{ type: Input, args: ['src.gt-lg',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Directive to add responsive support for ngClass.
 * This maintains the core functionality of 'ngClass' and adds responsive API
 * Note: this class is a no-op when rendered on the server
 */
class ClassDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} _iterableDiffers
     * @param {?} _keyValueDiffers
     * @param {?} _ngEl
     * @param {?} _renderer
     * @param {?} _ngClassInstance
     * @param {?} _styler
     */
    constructor(monitor, _iterableDiffers, _keyValueDiffers, _ngEl, _renderer, _ngClassInstance, _styler) {
        super(monitor, _ngEl, _styler);
        this.monitor = monitor;
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._ngClassInstance = _ngClassInstance;
        this._styler = _styler;
        this._base = new BaseDirectiveAdapter('ngClass', this.monitor, this._ngEl, this._styler);
        if (!this._ngClassInstance) {
            // Create an instance NgClass Directive instance only if `ngClass=""` has NOT been defined on
            // the same host element; since the responsive variations may be defined...
            this._ngClassInstance = new NgClass(this._iterableDiffers, this._keyValueDiffers, this._ngEl, this._renderer);
        }
    }
    /**
     * Intercept ngClass assignments so we cache the default classes
     * which are merged with activated styles or used as fallbacks.
     * Note: Base ngClass values are applied during ngDoCheck()
     * @param {?} val
     * @return {?}
     */
    set ngClassBase(val) {
        /** @type {?} */
        const key = 'ngClass';
        this._base.cacheInput(key, val, true);
        this._ngClassInstance.ngClass = this._base.queryInput(key);
    }
    /**
     * Capture class assignments so we cache the default classes
     * which are merged with activated styles and used as fallbacks.
     * @param {?} val
     * @return {?}
     */
    set klazz(val) {
        /** @type {?} */
        const key = 'class';
        this._base.cacheInput(key, val);
        this._ngClassInstance.klass = val;
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassXs(val) { this._base.cacheInput('ngClassXs', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassSm(val) { this._base.cacheInput('ngClassSm', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassMd(val) { this._base.cacheInput('ngClassMd', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassLg(val) { this._base.cacheInput('ngClassLg', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassXl(val) { this._base.cacheInput('ngClassXl', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassLtSm(val) { this._base.cacheInput('ngClassLtSm', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassLtMd(val) { this._base.cacheInput('ngClassLtMd', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassLtLg(val) { this._base.cacheInput('ngClassLtLg', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassLtXl(val) { this._base.cacheInput('ngClassLtXl', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassGtXs(val) { this._base.cacheInput('ngClassGtXs', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassGtSm(val) { this._base.cacheInput('ngClassGtSm', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassGtMd(val) { this._base.cacheInput('ngClassGtMd', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngClassGtLg(val) { this._base.cacheInput('ngClassGtLg', val, true); }
    /**
     * For \@Input changes on the current mq activation property
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (this._base.activeKey in changes) {
            this._ngClassInstance.ngClass = this._base.mqActivation.activatedInput || '';
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._configureMQListener();
    }
    /**
     * For ChangeDetectionStrategy.onPush and ngOnChanges() updates
     * @return {?}
     */
    ngDoCheck() {
        this._ngClassInstance.ngDoCheck();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._base.ngOnDestroy();
    }
    /**
     * Build an mqActivation object that bridges mql change events to onMediaQueryChange handlers
     * NOTE: We delegate subsequent activity to the NgClass logic
     *       Identify the activated input value and update the ngClass iterables...
     *       Use ngDoCheck() to actually apply the values to the element
     * @param {?=} baseKey
     * @return {?}
     */
    _configureMQListener(baseKey = 'ngClass') {
        /** @type {?} */
        const fallbackValue = this._base.queryInput(baseKey);
        this._base.listenForMediaQueryChanges(baseKey, fallbackValue, (changes) => {
            this._ngClassInstance.ngClass = changes.value || '';
            this._ngClassInstance.ngDoCheck();
        });
    }
}
ClassDirective.decorators = [
    { type: Directive, args: [{
                selector: `
    [ngClass.xs], [ngClass.sm], [ngClass.md], [ngClass.lg], [ngClass.xl],
    [ngClass.lt-sm], [ngClass.lt-md], [ngClass.lt-lg], [ngClass.lt-xl],
    [ngClass.gt-xs], [ngClass.gt-sm], [ngClass.gt-md], [ngClass.gt-lg]
  `
            },] },
];
/** @nocollapse */
ClassDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: IterableDiffers },
    { type: KeyValueDiffers },
    { type: ElementRef },
    { type: Renderer2 },
    { type: NgClass, decorators: [{ type: Optional }, { type: Self }] },
    { type: StyleUtils }
];
ClassDirective.propDecorators = {
    ngClassBase: [{ type: Input, args: ['ngClass',] }],
    klazz: [{ type: Input, args: ['class',] }],
    ngClassXs: [{ type: Input, args: ['ngClass.xs',] }],
    ngClassSm: [{ type: Input, args: ['ngClass.sm',] }],
    ngClassMd: [{ type: Input, args: ['ngClass.md',] }],
    ngClassLg: [{ type: Input, args: ['ngClass.lg',] }],
    ngClassXl: [{ type: Input, args: ['ngClass.xl',] }],
    ngClassLtSm: [{ type: Input, args: ['ngClass.lt-sm',] }],
    ngClassLtMd: [{ type: Input, args: ['ngClass.lt-md',] }],
    ngClassLtLg: [{ type: Input, args: ['ngClass.lt-lg',] }],
    ngClassLtXl: [{ type: Input, args: ['ngClass.lt-xl',] }],
    ngClassGtXs: [{ type: Input, args: ['ngClass.gt-xs',] }],
    ngClassGtSm: [{ type: Input, args: ['ngClass.gt-sm',] }],
    ngClassGtMd: [{ type: Input, args: ['ngClass.gt-md',] }],
    ngClassGtLg: [{ type: Input, args: ['ngClass.gt-lg',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const FALSY = ['false', false, 0];
/**
 * For fxHide selectors, we invert the 'value'
 * and assign to the equivalent fxShow selector cache
 *  - When 'hide' === '' === true, do NOT show the element
 *  - When 'hide' === false or 0... we WILL show the element
 * @param {?} hide
 * @return {?}
 */
function negativeOf(hide) {
    return (hide === '') ? false :
        ((hide === 'false') || (hide === 0)) ? true : !hide;
}
/**
 * 'show' Layout API directive
 *
 */
class ShowHideDirective extends BaseDirective {
    /**
     * @param {?} monitor
     * @param {?} layout
     * @param {?} elRef
     * @param {?} styleUtils
     * @param {?} platformId
     * @param {?} serverModuleLoaded
     */
    constructor(monitor, layout, elRef, styleUtils, platformId, serverModuleLoaded) {
        super(monitor, elRef, styleUtils);
        this.layout = layout;
        this.elRef = elRef;
        this.styleUtils = styleUtils;
        this.platformId = platformId;
        this.serverModuleLoaded = serverModuleLoaded;
        /**
         * Original dom Elements CSS display style
         */
        this._display = '';
        if (layout) {
            /**
                   * The Layout can set the display:flex (and incorrectly affect the Hide/Show directives.
                   * Whenever Layout [on the same element] resets its CSS, then update the Hide/Show CSS
                   */
            this._layoutWatcher = layout.layout$.subscribe(() => this._updateWithValue());
        }
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set show(val) { this._cacheInput('show', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set showXs(val) { this._cacheInput('showXs', val); }
    /**
     * @param {?} val
     * @return {?}
     */
    set showSm(val) { this._cacheInput('showSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showMd(val) { this._cacheInput('showMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showLg(val) { this._cacheInput('showLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showXl(val) { this._cacheInput('showXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showLtSm(val) { this._cacheInput('showLtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showLtMd(val) { this._cacheInput('showLtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showLtLg(val) { this._cacheInput('showLtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showLtXl(val) { this._cacheInput('showLtXl', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showGtXs(val) { this._cacheInput('showGtXs', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showGtSm(val) { this._cacheInput('showGtSm', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showGtMd(val) { this._cacheInput('showGtMd', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set showGtLg(val) { this._cacheInput('showGtLg', val); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hide(val) { this._cacheInput('show', negativeOf(val)); }
    /**
     * @param {?} val
     * @return {?}
     */
    set hideXs(val) { this._cacheInput('showXs', negativeOf(val)); }
    /**
     * @param {?} val
     * @return {?}
     */
    set hideSm(val) { this._cacheInput('showSm', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideMd(val) { this._cacheInput('showMd', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideLg(val) { this._cacheInput('showLg', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideXl(val) { this._cacheInput('showXl', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideLtSm(val) { this._cacheInput('showLtSm', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideLtMd(val) { this._cacheInput('showLtMd', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideLtLg(val) { this._cacheInput('showLtLg', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideLtXl(val) { this._cacheInput('showLtXl', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideGtXs(val) { this._cacheInput('showGtXs', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideGtSm(val) { this._cacheInput('showGtSm', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideGtMd(val) { this._cacheInput('showGtMd', negativeOf(val)); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set hideGtLg(val) { this._cacheInput('showGtLg', negativeOf(val)); }
    ;
    /**
     * Override accessor to the current HTMLElement's `display` style
     * Note: Show/Hide will not change the display to 'flex' but will set it to 'block'
     * unless it was already explicitly specified inline or in a CSS stylesheet.
     * @return {?}
     */
    _getDisplayStyle() {
        return this.layout ? 'flex' : super._getDisplayStyle();
    }
    /**
     * On changes to any \@Input properties...
     * Default to use the non-responsive Input value ('fxShow')
     * Then conditionally override with the mq-activated Input's current value
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (this.hasInitialized && (changes['show'] != null || this._mqActivation)) {
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
        this._display = this._getDisplayStyle();
        /** @type {?} */
        let value = this._getDefaultVal('show', true);
        // Build _mqActivation controller
        this._listenForMediaQueryChanges('show', value, (changes) => {
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
    }
    /**
     * Validate the visibility value and then update the host's inline display style
     * @param {?=} value
     * @return {?}
     */
    _updateWithValue(value) {
        value = value || this._getDefaultVal('show', true);
        if (this._mqActivation) {
            value = this._mqActivation.activatedInput;
        }
        /** @type {?} */
        let shouldShow = this._validateTruthy(value);
        this._applyStyleToElement(this._buildCSS(shouldShow));
        if (isPlatformServer(this.platformId) && this.serverModuleLoaded) {
            this.nativeElement.style.setProperty('display', '');
        }
    }
    /**
     * Build the CSS that should be assigned to the element instance
     * @param {?} show
     * @return {?}
     */
    _buildCSS(show) {
        return { 'display': show ? this._display : 'none' };
    }
    /**
     * Validate the to be not FALSY
     * @param {?=} show
     * @return {?}
     */
    _validateTruthy(show = '') {
        return (FALSY.indexOf(show) === -1);
    }
}
ShowHideDirective.decorators = [
    { type: Directive, args: [{
                selector: `
  [fxShow],
  [fxShow.xs], [fxShow.sm], [fxShow.md], [fxShow.lg], [fxShow.xl],
  [fxShow.lt-sm], [fxShow.lt-md], [fxShow.lt-lg], [fxShow.lt-xl],
  [fxShow.gt-xs], [fxShow.gt-sm], [fxShow.gt-md], [fxShow.gt-lg],
  [fxHide],
  [fxHide.xs], [fxHide.sm], [fxHide.md], [fxHide.lg], [fxHide.xl],
  [fxHide.lt-sm], [fxHide.lt-md], [fxHide.lt-lg], [fxHide.lt-xl],
  [fxHide.gt-xs], [fxHide.gt-sm], [fxHide.gt-md], [fxHide.gt-lg]
`
            },] },
];
/** @nocollapse */
ShowHideDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: LayoutDirective, decorators: [{ type: Optional }, { type: Self }] },
    { type: ElementRef },
    { type: StyleUtils },
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] },
    { type: Boolean, decorators: [{ type: Optional }, { type: Inject, args: [SERVER_TOKEN,] }] }
];
ShowHideDirective.propDecorators = {
    show: [{ type: Input, args: ['fxShow',] }],
    showXs: [{ type: Input, args: ['fxShow.xs',] }],
    showSm: [{ type: Input, args: ['fxShow.sm',] }],
    showMd: [{ type: Input, args: ['fxShow.md',] }],
    showLg: [{ type: Input, args: ['fxShow.lg',] }],
    showXl: [{ type: Input, args: ['fxShow.xl',] }],
    showLtSm: [{ type: Input, args: ['fxShow.lt-sm',] }],
    showLtMd: [{ type: Input, args: ['fxShow.lt-md',] }],
    showLtLg: [{ type: Input, args: ['fxShow.lt-lg',] }],
    showLtXl: [{ type: Input, args: ['fxShow.lt-xl',] }],
    showGtXs: [{ type: Input, args: ['fxShow.gt-xs',] }],
    showGtSm: [{ type: Input, args: ['fxShow.gt-sm',] }],
    showGtMd: [{ type: Input, args: ['fxShow.gt-md',] }],
    showGtLg: [{ type: Input, args: ['fxShow.gt-lg',] }],
    hide: [{ type: Input, args: ['fxHide',] }],
    hideXs: [{ type: Input, args: ['fxHide.xs',] }],
    hideSm: [{ type: Input, args: ['fxHide.sm',] }],
    hideMd: [{ type: Input, args: ['fxHide.md',] }],
    hideLg: [{ type: Input, args: ['fxHide.lg',] }],
    hideXl: [{ type: Input, args: ['fxHide.xl',] }],
    hideLtSm: [{ type: Input, args: ['fxHide.lt-sm',] }],
    hideLtMd: [{ type: Input, args: ['fxHide.lt-md',] }],
    hideLtLg: [{ type: Input, args: ['fxHide.lt-lg',] }],
    hideLtXl: [{ type: Input, args: ['fxHide.lt-xl',] }],
    hideGtXs: [{ type: Input, args: ['fxHide.gt-xs',] }],
    hideGtSm: [{ type: Input, args: ['fxHide.gt-sm',] }],
    hideGtMd: [{ type: Input, args: ['fxHide.gt-md',] }],
    hideGtLg: [{ type: Input, args: ['fxHide.gt-lg',] }]
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
/**
 * NgStyle allowed inputs
 */
class NgStyleKeyValue {
    /**
     * @param {?} key
     * @param {?} value
     * @param {?=} noQuotes
     */
    constructor(key, value, noQuotes = true) {
        this.key = key;
        this.value = value;
        this.key = noQuotes ? key.replace(/['"]/g, '').trim() : key.trim();
        this.value = noQuotes ? value.replace(/['"]/g, '').trim() : value.trim();
        this.value = this.value.replace(/;/, '');
    }
}
/**
 * @param {?} target
 * @return {?}
 */
function getType(target) {
    /** @type {?} */
    let what = typeof target;
    if (what === 'object') {
        return (target.constructor === Array) ? 'array' :
            (target.constructor === Set) ? 'set' : 'object';
    }
    return what;
}
/**
 * Split string of key:value pairs into Array of k-v pairs
 * e.g.  'key:value; key:value; key:value;' -> ['key:value',...]
 * @param {?} source
 * @param {?=} delimiter
 * @return {?}
 */
function buildRawList(source, delimiter = ';') {
    return String(source)
        .trim()
        .split(delimiter)
        .map((val) => val.trim())
        .filter(val => val !== '');
}
/**
 * Convert array of key:value strings to a iterable map object
 * @param {?} styles
 * @param {?=} sanitize
 * @return {?}
 */
function buildMapFromList(styles, sanitize) {
    /** @type {?} */
    const sanitizeValue = (it) => {
        if (sanitize) {
            it.value = sanitize(it.value);
        }
        return it;
    };
    return styles
        .map(stringToKeyValue)
        .filter(entry => !!entry)
        .map(sanitizeValue)
        .reduce(keyValuesToMap, /** @type {?} */ ({}));
}
/**
 * Convert Set<string> or raw Object to an iterable NgStyleMap
 * @param {?} source
 * @param {?=} sanitize
 * @return {?}
 */
function buildMapFromSet(source, sanitize) {
    /** @type {?} */
    let list = [];
    if (getType(source) === 'set') {
        (/** @type {?} */ (source)).forEach(entry => list.push(entry));
    }
    else {
        Object.keys(source).forEach((key) => {
            list.push(`${key}:${((/** @type {?} */ (source)))[key]}`);
        });
    }
    return buildMapFromList(list, sanitize);
}
/**
 * Convert 'key:value' -> [key, value]
 * @param {?} it
 * @return {?}
 */
function stringToKeyValue(it) {
    let [key, val] = it.split(':');
    return new NgStyleKeyValue(key, val);
}
/**
 * Convert [ [key,value] ] -> { key : value }
 * @param {?} map
 * @param {?} entry
 * @return {?}
 */
function keyValuesToMap(map, entry) {
    if (!!entry.key) {
        map[entry.key] = entry.value;
    }
    return map;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Directive to add responsive support for ngStyle.
 *
 */
class StyleDirective extends BaseDirective {
    /**
     *  Constructor for the ngStyle subclass; which adds selectors and
     *  a MediaQuery Activation Adapter
     * @param {?} monitor
     * @param {?} _sanitizer
     * @param {?} _ngEl
     * @param {?} _renderer
     * @param {?} _differs
     * @param {?} _ngStyleInstance
     * @param {?} _styler
     */
    constructor(monitor, _sanitizer, _ngEl, _renderer, _differs, _ngStyleInstance, _styler) {
        super(monitor, _ngEl, _styler);
        this.monitor = monitor;
        this._sanitizer = _sanitizer;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._differs = _differs;
        this._ngStyleInstance = _ngStyleInstance;
        this._styler = _styler;
        this._base = new BaseDirectiveAdapter('ngStyle', this.monitor, this._ngEl, this._styler);
        if (!this._ngStyleInstance) {
            // Create an instance NgClass Directive instance only if `ngClass=""` has NOT been
            // defined on the same host element; since the responsive variations may be defined...
            this._ngStyleInstance = new NgStyle(this._differs, this._ngEl, this._renderer);
        }
        this._buildCacheInterceptor();
        this._fallbackToStyle();
    }
    /**
     * Intercept ngStyle assignments so we cache the default styles
     * which are merged with activated styles or used as fallbacks.
     * @param {?} val
     * @return {?}
     */
    set ngStyleBase(val) {
        /** @type {?} */
        const key = 'ngStyle';
        this._base.cacheInput(key, val, true); // convert val to hashmap
        this._ngStyleInstance.ngStyle = this._base.queryInput(key);
    }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleXs(val) { this._base.cacheInput('ngStyleXs', val, true); }
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleSm(val) { this._base.cacheInput('ngStyleSm', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleMd(val) { this._base.cacheInput('ngStyleMd', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleLg(val) { this._base.cacheInput('ngStyleLg', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleXl(val) { this._base.cacheInput('ngStyleXl', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleLtSm(val) { this._base.cacheInput('ngStyleLtSm', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleLtMd(val) { this._base.cacheInput('ngStyleLtMd', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleLtLg(val) { this._base.cacheInput('ngStyleLtLg', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleLtXl(val) { this._base.cacheInput('ngStyleLtXl', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleGtXs(val) { this._base.cacheInput('ngStyleGtXs', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleGtSm(val) { this._base.cacheInput('ngStyleGtSm', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleGtMd(val) { this._base.cacheInput('ngStyleGtMd', val, true); }
    ;
    /**
     * @param {?} val
     * @return {?}
     */
    set ngStyleGtLg(val) { this._base.cacheInput('ngStyleGtLg', val, true); }
    ;
    /**
     * For \@Input changes on the current mq activation property
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (this._base.activeKey in changes) {
            this._ngStyleInstance.ngStyle = this._base.mqActivation.activatedInput || '';
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._configureMQListener();
    }
    /**
     * For ChangeDetectionStrategy.onPush and ngOnChanges() updates
     * @return {?}
     */
    ngDoCheck() {
        this._ngStyleInstance.ngDoCheck();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._base.ngOnDestroy();
    }
    /**
     * Build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     * @param {?=} baseKey
     * @return {?}
     */
    _configureMQListener(baseKey = 'ngStyle') {
        /** @type {?} */
        const fallbackValue = this._base.queryInput(baseKey);
        this._base.listenForMediaQueryChanges(baseKey, fallbackValue, (changes) => {
            this._ngStyleInstance.ngStyle = changes.value || '';
            this._ngStyleInstance.ngDoCheck();
        });
    }
    /**
     * Build intercept to convert raw strings to ngStyleMap
     * @return {?}
     */
    _buildCacheInterceptor() {
        /** @type {?} */
        let cacheInput = this._base.cacheInput.bind(this._base);
        this._base.cacheInput = (key, source, cacheRaw = false, merge = true) => {
            /** @type {?} */
            let styles = this._buildStyleMap(source);
            if (merge) {
                styles = extendObject({}, this._base.inputMap['ngStyle'], styles);
            }
            cacheInput(key, styles, cacheRaw);
        };
    }
    /**
     * Convert raw strings to ngStyleMap; which is required by ngStyle
     * NOTE: Raw string key-value pairs MUST be delimited by `;`
     *       Comma-delimiters are not supported due to complexities of
     *       possible style values such as `rgba(x,x,x,x)` and others
     * @param {?} styles
     * @return {?}
     */
    _buildStyleMap(styles) {
        /** @type {?} */
        let sanitizer = (val) => {
            // Always safe-guard (aka sanitize) style property values
            return this._sanitizer.sanitize(SecurityContext.STYLE, val) || '';
        };
        if (styles) {
            switch (getType(styles)) {
                case 'string': return buildMapFromList$1(buildRawList(styles), sanitizer);
                case 'array': return buildMapFromList$1(/** @type {?} */ (styles), sanitizer);
                case 'set': return buildMapFromSet(styles, sanitizer);
                default: return buildMapFromSet(styles, sanitizer);
            }
        }
        return styles;
    }
    /**
     * Initial lookup of raw 'class' value (if any)
     * @return {?}
     */
    _fallbackToStyle() {
        if (!this._base.queryInput('ngStyle')) {
            this.ngStyleBase = this._getAttributeValue('style') || '';
        }
    }
}
StyleDirective.decorators = [
    { type: Directive, args: [{
                selector: `
    [ngStyle.xs], [ngStyle.sm], [ngStyle.md], [ngStyle.lg], [ngStyle.xl],
    [ngStyle.lt-sm], [ngStyle.lt-md], [ngStyle.lt-lg], [ngStyle.lt-xl],
    [ngStyle.gt-xs], [ngStyle.gt-sm], [ngStyle.gt-md], [ngStyle.gt-lg]
  `
            },] },
];
/** @nocollapse */
StyleDirective.ctorParameters = () => [
    { type: MediaMonitor },
    { type: DomSanitizer },
    { type: ElementRef },
    { type: Renderer2 },
    { type: KeyValueDiffers },
    { type: NgStyle, decorators: [{ type: Optional }, { type: Self }] },
    { type: StyleUtils }
];
StyleDirective.propDecorators = {
    ngStyleBase: [{ type: Input, args: ['ngStyle',] }],
    ngStyleXs: [{ type: Input, args: ['ngStyle.xs',] }],
    ngStyleSm: [{ type: Input, args: ['ngStyle.sm',] }],
    ngStyleMd: [{ type: Input, args: ['ngStyle.md',] }],
    ngStyleLg: [{ type: Input, args: ['ngStyle.lg',] }],
    ngStyleXl: [{ type: Input, args: ['ngStyle.xl',] }],
    ngStyleLtSm: [{ type: Input, args: ['ngStyle.lt-sm',] }],
    ngStyleLtMd: [{ type: Input, args: ['ngStyle.lt-md',] }],
    ngStyleLtLg: [{ type: Input, args: ['ngStyle.lt-lg',] }],
    ngStyleLtXl: [{ type: Input, args: ['ngStyle.lt-xl',] }],
    ngStyleGtXs: [{ type: Input, args: ['ngStyle.gt-xs',] }],
    ngStyleGtSm: [{ type: Input, args: ['ngStyle.gt-sm',] }],
    ngStyleGtMd: [{ type: Input, args: ['ngStyle.gt-md',] }],
    ngStyleGtLg: [{ type: Input, args: ['ngStyle.gt-lg',] }]
};
/**
 * Build a styles map from a list of styles, while sanitizing bad values first
 * @param {?} styles
 * @param {?=} sanitize
 * @return {?}
 */
function buildMapFromList$1(styles, sanitize) {
    /** @type {?} */
    const sanitizeValue = (it) => {
        if (sanitize) {
            it.value = sanitize(it.value);
        }
        return it;
    };
    return styles
        .map(stringToKeyValue)
        .filter(entry => !!entry)
        .map(sanitizeValue)
        .reduce(keyValuesToMap, /** @type {?} */ ({}));
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const ALL_DIRECTIVES = [
    ShowHideDirective,
    ClassDirective,
    StyleDirective,
    ImgSrcDirective
];
/**
 * *****************************************************************
 * Define module for the Extended API
 * *****************************************************************
 */
class ExtendedModule {
}
ExtendedModule.decorators = [
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

export { ExtendedModule, ClassDirective, ImgSrcDirective, negativeOf, ShowHideDirective, StyleDirective };
//# sourceMappingURL=extended.js.map
