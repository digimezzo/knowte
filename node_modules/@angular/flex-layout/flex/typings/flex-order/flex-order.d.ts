/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
/**
 * 'flex-order' flexbox styling directive
 * Configures the positional ordering of the element in a sorted layout container
 * @see https://css-tricks.com/almanac/properties/o/order/
 */
export declare class FlexOrderDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
    order: any;
    orderXs: any;
    orderSm: any;
    orderMd: any;
    orderLg: any;
    orderXl: any;
    orderGtXs: any;
    orderGtSm: any;
    orderGtMd: any;
    orderGtLg: any;
    orderLtSm: any;
    orderLtMd: any;
    orderLtLg: any;
    orderLtXl: any;
    constructor(monitor: MediaMonitor, elRef: ElementRef, styleUtils: StyleUtils);
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    ngOnInit(): void;
    protected _updateWithValue(value?: string): void;
    protected _buildCSS(value: any): {
        order: any;
    };
}
