/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnInit, OnChanges } from '@angular/core';
import { BaseDirective, MediaMonitor, StyleUtils } from '@angular/flex-layout/core';
/**
 * This directive provides a responsive API for the HTML <img> 'src' attribute
 * and will update the img.src property upon each responsive activation.
 *
 * e.g.
 *      <img src="defaultScene.jpg" src.xs="mobileScene.jpg"></img>
 *
 * @see https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-src/
 */
export declare class ImgSrcDirective extends BaseDirective implements OnInit, OnChanges {
    protected _elRef: ElementRef;
    protected _monitor: MediaMonitor;
    protected _styler: StyleUtils;
    protected _platformId: Object;
    protected _serverModuleLoaded: boolean;
    srcBase: any;
    srcXs: any;
    srcSm: any;
    srcMd: any;
    srcLg: any;
    srcXl: any;
    srcLtSm: any;
    srcLtMd: any;
    srcLtLg: any;
    srcLtXl: any;
    srcGtXs: any;
    srcGtSm: any;
    srcGtMd: any;
    srcGtLg: any;
    constructor(_elRef: ElementRef, _monitor: MediaMonitor, _styler: StyleUtils, _platformId: Object, _serverModuleLoaded: boolean);
    /**
     * Listen for responsive changes to update the img.src attribute
     */
    ngOnInit(): void;
    /**
     * Update the 'src' property of the host <img> element
     */
    ngOnChanges(): void;
    /**
     * Use the [responsively] activated input value to update
     * the host img src attribute or assign a default `img.src=''`
     * if the src has not been defined.
     *
     * Do nothing to standard `<img src="">` usages, only when responsive
     * keys are present do we actually call `setAttribute()`
     */
    protected _updateSrcFor(): void;
    /**
     * Cache initial value of 'src', this will be used as fallback when breakpoint
     * activations change.
     * NOTE: The default 'src' property is not bound using @Input(), so perform
     * a post-ngOnInit() lookup of the default src value (if any).
     */
    protected cacheDefaultSrc(value?: string): void;
    /**
     * Empty values are maintained, undefined values are exposed as ''
     */
    protected readonly defaultSrc: string;
    /**
     * Does the <img> have 1 or more src.<xxx> responsive inputs
     * defined... these will be mapped to activated breakpoints.
     */
    protected readonly hasResponsiveKeys: boolean;
}
