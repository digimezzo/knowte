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
 * 'flex-align' flexbox styling directive
 * Allows element-specific overrides for cross-axis alignments in a layout container
 * @see https://css-tricks.com/almanac/properties/a/align-self/
 */
export declare class FlexAlignDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
    align: string;
    alignXs: string;
    alignSm: string;
    alignMd: string;
    alignLg: string;
    alignXl: string;
    alignLtSm: string;
    alignLtMd: string;
    alignLtLg: string;
    alignLtXl: string;
    alignGtXs: string;
    alignGtSm: string;
    alignGtMd: string;
    alignGtLg: string;
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
    protected _updateWithValue(value?: string | number): void;
    protected _buildCSS(align?: string | number): {
        [key: string]: string | number;
    };
}
