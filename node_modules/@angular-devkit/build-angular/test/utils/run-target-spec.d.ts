/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuildEvent, TargetSpecifier } from '@angular-devkit/architect';
import { logging } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { TestProjectHost } from '../utils/test-project-host';
export declare const workspaceRoot: string & {
    __PRIVATE_DEVKIT_PATH: void;
};
export declare const host: TestProjectHost;
export declare const outputPath: string & {
    __PRIVATE_DEVKIT_PATH: void;
};
export declare const browserTargetSpec: {
    project: string;
    target: string;
};
export declare const devServerTargetSpec: {
    project: string;
    target: string;
};
export declare const extractI18nTargetSpec: {
    project: string;
    target: string;
};
export declare const karmaTargetSpec: {
    project: string;
    target: string;
};
export declare const tslintTargetSpec: {
    project: string;
    target: string;
};
export declare const protractorTargetSpec: {
    project: string;
    target: string;
};
export declare function runTargetSpec(host: TestProjectHost, targetSpec: TargetSpecifier, overrides?: {}, logger?: logging.Logger): Observable<BuildEvent>;
