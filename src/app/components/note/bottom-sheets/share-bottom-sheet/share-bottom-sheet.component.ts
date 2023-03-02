import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import * as remote from '@electron/remote';
import { SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import { Logger } from '../../../../core/logger';
import { Utils } from '../../../../core/utils';
import { PersistanceService } from '../../../../services/persistance/persistance.service';
import { PrintService } from '../../../../services/print/print.service';
import { SnackBarService } from '../../../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../../../services/translator/translator.service';
import { ErrorDialogComponent } from '../../../dialogs/error-dialog/error-dialog.component';

@Component({
    selector: 'app-share-bottom-sheet',
    styleUrls: ['./share-bottom-sheet.component.scss'],
    templateUrl: 'share-bottom-sheet.component.html',
})
export class ShareBottomSheetComponent {
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private data: any,
        private bottomSheetRef: MatBottomSheetRef<ShareBottomSheetComponent>,
        private print: PrintService,
        private translator: TranslatorService,
        private persistance: PersistanceService,
        private snackBar: SnackBarService,
        private dialog: MatDialog,
        private logger: Logger
    ) {}

    public async exportNoteToPdfAsync(): Promise<void> {
        this.bottomSheetRef.dismiss();
        const options: SaveDialogOptions = { defaultPath: Utils.getPdfExportPath(remote.app.getPath('documents'), this.data.noteTitle) };
        const saveDialogReturnValue: SaveDialogReturnValue = await remote.dialog.showSaveDialog(undefined, options);

        if (saveDialogReturnValue.filePath != undefined) {
            await this.print.exportToPdfAsync(
                saveDialogReturnValue.filePath,
                this.data.noteTitle,
                this.data.noteHtml,
                this.data.isMarkdownNote
            );
        }
    }

    public async printNoteAsync(): Promise<void> {
        this.bottomSheetRef.dismiss();
        await this.print.printAsync(this.data.noteTitle, this.data.noteHtml, this.data.isMarkdownNote);
    }

    public async exportNoteAsync(): Promise<void> {
        this.bottomSheetRef.dismiss();
        const options: SaveDialogOptions = { defaultPath: Utils.getNoteExportPath(remote.app.getPath('documents'), this.data.noteTitle) };
        const saveDialogReturnValue: SaveDialogReturnValue = await remote.dialog.showSaveDialog(undefined, options);

        try {
            if (saveDialogReturnValue.filePath != undefined && saveDialogReturnValue.filePath.length > 0) {
                await this.persistance.exportNoteAsync(
                    saveDialogReturnValue.filePath,
                    this.data.noteTitle,
                    this.data.noteText,
                    this.data.noteContent,
                    this.data.isMarkdownNote
                );
                this.snackBar.noteExportedAsync(this.data.noteTitle);
            }
        } catch (error) {
            this.logger.error(
                `An error occurred while exporting the note with title '${this.data.noteTitle}'. Cause: ${error}`,
                'ShareBottomSheetComponent',
                'exportNoteAsync'
            );

            const errorText: string = await this.translator.getAsync('ErrorTexts.ExportNoteError', { noteTitle: this.data.noteTitle });

            this.dialog.open(ErrorDialogComponent, {
                width: '450px',
                data: { errorText: errorText },
            });
        }
    }
}
