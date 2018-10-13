/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Path } from '..';
import { SimpleMemoryHost } from './memory';
import { SyncDelegateHost } from './sync';
export declare class TestHost extends SimpleMemoryHost {
    protected _sync: SyncDelegateHost<{}>;
    constructor(map?: {
        [path: string]: string;
    });
    readonly files: Path[];
    readonly sync: SyncDelegateHost<{}>;
}
