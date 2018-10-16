/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { BaseDirective, MediaMonitor, StyleDefinition, StyleUtils } from '@angular/flex-layout/core';
import { Subscription } from 'rxjs';
import { Layout, LayoutDirective } from '../layout/layout';
/**
 * 'flex-offset' flexbox styling directive
 * Configures the 'margin-left' of the element in a layout container
 */
export declare class FlexOffsetDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
    protected _container: LayoutDirective;
    private _directionality;
    private _directionWatcher;
    offset: string;
    offsetXs: string;
    offsetSm: string;
    offsetMd: string;
    offsetLg: string;
    offsetXl: string;
    offsetLtSm: string;
    offsetLtMd: string;
    offsetLtLg: string;
    offsetLtXl: string;
    offsetGtXs: string;
    offsetGtSm: string;
    offsetGtMd: string;
    offsetGtLg: string;
    constructor(monitor: MediaMonitor, elRef: ElementRef, _container: LayoutDirective, _directionality: Directionality, styleUtils: StyleUtils);
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * Cleanup
     */
    ngOnDestroy(): void;
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    ngOnInit(): void;
    /** The flex-direction of this element's host container. Defaults to 'row'. */
    protected _layout: {
        direction: string;
        wrap: boolean;
    };
    /**
     * Subscription to the parent flex container's layout changes.
     * Stored so we can unsubscribe when this directive is destroyed.
     */
    protected _layoutWatcher?: Subscription;
    /**
     * If parent flow-direction changes, then update the margin property
     * used to offset
     */
    protected watchParentFlow(): void;
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     */
    protected _onLayoutChange(layout?: Layout): void;
    /**
     * Using the current fxFlexOffset value, update the inline CSS
     * NOTE: this will assign `margin-left` if the parent flex-direction == 'row',
     *       otherwise `margin-top` is used for the offset.
     */
    protected _updateWithValue(value?: string | number): void;
    protected _buildCSS(offset?: string | number): StyleDefinition;
}
