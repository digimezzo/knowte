import { ElementRef, AfterViewInit, DoCheck, OnDestroy, NgZone } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
/** Directive to automatically resize a textarea to fit its content. */
export declare class CdkTextareaAutosize implements AfterViewInit, DoCheck, OnDestroy {
    private _elementRef;
    private _platform;
    private _ngZone;
    /** Keep track of the previous textarea value to avoid resizing when the value hasn't changed. */
    private _previousValue;
    private _initialHeight;
    private readonly _destroyed;
    private _minRows;
    private _maxRows;
    private _enabled;
    private _textareaElement;
    /** Minimum amount of rows in the textarea. */
    minRows: number;
    /** Maximum amount of rows in the textarea. */
    maxRows: number;
    /** Whether autosizing is enabled or not */
    enabled: boolean;
    /** Cached height of a textarea with a single row. */
    private _cachedLineHeight;
    constructor(_elementRef: ElementRef<HTMLElement>, _platform: Platform, _ngZone: NgZone);
    /** Sets the minimum height of the textarea as determined by minRows. */
    _setMinHeight(): void;
    /** Sets the maximum height of the textarea as determined by maxRows. */
    _setMaxHeight(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    /** Sets a style property on the textarea element. */
    private _setTextareaStyle(property, value);
    /**
     * Cache the height of a single-row textarea if it has not already been cached.
     *
     * We need to know how large a single "row" of a textarea is in order to apply minRows and
     * maxRows. For the initial version, we will assume that the height of a single line in the
     * textarea does not ever change.
     */
    private _cacheTextareaLineHeight();
    ngDoCheck(): void;
    /**
     * Resize the textarea to fit its content.
     * @param force Whether to force a height recalculation. By default the height will be
     *    recalculated only if the value changed since the last call.
     */
    resizeToFitContent(force?: boolean): void;
    /**
     * Resets the textarea to it's original size
     */
    reset(): void;
    _noopInputHandler(): void;
}
