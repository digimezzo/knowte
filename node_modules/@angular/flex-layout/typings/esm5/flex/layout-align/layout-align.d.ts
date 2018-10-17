/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
import { Subscription } from 'rxjs';
import { Layout, LayoutDirective } from '../layout/layout';
/**
 * 'layout-align' flexbox styling directive
 *  Defines positioning of child elements along main and cross axis in a layout container
 *  Optional values: {main-axis} values or {main-axis cross-axis} value pairs
 *
 *  @see https://css-tricks.com/almanac/properties/j/justify-content/
 *  @see https://css-tricks.com/almanac/properties/a/align-items/
 *  @see https://css-tricks.com/almanac/properties/a/align-content/
 */
export declare class LayoutAlignDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
    protected _layout: string;
    protected _layoutWatcher: Subscription;
    align: any;
    alignXs: any;
    alignSm: any;
    alignMd: any;
    alignLg: any;
    alignXl: any;
    alignGtXs: any;
    alignGtSm: any;
    alignGtMd: any;
    alignGtLg: any;
    alignLtSm: any;
    alignLtMd: any;
    alignLtLg: any;
    alignLtXl: any;
    constructor(monitor: MediaMonitor, elRef: ElementRef, container: LayoutDirective, styleUtils: StyleUtils);
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    ngOnInit(): void;
    ngOnDestroy(): void;
    /**
     *
     */
    protected _updateWithValue(value?: string): void;
    /**
     * Cache the parent container 'flex-direction' and update the 'flex' styles
     */
    protected _onLayoutChange(layout: Layout): void;
    protected _buildCSS(align: any): any;
    /**
     * Update container element to 'stretch' as needed...
     * NOTE: this is only done if the crossAxis is explicitly set to 'stretch'
     */
    protected _allowStretching(align: any, layout: any): void;
}
