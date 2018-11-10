import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { ErrorDialogComponent } from './components/dialogs/errorDialog/errorDialog.component';
import log from 'electron-log';
import { remote, BrowserWindow } from 'electron';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private injector: Injector) { }
    handleError(error) {
        log.error(`Handling global error. Cause: ${error}.`);
        this.showGlobalErrorDialog();
    }

    showGlobalErrorDialog(): void {
        log.info("Showing global error dialog");

        let dialog: MatDialog = this.injector.get(MatDialog);
        let zone: NgZone = this.injector.get(NgZone);

        zone.run(() => {
            let dialogRef: MatDialogRef<ErrorDialogComponent> = dialog.open(ErrorDialogComponent, {
                // TranslationService is not able to provide the translation of texts in this class.
                // So we use a workaround where the translation happens in the error dialog itself.
                width: '450px', data: { isGlobalError: true }
            });
        
            dialogRef.afterClosed().subscribe(result => {
                // Quit the application
                log.info("Closing application");
                let win: BrowserWindow = remote.getCurrentWindow();
                win.close();
            });
        });
      }
}