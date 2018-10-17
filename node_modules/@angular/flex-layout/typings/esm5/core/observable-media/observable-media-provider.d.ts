/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Optional } from '@angular/core';
import { BreakPointRegistry } from '../breakpoints/break-point-registry';
import { MatchMedia } from '../match-media/match-media';
import { ObservableMedia } from './observable-media';
/**
 * Ensure a single global ObservableMedia service provider
 * @deprecated
 * @deletion-target v6.0.0-beta.16
 */
export declare function OBSERVABLE_MEDIA_PROVIDER_FACTORY(parentService: ObservableMedia, matchMedia: MatchMedia, breakpoints: BreakPointRegistry): ObservableMedia;
/**
 *  Provider to return global service for observable service for all MediaQuery activations
 *  @deprecated
 *  @deletion-target v6.0.0-beta.16
 */
export declare const OBSERVABLE_MEDIA_PROVIDER: {
    provide: typeof ObservableMedia;
    deps: (typeof BreakPointRegistry | typeof MatchMedia | Optional[])[];
    useFactory: typeof OBSERVABLE_MEDIA_PROVIDER_FACTORY;
};
