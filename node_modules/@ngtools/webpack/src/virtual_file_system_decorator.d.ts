/// <reference types="node" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Stats } from 'fs';
import { WebpackCompilerHost } from './compiler_host';
import { Callback, InputFileSystem, NodeWatchFileSystemInterface } from './webpack';
export declare const NodeWatchFileSystem: NodeWatchFileSystemInterface;
export declare class VirtualFileSystemDecorator implements InputFileSystem {
    private _inputFileSystem;
    private _webpackCompilerHost;
    constructor(_inputFileSystem: InputFileSystem, _webpackCompilerHost: WebpackCompilerHost);
    private _readFileSync(path);
    private _statSync(path);
    getVirtualFilesPaths(): string[];
    stat(path: string, callback: Callback<Stats>): void;
    readdir(path: string, callback: Callback<string[]>): void;
    readFile(path: string, callback: Callback<string>): void;
    readJson(path: string, callback: Callback<{}>): void;
    readlink(path: string, callback: Callback<string>): void;
    statSync(path: string): Stats;
    readdirSync(path: string): string[];
    readFileSync(path: string): string;
    readJsonSync(path: string): string;
    readlinkSync(path: string): string;
    purge(changes?: string[] | string): void;
}
export declare class VirtualWatchFileSystemDecorator extends NodeWatchFileSystem {
    private _virtualInputFileSystem;
    constructor(_virtualInputFileSystem: VirtualFileSystemDecorator);
    watch(files: any, dirs: any, missing: any, startTime: any, options: any, callback: any, callbackUndelayed: any): any;
}
