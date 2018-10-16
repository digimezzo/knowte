import { NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BreakPoint } from '../breakpoints/break-point';
import { MatchMedia } from './match-media';
import { MediaChange } from '../media-change';
/**
 * Special server-only class to simulate a MediaQueryList and
 * - supports manual activation to simulate mediaQuery matching
 * - manages listeners
 */
export declare class ServerMediaQueryList implements MediaQueryList {
    private _mediaQuery;
    private _isActive;
    private _listeners;
    readonly matches: boolean;
    readonly media: string;
    constructor(_mediaQuery: string);
    /**
     * Destroy the current list by deactivating the
     * listeners and clearing the internal list
     */
    destroy(): void;
    /** Notify all listeners that 'matches === TRUE' */
    activate(): ServerMediaQueryList;
    /** Notify all listeners that 'matches === false' */
    deactivate(): ServerMediaQueryList;
    /** Add a listener to our internal list to activate later */
    addListener(listener: MediaQueryListListener): void;
    /** Don't need to remove listeners in the server environment */
    removeListener(_: EventListenerOrEventListenerObject | null): void;
    addEventListener<K extends keyof MediaQueryListEventMap>(_: K, __: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any, ___?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof MediaQueryListEventMap>(_: K, __: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any, ___?: boolean | EventListenerOptions): void;
    dispatchEvent(_: Event): boolean;
    onchange: MediaQueryListListener;
}
/**
 * Special server-only implementation of MatchMedia that uses the above
 * ServerMediaQueryList as its internal representation
 *
 * Also contains methods to activate and deactivate breakpoints
 */
export declare class ServerMatchMedia extends MatchMedia {
    protected _zone: NgZone;
    protected _platformId: Object;
    protected _document: any;
    protected _registry: Map<string, ServerMediaQueryList>;
    protected _source: BehaviorSubject<MediaChange>;
    protected _observable$: Observable<MediaChange>;
    constructor(_zone: NgZone, _platformId: Object, _document: any);
    /** Activate the specified breakpoint if we're on the server, no-op otherwise */
    activateBreakpoint(bp: BreakPoint): void;
    /** Deactivate the specified breakpoint if we're on the server, no-op otherwise */
    deactivateBreakpoint(bp: BreakPoint): void;
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     */
    protected _buildMQL(query: string): ServerMediaQueryList;
}
declare type MediaQueryListListener = ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
export {};
