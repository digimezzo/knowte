import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { Injector, TemplateRef } from '@angular/core';
import { Location } from '@angular/common';
import { MatBottomSheetConfig } from './bottom-sheet-config';
import { MatBottomSheetRef } from './bottom-sheet-ref';
/**
 * Service to trigger Material Design bottom sheets.
 */
export declare class MatBottomSheet {
    private _overlay;
    private _injector;
    private _parentBottomSheet;
    private _location;
    private _bottomSheetRefAtThisLevel;
    /** Reference to the currently opened bottom sheet. */
    _openedBottomSheetRef: MatBottomSheetRef<any> | null;
    constructor(_overlay: Overlay, _injector: Injector, _parentBottomSheet: MatBottomSheet, _location?: Location | undefined);
    open<T, D = any, R = any>(component: ComponentType<T>, config?: MatBottomSheetConfig<D>): MatBottomSheetRef<T, R>;
    open<T, D = any, R = any>(template: TemplateRef<T>, config?: MatBottomSheetConfig<D>): MatBottomSheetRef<T, R>;
    /**
     * Dismisses the currently-visible bottom sheet.
     */
    dismiss(): void;
    /**
     * Attaches the bottom sheet container component to the overlay.
     */
    private _attachContainer(overlayRef, config);
    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified bottom sheet config.
     */
    private _createOverlay(config);
    /**
     * Creates an injector to be used inside of a bottom sheet component.
     * @param config Config that was used to create the bottom sheet.
     * @param bottomSheetRef Reference to the bottom sheet.
     */
    private _createInjector<T>(config, bottomSheetRef);
}
