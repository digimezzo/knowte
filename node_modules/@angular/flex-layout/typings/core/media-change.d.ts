/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare type MediaQuerySubscriber = (changes: MediaChange) => void;
/**
 * Class instances emitted [to observers] for each mql notification
 */
export declare class MediaChange {
    matches: boolean;
    mediaQuery: string;
    mqAlias: string;
    suffix: string;
    property: string;
    value: any;
    constructor(matches?: boolean, // Is the mq currently activated
    mediaQuery?: string, // e.g.   (min-width: 600px) and (max-width: 959px)
    mqAlias?: string, // e.g.   gt-sm, md, gt-lg
    suffix?: string);
    clone(): MediaChange;
}
