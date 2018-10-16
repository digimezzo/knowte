import { CdkTree, CdkTreeNode } from './tree';
/**
 * Node toggle to expand/collapse the node.
 */
export declare class CdkTreeNodeToggle<T> {
    protected _tree: CdkTree<T>;
    protected _treeNode: CdkTreeNode<T>;
    /** Whether expand/collapse the node recursively. */
    recursive: boolean;
    protected _recursive: boolean;
    constructor(_tree: CdkTree<T>, _treeNode: CdkTreeNode<T>);
    _toggle(event: Event): void;
}
