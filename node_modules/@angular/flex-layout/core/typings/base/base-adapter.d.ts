/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective } from './base';
import { ResponsiveActivation } from '../responsive-activation/responsive-activation';
import { MediaQuerySubscriber } from '../media-change';
import { MediaMonitor } from '../media-monitor/media-monitor';
import { StyleUtils } from '../style-utils/style-utils';
/**
 * Adapter to the BaseDirective abstract class so it can be used via composition.
 * @see BaseDirective
 */
export declare class BaseDirectiveAdapter extends BaseDirective {
    protected _baseKey: string;
    protected _mediaMonitor: MediaMonitor;
    protected _elementRef: ElementRef;
    protected _styler: StyleUtils;
    /**
     * Accessor to determine which @Input property is "active"
     * e.g. which property value will be used.
     */
    readonly activeKey: string;
    /** Hash map of all @Input keys/values defined/used */
    readonly inputMap: {};
    /**
     * @see BaseDirective._mqActivation
     */
    readonly mqActivation: ResponsiveActivation;
    /**
     * BaseDirectiveAdapter constructor
     */
    constructor(_baseKey: string, // non-responsive @Input property name
    _mediaMonitor: MediaMonitor, _elementRef: ElementRef, _styler: StyleUtils);
    /**
      * Does this directive have 1 or more responsive keys defined
      * Note: we exclude the 'baseKey' key (which is NOT considered responsive)
      */
    hasResponsiveAPI(): boolean;
    /**
     * @see BaseDirective._queryInput
     */
    queryInput(key: any): any;
    /**
     *  Save the property value.
     */
    cacheInput(key?: string, source?: any, cacheRaw?: boolean): void;
    /**
     * @see BaseDirective._listenForMediaQueryChanges
     */
    listenForMediaQueryChanges(key: string, defaultValue: any, onMediaQueryChange: MediaQuerySubscriber): ResponsiveActivation;
    /**
     * No implicit transforms of the source.
     * Required when caching values expected later for KeyValueDiffers
     */
    protected _cacheInputRaw(key?: string, source?: any): void;
    /**
     *  Save the property value for Array values.
     */
    protected _cacheInputArray(key?: string, source?: boolean[]): void;
    /**
     *  Save the property value for key/value pair values.
     */
    protected _cacheInputObject(key?: string, source?: {
        [key: string]: boolean;
    }): void;
    /**
     *  Save the property value for string values.
     */
    protected _cacheInputString(key?: string, source?: string): void;
}
