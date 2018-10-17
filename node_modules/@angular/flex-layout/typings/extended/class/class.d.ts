/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DoCheck, ElementRef, IterableDiffers, KeyValueDiffers, OnChanges, OnDestroy, Renderer2, SimpleChanges, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { BaseDirective, BaseDirectiveAdapter, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
/** NgClass allowed inputs **/
export declare type NgClassType = string | string[] | Set<string> | {
    [klass: string]: any;
};
/**
 * Directive to add responsive support for ngClass.
 * This maintains the core functionality of 'ngClass' and adds responsive API
 * Note: this class is a no-op when rendered on the server
 */
export declare class ClassDirective extends BaseDirective implements DoCheck, OnChanges, OnDestroy, OnInit {
    protected monitor: MediaMonitor;
    protected _iterableDiffers: IterableDiffers;
    protected _keyValueDiffers: KeyValueDiffers;
    protected _ngEl: ElementRef;
    protected _renderer: Renderer2;
    private _ngClassInstance;
    protected _styler: StyleUtils;
    /**
     * Intercept ngClass assignments so we cache the default classes
     * which are merged with activated styles or used as fallbacks.
     * Note: Base ngClass values are applied during ngDoCheck()
     */
    ngClassBase: NgClassType;
    /**
     * Capture class assignments so we cache the default classes
     * which are merged with activated styles and used as fallbacks.
     */
    klazz: string;
    ngClassXs: NgClassType;
    ngClassSm: NgClassType;
    ngClassMd: NgClassType;
    ngClassLg: NgClassType;
    ngClassXl: NgClassType;
    ngClassLtSm: NgClassType;
    ngClassLtMd: NgClassType;
    ngClassLtLg: NgClassType;
    ngClassLtXl: NgClassType;
    ngClassGtXs: NgClassType;
    ngClassGtSm: NgClassType;
    ngClassGtMd: NgClassType;
    ngClassGtLg: NgClassType;
    constructor(monitor: MediaMonitor, _iterableDiffers: IterableDiffers, _keyValueDiffers: KeyValueDiffers, _ngEl: ElementRef, _renderer: Renderer2, _ngClassInstance: NgClass, _styler: StyleUtils);
    /**
     * For @Input changes on the current mq activation property
     */
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    /**
     * For ChangeDetectionStrategy.onPush and ngOnChanges() updates
     */
    ngDoCheck(): void;
    ngOnDestroy(): void;
    /**
     * Configure adapters (that delegate to an internal ngClass instance) if responsive
     * keys have been defined.
     */
    protected _configureAdapters(): void;
    /**
     * Build an mqActivation object that bridges mql change events to onMediaQueryChange handlers
     * NOTE: We delegate subsequent activity to the NgClass logic
     *       Identify the activated input value and update the ngClass iterables...
     *       Use ngDoCheck() to actually apply the values to the element
     */
    protected _configureMQListener(baseKey?: string): void;
    /**
     * Special adapter to cross-cut responsive behaviors and capture mediaQuery changes
     * Delegate value changes to the internal `_ngClassInstance` for processing
     */
    protected _base: BaseDirectiveAdapter;
}
