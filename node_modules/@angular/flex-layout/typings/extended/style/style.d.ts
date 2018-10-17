/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DoCheck, ElementRef, KeyValueDiffers, OnDestroy, OnChanges, Renderer2, SimpleChanges, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseDirective, BaseDirectiveAdapter, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
import { NgStyleType } from './style-transforms';
/**
 * Directive to add responsive support for ngStyle.
 *
 */
export declare class StyleDirective extends BaseDirective implements DoCheck, OnChanges, OnDestroy, OnInit {
    private monitor;
    protected _sanitizer: DomSanitizer;
    protected _ngEl: ElementRef;
    protected _renderer: Renderer2;
    protected _differs: KeyValueDiffers;
    private _ngStyleInstance;
    protected _styler: StyleUtils;
    /**
     * Intercept ngStyle assignments so we cache the default styles
     * which are merged with activated styles or used as fallbacks.
     */
    ngStyleBase: NgStyleType;
    ngStyleXs: NgStyleType;
    ngStyleSm: NgStyleType;
    ngStyleMd: NgStyleType;
    ngStyleLg: NgStyleType;
    ngStyleXl: NgStyleType;
    ngStyleLtSm: NgStyleType;
    ngStyleLtMd: NgStyleType;
    ngStyleLtLg: NgStyleType;
    ngStyleLtXl: NgStyleType;
    ngStyleGtXs: NgStyleType;
    ngStyleGtSm: NgStyleType;
    ngStyleGtMd: NgStyleType;
    ngStyleGtLg: NgStyleType;
    /**
     *  Constructor for the ngStyle subclass; which adds selectors and
     *  a MediaQuery Activation Adapter
     */
    constructor(monitor: MediaMonitor, _sanitizer: DomSanitizer, _ngEl: ElementRef, _renderer: Renderer2, _differs: KeyValueDiffers, _ngStyleInstance: NgStyle, _styler: StyleUtils);
    /** For @Input changes on the current mq activation property */
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    /** For ChangeDetectionStrategy.onPush and ngOnChanges() updates */
    ngDoCheck(): void;
    ngOnDestroy(): void;
    /**
     * Configure adapters (that delegate to an internal ngClass instance) if responsive
     * keys have been defined.
     */
    protected _configureAdapters(): void;
    /**
     * Build an mqActivation object that bridges
     * mql change events to onMediaQueryChange handlers
     */
    protected _configureMQListener(baseKey?: string): void;
    /** Build intercept to convert raw strings to ngStyleMap */
    protected _buildCacheInterceptor(): void;
    /**
     * Convert raw strings to ngStyleMap; which is required by ngStyle
     * NOTE: Raw string key-value pairs MUST be delimited by `;`
     *       Comma-delimiters are not supported due to complexities of
     *       possible style values such as `rgba(x,x,x,x)` and others
     */
    protected _buildStyleMap(styles: NgStyleType): string | import("./style-transforms").NgStyleMap;
    /** Initial lookup of raw 'class' value (if any) */
    protected _fallbackToStyle(): void;
    /**
     * Special adapter to cross-cut responsive behaviors
     * into the StyleDirective
     */
    protected _base: BaseDirectiveAdapter;
}
