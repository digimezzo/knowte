/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { AfterContentChecked, AfterContentInit, ChangeDetectorRef, ElementRef, NgZone, OnDestroy, QueryList } from '@angular/core';
import { CanColor, CanDisable, CanDisableRipple, HasTabIndex, RippleConfig, RippleGlobalOptions, RippleRenderer, RippleTarget, ThemePalette } from '@angular/material/core';
import { MatInkBar } from '../ink-bar';
import { FocusMonitor } from '@angular/cdk/a11y';
/** @docs-private */
export declare class MatTabNavBase {
    _elementRef: ElementRef;
    constructor(_elementRef: ElementRef);
}
export declare const _MatTabNavMixinBase: (new (...args: any[]) => CanDisableRipple) & (new (...args: any[]) => CanColor) & typeof MatTabNavBase;
/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
export declare class MatTabNav extends _MatTabNavMixinBase implements AfterContentChecked, AfterContentInit, CanColor, CanDisableRipple, OnDestroy {
    private _dir;
    private _ngZone;
    private _changeDetectorRef;
    private _viewportRuler;
    /** Subject that emits when the component has been destroyed. */
    private readonly _onDestroy;
    private _activeLinkChanged;
    private _activeLinkElement;
    _inkBar: MatInkBar;
    /** Query list of all tab links of the tab navigation. */
    _tabLinks: QueryList<MatTabLink>;
    /** Background color of the tab nav. */
    backgroundColor: ThemePalette;
    private _backgroundColor;
    constructor(elementRef: ElementRef, _dir: Directionality, _ngZone: NgZone, _changeDetectorRef: ChangeDetectorRef, _viewportRuler: ViewportRuler);
    /**
     * Notifies the component that the active link has been changed.
     * @breaking-change 7.0.0 `element` parameter to be removed.
     */
    updateActiveLink(element: ElementRef): void;
    ngAfterContentInit(): void;
    /** Checks if the active link has been changed and, if so, will update the ink bar. */
    ngAfterContentChecked(): void;
    ngOnDestroy(): void;
    /** Aligns the ink bar to the active link. */
    _alignInkBar(): void;
}
export declare class MatTabLinkBase {
}
export declare const _MatTabLinkMixinBase: (new (...args: any[]) => HasTabIndex) & (new (...args: any[]) => CanDisableRipple) & (new (...args: any[]) => CanDisable) & typeof MatTabLinkBase;
/**
 * Link inside of a `mat-tab-nav-bar`.
 */
export declare class MatTabLink extends _MatTabLinkMixinBase implements OnDestroy, CanDisable, CanDisableRipple, HasTabIndex, RippleTarget {
    private _tabNavBar;
    _elementRef: ElementRef;
    /**
     * @deprecated
     * @breaking-change 7.0.0 `_focusMonitor` parameter to be made required.
     */
    private _focusMonitor;
    /** Whether the tab link is active or not. */
    protected _isActive: boolean;
    /** Reference to the RippleRenderer for the tab-link. */
    protected _tabLinkRipple: RippleRenderer;
    /** Whether the ripples are globally disabled through the RippleGlobalOptions */
    private _ripplesGloballyDisabled;
    /** Whether the link is active. */
    active: boolean;
    /**
     * Ripple configuration for ripples that are launched on pointer down.
     * @docs-private
     */
    rippleConfig: RippleConfig;
    /**
     * Whether ripples are disabled on interaction
     * @docs-private
     */
    readonly rippleDisabled: boolean;
    constructor(_tabNavBar: MatTabNav, _elementRef: ElementRef, ngZone: NgZone, platform: Platform, globalOptions: RippleGlobalOptions, tabIndex: string, 
        /**
         * @deprecated
         * @breaking-change 7.0.0 `_focusMonitor` parameter to be made required.
         */
        _focusMonitor?: FocusMonitor | undefined);
    ngOnDestroy(): void;
    /**
     * Handles the click event, preventing default navigation if the tab link is disabled.
     */
    _handleClick(event: MouseEvent): void;
}
