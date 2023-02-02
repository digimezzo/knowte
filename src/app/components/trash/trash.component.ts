import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Operation } from '../../core/enums';
import { Logger } from '../../core/logger';
import { Note } from '../../data/entities/note';
import { CollectionService } from '../../services/collection/collection.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { TrashService } from '../../services/trash/trash.service';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';

@Component({
    selector: 'app-trash',
    templateUrl: './trash.component.html',
    styleUrls: ['./trash.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TrashComponent implements OnInit, OnDestroy {
    private subscription: Subscription = new Subscription();

    constructor(
        private dialog: MatDialog,
        private translator: TranslatorService,
        public collectionService: CollectionService,
        public trash: TrashService,
        private logger: Logger
    ) {}

    public activeCollection: string = '';
    public trashedNotes: Note[] = [];

    public get hasSelectedTrashedNotes(): boolean {
        return this.trashedNotes.some((x) => x.isSelected);
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public ngOnInit(): void {
        this.subscription.add(
            this.trash.openTrashRequested$.subscribe(() => {
                this.activeCollection = this.collectionService.getActiveCollection();
                this.trashedNotes = this.collectionService.getTrashedNotes();
            })
        );
    }

    public changeNoteSelection(trashedNote: Note, event: MatCheckboxChange): void {
        trashedNote.isSelected = event.checked;
    }

    public selectAllNotes(event: MatCheckboxChange): void {
        if (event.checked) {
            for (const trashedNote of this.trashedNotes) {
                trashedNote.isSelected = true;
            }
        }
    }

    public async deleteSelectedNotesAsync(): Promise<void> {
        const title: string = await this.translator.getAsync('DialogTitles.ConfirmDeleteNotes');
        const text: string = await this.translator.getAsync('DialogTexts.ConfirmPermanentlyDeleteNotes');

        const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
            width: '450px',
            data: { dialogTitle: title, dialogText: text },
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                const noteIdsToDelete: string[] = this.trashedNotes.filter((x) => x.isSelected).map((x) => x.id);

                if (noteIdsToDelete.length > 0) {
                    const operation: Operation = await this.collectionService.deleteNotesPermanentlyAsync(noteIdsToDelete);

                    if (operation === Operation.Error) {
                        const errorText: string = await this.translator.getAsync('ErrorTexts.DeleteNotesError');
                        this.dialog.open(ErrorDialogComponent, {
                            width: '450px',
                            data: { errorText: errorText },
                        });
                    }

                    this.trashedNotes = this.collectionService.getTrashedNotes();
                }
            }
        });
    }

    public async restoreSelectedNotesAsync(): Promise<void> {
        const noteIdsToRestore: string[] = this.trashedNotes.filter((x) => x.isSelected).map((x) => x.id);

        if (noteIdsToRestore.length > 0) {
            const operation: Operation = this.collectionService.restoreNotes(noteIdsToRestore);

            if (operation === Operation.Error) {
                const errorText: string = await this.translator.getAsync('ErrorTexts.RestoreNotesError');
                this.dialog.open(ErrorDialogComponent, {
                    width: '450px',
                    data: { errorText: errorText },
                });
            }

            this.trashedNotes = this.collectionService.getTrashedNotes();
        }
    }

    public async openNoteAsync(note: Note): Promise<void> {
        if (!this.collectionService.noteIsOpen(note.id)) {
            this.logger.info(`Opening note with id=${note.id}`, 'NotesComponent', 'openNoteAsync');
            await this.collectionService.setNoteOpenAsync(note.id, true);
        } else {
            this.logger.info(`Note with id=${note.id} is already open. Focusing.`, 'NotesComponent', 'openNoteAsync');
            this.collectionService.onFocusNote(note.id);
        }
    }
}
