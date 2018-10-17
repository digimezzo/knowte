/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
import { Observable, ReplaySubject } from 'rxjs';
export declare type Layout = {
    direction: string;
    wrap: boolean;
};
/**
 * 'layout' flexbox styling directive
 * Defines the positioning flow direction for the child elements: row or column
 * Optional values: column or row (default)
 * @see https://css-tricks.com/almanac/properties/f/flex-direction/
 *
 */
export declare class LayoutDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
    /**
     * Create Observable for nested/child 'flex' directives. This allows
     * child flex directives to subscribe/listen for flexbox direction changes.
     */
    protected _announcer: ReplaySubject<Layout>;
    /**
     * Publish observer to enabled nested, dependent directives to listen
     * to parent 'layout' direction changes
     */
    layout$: Observable<Layout>;
    layout: any;
    layoutXs: any;
    layoutSm: any;
    layoutMd: any;
    layoutLg: any;
    layoutXl: any;
    layoutGtXs: any;
    layoutGtSm: any;
    layoutGtMd: any;
    layoutGtLg: any;
    layoutLtSm: any;
    layoutLtMd: any;
    layoutLtLg: any;
    layoutLtXl: any;
    constructor(monitor: MediaMonitor, elRef: ElementRef, styleUtils: StyleUtils);
    /**
     * On changes to any @Input properties...
     * Default to use the non-responsive Input value ('fxLayout')
     * Then conditionally override with the mq-activated Input's current value
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    ngOnInit(): void;
    /** Validate the direction value and then update the host's inline flexbox styles */
    protected _updateWithDirection(value?: string): void;
}
