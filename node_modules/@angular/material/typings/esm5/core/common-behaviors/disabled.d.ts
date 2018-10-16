import { Constructor } from './constructor';
/** @docs-private */
export interface CanDisable {
    /** Whether the component is disabled. */
    disabled: boolean;
}
/** Mixin to augment a directive with a `disabled` property. */
export declare function mixinDisabled<T extends Constructor<{}>>(base: T): Constructor<CanDisable> & T;
