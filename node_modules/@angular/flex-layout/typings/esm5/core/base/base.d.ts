/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { StyleDefinition, StyleUtils } from '../style-utils/style-utils';
import { ResponsiveActivation } from '../responsive-activation/responsive-activation';
import { MediaMonitor } from '../media-monitor/media-monitor';
import { MediaQuerySubscriber } from '../media-change';
/** Abstract base class for the Layout API styling directives. */
export declare abstract class BaseDirective implements OnDestroy, OnChanges {
    protected _mediaMonitor: MediaMonitor;
    protected _elementRef: ElementRef;
    protected _styler: StyleUtils;
    readonly hasMediaQueryListener: boolean;
    /**
     * Imperatively determine the current activated [input] value;
     * if called before ngOnInit() this will return `undefined`
     */
    /**
    * Change the currently activated input value and force-update
    * the injected CSS (by-passing change detection).
    *
    * NOTE: Only the currently activated input value will be modified;
    *       other input values will NOT be affected.
    */
    activatedValue: string | number;
    protected constructor(_mediaMonitor: MediaMonitor, _elementRef: ElementRef, _styler: StyleUtils);
    /**
     * Does this directive have 1 or more responsive keys defined
     * Note: we exclude the 'baseKey' key (which is NOT considered responsive)
     */
    hasResponsiveAPI(baseKey: string): boolean;
    /**
     * Use post-component-initialization event to perform extra
     * querying such as computed Display style
     */
    ngOnInit(): void;
    ngOnChanges(change: SimpleChanges): void;
    ngOnDestroy(): void;
    /** Access to host element's parent DOM node */
    protected readonly parentElement: any;
    protected readonly nativeElement: HTMLElement;
    /** Access the current value (if any) of the @Input property */
    protected _queryInput(key: any): any;
    /**
     * Was the directive's default selector used ?
     * If not, use the fallback value!
     */
    protected _getDefaultVal(key: string, fallbackVal: any): string | boolean;
    /**
     * Quick accessor to the current HTMLElement's `display` style
     * Note: this allows us to preserve the original style
     * and optional restore it when the mediaQueries deactivate
     */
    protected _getDisplayStyle(source?: HTMLElement): string;
    /** Quick accessor to raw attribute value on the target DOM element */
    protected _getAttributeValue(attribute: string, source?: HTMLElement): string;
    /**
     * Determine the DOM element's Flexbox flow (flex-direction).
     *
     * Check inline style first then check computed (stylesheet) style.
     * And optionally add the flow value to element's inline style.
     */
    protected _getFlexFlowDirection(target: HTMLElement, addIfMissing?: boolean): string;
    /** Applies styles given via string pair or object map to the directive element */
    protected _applyStyleToElement(style: StyleDefinition, value?: string | number, element?: HTMLElement): void;
    /** Applies styles given via string pair or object map to the directive's element */
    protected _applyStyleToElements(style: StyleDefinition, elements: HTMLElement[]): void;
    /**
     *  Save the property value; which may be a complex object.
     *  Complex objects support property chains
     */
    protected _cacheInput(key?: string, source?: any): void;
    /**
     *  Build a ResponsiveActivation object used to manage subscriptions to mediaChange notifications
     *  and intelligent lookup of the directive's property value that corresponds to that mediaQuery
     *  (or closest match).
     */
    protected _listenForMediaQueryChanges(key: string, defaultValue: any, onMediaQueryChange: MediaQuerySubscriber): ResponsiveActivation;
    /** Special accessor to query for all child 'element' nodes regardless of type, class, etc */
    protected readonly childrenNodes: any[];
    /** Fast validator for presence of attribute on the host element */
    protected hasKeyValue(key: any): boolean;
    protected readonly hasInitialized: boolean;
    /** MediaQuery Activation Tracker */
    protected _mqActivation: ResponsiveActivation;
    /** Dictionary of input keys with associated values */
    protected _inputMap: {};
    /**
     * Has the `ngOnInit()` method fired
     *
     * Used to allow *ngFor tasks to finish and support queries like
     * getComputedStyle() during ngOnInit().
     */
    protected _hasInitialized: boolean;
}
