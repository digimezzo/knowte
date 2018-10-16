/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BaseDirective, LayoutConfigOptions, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
import { Subscription } from 'rxjs';
import { Layout, LayoutDirective } from '../layout/layout';
/** Built-in aliases for different flex-basis values. */
export declare type FlexBasisAlias = 'grow' | 'initial' | 'auto' | 'none' | 'nogrow' | 'noshrink';
/**
 * Directive to control the size of a flex item using flex-basis, flex-grow, and flex-shrink.
 * Corresponds to the css `flex` shorthand property.
 *
 * @see https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
export declare class FlexDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
    protected _container: LayoutDirective;
    protected styleUtils: StyleUtils;
    protected layoutConfig: LayoutConfigOptions;
    /** The flex-direction of this element's flex container. Defaults to 'row'. */
    protected _layout?: Layout;
    /**
     * Subscription to the parent flex container's layout changes.
     * Stored so we can unsubscribe when this directive is destroyed.
     */
    protected _layoutWatcher?: Subscription;
    shrink: string;
    grow: string;
    flex: string;
    flexXs: string;
    flexSm: string;
    flexMd: string;
    flexLg: string;
    flexXl: string;
    flexGtXs: string;
    flexGtSm: string;
    flexGtMd: string;
    flexGtLg: string;
    flexLtSm: string;
    flexLtMd: string;
    flexLtLg: string;
    flexLtXl: string;
    constructor(monitor: MediaMonitor, elRef: ElementRef, _container: LayoutDirective, styleUtils: StyleUtils, layoutConfig: LayoutConfigOptions);
    /**
     * For @Input changes on the current mq activation property, see onMediaQueryChanges()
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    ngOnInit(): void;
    ngOnDestroy(): void;
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     */
    protected _onLayoutChange(layout?: Layout): void;
    protected _updateStyle(value?: string | number): void;
    /**
     * Validate the value to be one of the acceptable value options
     * Use default fallback of 'row'
     */
    protected _validateValue(grow: number | string, shrink: number | string, basis: string | number | FlexBasisAlias): any;
}
