/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare type NgStyleRawList = string[];
export declare type NgStyleMap = {
    [klass: string]: string;
};
export declare type NgStyleType = string | Set<string> | NgStyleRawList | NgStyleMap;
/**
 * Callback function for SecurityContext.STYLE sanitization
 */
export declare type NgStyleSanitizer = (val: any) => string;
/** NgStyle allowed inputs */
export declare class NgStyleKeyValue {
    key: string;
    value: string;
    constructor(key: string, value: string, noQuotes?: boolean);
}
/** Transform Operators for @angular/flex-layout NgStyle Directive */
export declare const ngStyleUtils: {
    getType: typeof getType;
    buildRawList: typeof buildRawList;
    buildMapFromList: typeof buildMapFromList;
    buildMapFromSet: typeof buildMapFromSet;
};
declare function getType(target: any): string;
/**
 * Split string of key:value pairs into Array of k-v pairs
 * e.g.  'key:value; key:value; key:value;' -> ['key:value',...]
 */
declare function buildRawList(source: any, delimiter?: string): NgStyleRawList;
/** Convert array of key:value strings to a iterable map object */
declare function buildMapFromList(styles: NgStyleRawList, sanitize?: NgStyleSanitizer): NgStyleMap;
/** Convert Set<string> or raw Object to an iterable NgStyleMap */
declare function buildMapFromSet(source: any, sanitize?: NgStyleSanitizer): NgStyleMap;
export {};
