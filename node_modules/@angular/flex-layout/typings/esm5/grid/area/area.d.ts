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
 * 'grid-area' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-27
 */
export declare class GridAreaDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
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
        'grid-area': any;
    };
}
