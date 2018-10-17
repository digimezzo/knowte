/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Optional } from '@angular/core';
import { StylesheetMap } from './stylesheet-map';
/**
 * Ensure a single global service provider
 * @deprecated
 * @deletion-target v6.0.0-beta.16
 */
export declare function STYLESHEET_MAP_PROVIDER_FACTORY(parentSheet: StylesheetMap): StylesheetMap;
/**
 * Export provider that uses a global service factory (above)
 * @deprecated
 * @deletion-target v6.0.0-beta.16
 */
export declare const STYLESHEET_MAP_PROVIDER: {
    provide: typeof StylesheetMap;
    deps: Optional[][];
    useFactory: typeof STYLESHEET_MAP_PROVIDER_FACTORY;
};
