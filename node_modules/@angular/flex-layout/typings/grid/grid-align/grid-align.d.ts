/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
/**
 * 'align' CSS Grid styling directive for grid children
 *  Defines positioning of child elements along row and column axis in a grid container
 *  Optional values: {row-axis} values or {row-axis column-axis} value pairs
 *
 *  @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-justify-self
 *  @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-align-self
 */
export declare class GridAlignDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
    align: string;
    alignXs: string;
    alignSm: string;
    alignMd: string;
    alignLg: string;
    alignXl: string;
    alignGtXs: string;
    alignGtSm: string;
    alignGtMd: string;
    alignGtLg: string;
    alignLtSm: string;
    alignLtMd: string;
    alignLtLg: string;
    alignLtXl: string;
    constructor(monitor: MediaMonitor, elRef: ElementRef, styleUtils: StyleUtils);
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * After the initial onChanges, build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    ngOnInit(): void;
    /**
     *
     */
    protected _updateWithValue(value?: string): void;
    protected _buildCSS(align?: string): {
        [key: string]: string;
    };
}
