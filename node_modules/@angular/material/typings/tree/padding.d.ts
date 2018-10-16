/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkTreeNodePadding } from '@angular/cdk/tree';
export declare const _CdkTreeNodePadding: typeof CdkTreeNodePadding;
/**
 * Wrapper for the CdkTree padding with Material design styles.
 */
export declare class MatTreeNodePadding<T> extends _CdkTreeNodePadding<T> {
    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    level: number;
    /** The indent for each level. Default number 40px from material design menu sub-menu spec. */
    indent: number;
}
