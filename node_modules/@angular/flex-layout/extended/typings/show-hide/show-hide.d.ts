/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
import { Subscription } from 'rxjs';
import { LayoutDirective } from '@angular/flex-layout/flex';
/**
 * For fxHide selectors, we invert the 'value'
 * and assign to the equivalent fxShow selector cache
 *  - When 'hide' === '' === true, do NOT show the element
 *  - When 'hide' === false or 0... we WILL show the element
 */
export declare function negativeOf(hide: any): boolean;
/**
 * 'show' Layout API directive
 *
 */
export declare class ShowHideDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
    protected layout: LayoutDirective;
    protected elRef: ElementRef;
    protected styleUtils: StyleUtils;
    protected platformId: Object;
    protected serverModuleLoaded: boolean;
    /**
     * Subscription to the parent flex container's layout changes.
     * Stored so we can unsubscribe when this directive is destroyed.
     */
    protected _layoutWatcher: Subscription;
    /** Original dom Elements CSS display style */
    protected _display: string;
    show: any;
    showXs: any;
    showSm: any;
    showMd: any;
    showLg: any;
    showXl: any;
    showLtSm: any;
    showLtMd: any;
    showLtLg: any;
    showLtXl: any;
    showGtXs: any;
    showGtSm: any;
    showGtMd: any;
    showGtLg: any;
    hide: any;
    hideXs: any;
    hideSm: any;
    hideMd: any;
    hideLg: any;
    hideXl: any;
    hideLtSm: any;
    hideLtMd: any;
    hideLtLg: any;
    hideLtXl: any;
    hideGtXs: any;
    hideGtSm: any;
    hideGtMd: any;
    hideGtLg: any;
    constructor(monitor: MediaMonitor, layout: LayoutDirective, elRef: ElementRef, styleUtils: StyleUtils, platformId: Object, serverModuleLoaded: boolean);
    /**
     * Override accessor to the current HTMLElement's `display` style
     * Note: Show/Hide will not change the display to 'flex' but will set it to 'block'
     * unless it was already explicitly specified inline or in a CSS stylesheet.
     */
    protected _getDisplayStyle(): string;
    /**
     * On changes to any @Input properties...
     * Default to use the non-responsive Input value ('fxShow')
     * Then conditionally override with the mq-activated Input's current value
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    ngOnInit(): void;
    ngOnDestroy(): void;
    /** Validate the visibility value and then update the host's inline display style */
    protected _updateWithValue(value?: string | number | boolean): void;
    /** Build the CSS that should be assigned to the element instance */
    protected _buildCSS(show: any): {
        'display': string;
    };
    /**  Validate the to be not FALSY */
    _validateTruthy(show: any): boolean;
}
