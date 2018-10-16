import { OverlayRef } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { DialogPosition } from './dialog-config';
import { MatDialogContainer } from './dialog-container';
/**
 * Reference to a dialog opened via the MatDialog service.
 */
export declare class MatDialogRef<T, R = any> {
    private _overlayRef;
    _containerInstance: MatDialogContainer;
    readonly id: string;
    /** The instance of component opened into the dialog. */
    componentInstance: T;
    /** Whether the user is allowed to close the dialog. */
    disableClose: boolean | undefined;
    /** Subject for notifying the user that the dialog has finished opening. */
    private readonly _afterOpen;
    /** Subject for notifying the user that the dialog has finished closing. */
    private readonly _afterClosed;
    /** Subject for notifying the user that the dialog has started closing. */
    private readonly _beforeClose;
    /** Result to be passed to afterClosed. */
    private _result;
    /** Subscription to changes in the user's location. */
    private _locationChanges;
    constructor(_overlayRef: OverlayRef, _containerInstance: MatDialogContainer, location?: Location, id?: string);
    /**
     * Close the dialog.
     * @param dialogResult Optional result to return to the dialog opener.
     */
    close(dialogResult?: R): void;
    /**
     * Gets an observable that is notified when the dialog is finished opening.
     */
    afterOpen(): Observable<void>;
    /**
     * Gets an observable that is notified when the dialog is finished closing.
     */
    afterClosed(): Observable<R | undefined>;
    /**
     * Gets an observable that is notified when the dialog has started closing.
     */
    beforeClose(): Observable<R | undefined>;
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     */
    backdropClick(): Observable<MouseEvent>;
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents(): Observable<KeyboardEvent>;
    /**
     * Updates the dialog's position.
     * @param position New dialog position.
     */
    updatePosition(position?: DialogPosition): this;
    /**
     * Updates the dialog's width and height.
     * @param width New width of the dialog.
     * @param height New height of the dialog.
     */
    updateSize(width?: string, height?: string): this;
    /** Fetches the position strategy object from the overlay ref. */
    private _getPositionStrategy();
}
