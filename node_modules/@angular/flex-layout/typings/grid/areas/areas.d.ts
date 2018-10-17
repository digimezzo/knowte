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
 * 'grid-template-areas' CSS Grid styling directive
 * Configures the names of elements within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-14
 */
export declare class GridAreasDirective extends BaseDirective implements OnInit, OnChanges, OnDestroy {
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
    inline: any;
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
        'display': string;
        'grid-template-areas': any;
    };
}
