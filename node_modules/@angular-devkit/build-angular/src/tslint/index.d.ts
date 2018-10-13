/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Observable } from 'rxjs';
export interface TslintBuilderOptions {
    tslintConfig?: string;
    tsConfig?: string | string[];
    fix: boolean;
    typeCheck: boolean;
    force: boolean;
    silent: boolean;
    format: string;
    exclude: string[];
    files: string[];
}
export declare class TslintBuilder implements Builder<TslintBuilderOptions> {
    context: BuilderContext;
    constructor(context: BuilderContext);
    run(builderConfig: BuilderConfiguration<TslintBuilderOptions>): Observable<BuildEvent>;
}
export default TslintBuilder;
