/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkNestedTreeNode, CdkTree, CdkTreeNode, CdkTreeNodeDef } from '@angular/cdk/tree';
import { AfterContentInit, ElementRef, IterableDiffers, OnDestroy, QueryList } from '@angular/core';
import { CanDisable, HasTabIndex } from '@angular/material/core';
import { MatTreeNodeOutlet } from './outlet';
export declare const _CdkTreeNodeDef: typeof CdkTreeNodeDef;
export declare const _MatTreeNodeMixinBase: (new (...args: any[]) => HasTabIndex) & (new (...args: any[]) => CanDisable) & typeof CdkTreeNode;
export declare const _MatNestedTreeNodeMixinBase: (new (...args: any[]) => HasTabIndex) & (new (...args: any[]) => CanDisable) & typeof CdkNestedTreeNode;
/**
 * Wrapper for the CdkTree node with Material design styles.
 */
export declare class MatTreeNode<T> extends _MatTreeNodeMixinBase<T> implements CanDisable, HasTabIndex {
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T>;
    role: 'treeitem' | 'group';
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T>, tabIndex: string);
}
/**
 * Wrapper for the CdkTree node definition with Material design styles.
 */
export declare class MatTreeNodeDef<T> extends _CdkTreeNodeDef<T> {
    data: T;
}
/**
 * Wrapper for the CdkTree nested node with Material design styles.
 */
export declare class MatNestedTreeNode<T> extends _MatNestedTreeNodeMixinBase<T> implements AfterContentInit, CanDisable, HasTabIndex, OnDestroy {
    protected _elementRef: ElementRef<HTMLElement>;
    protected _tree: CdkTree<T>;
    protected _differs: IterableDiffers;
    node: T;
    nodeOutlet: QueryList<MatTreeNodeOutlet>;
    constructor(_elementRef: ElementRef<HTMLElement>, _tree: CdkTree<T>, _differs: IterableDiffers, tabIndex: string);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
}
