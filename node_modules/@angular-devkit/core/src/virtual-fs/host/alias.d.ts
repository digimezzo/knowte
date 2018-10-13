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
/**
 * A Virtual Host that allow to alias some paths to other paths.
 *
 * This does not verify, when setting an alias, that the target or source exist. Neither does it
 * check whether it's a file or a directory. Please not that directories are also renamed/replaced.
 *
 * No recursion is done on the resolution, which means the following is perfectly valid then:
 *
 * ```
 *     host.aliases.set(normalize('/file/a'), normalize('/file/b'));
 *     host.aliases.set(normalize('/file/b'), normalize('/file/a'));
 * ```
 *
 * This will result in a proper swap of two files for each others.
 *
 * @example
 *   const host = new SimpleMemoryHost();
 *   host.write(normalize('/some/file'), content).subscribe();
 *
 *   const aHost = new AliasHost(host);
 *   aHost.read(normalize('/some/file'))
 *     .subscribe(x => expect(x).toBe(content));
 *   aHost.aliases.set(normalize('/some/file'), normalize('/other/path');
 *
 *   // This file will not exist because /other/path does not exist.
 *   aHost.read(normalize('/some/file'))
 *     .subscribe(undefined, err => expect(err.message).toMatch(/does not exist/));
 *
 * @example
 *   const host = new SimpleMemoryHost();
 *   host.write(normalize('/some/folder/file'), content).subscribe();
 *
 *   const aHost = new AliasHost(host);
 *   aHost.read(normalize('/some/folder/file'))
 *     .subscribe(x => expect(x).toBe(content));
 *   aHost.aliases.set(normalize('/some'), normalize('/other');
 *
 *   // This file will not exist because /other/path does not exist.
 *   aHost.read(normalize('/some/folder/file'))
 *     .subscribe(undefined, err => expect(err.message).toMatch(/does not exist/));
 *
 *   // Create the file with new content and verify that this has the new content.
 *   aHost.write(normalize('/other/folder/file'), content2).subscribe();
 *   aHost.read(normalize('/some/folder/file'))
 *     .subscribe(x => expect(x).toBe(content2));
 */
export declare class AliasHost<StatsT extends object = {}> implements Host<StatsT> {
    protected _delegate: Host<StatsT>;
    protected _aliases: Map<Path, Path>;
    constructor(_delegate: Host<StatsT>);
    protected _resolve(path: Path): Path;
    readonly aliases: Map<Path, Path>;
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
