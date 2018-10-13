/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable } from 'rxjs';
import { Path, PathFragment } from '../path';
import { FileBuffer, Host, HostCapabilities, HostWatchEvent, HostWatchOptions, Stats } from './interface';
export declare type ReplacementFunction = (path: Path) => Path;
/**
 */
export declare class PatternMatchingHost<StatsT extends object = {}> implements Host<StatsT> {
    protected _delegate: Host<StatsT>;
    protected _patterns: Map<RegExp, ReplacementFunction>;
    constructor(_delegate: Host<StatsT>);
    addPattern(pattern: string | string[], replacementFn: ReplacementFunction): void;
    protected _resolve(path: Path): Path;
    readonly capabilities: HostCapabilities;
    write(path: Path, content: FileBuffer): Observable<void>;
    read(path: Path): Observable<FileBuffer>;
    delete(path: Path): Observable<void>;
    rename(from: Path, to: Path): Observable<void>;
    list(path: Path): Observable<PathFragment[]>;
    exists(path: Path): Observable<boolean>;
    isDirectory(path: Path): Observable<boolean>;
    isFile(path: Path): Observable<boolean>;
    stat(path: Path): Observable<Stats<StatsT>> | null;
    watch(path: Path, options?: HostWatchOptions): Observable<HostWatchEvent> | null;
}
