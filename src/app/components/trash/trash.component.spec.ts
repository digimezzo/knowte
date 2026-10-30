import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Operation } from '../../common/enums/operation';
import { Logger } from '../../common/logging/logger';
import { Note } from '../../data/entities/note';
import { CollectionService } from '../../services/collection/collection.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { TrashService } from '../../services/trash/trash.service';
import { ErrorDialogComponent } from '../dialogs/error-dialog/error-dialog.component';
import { TrashComponent } from './trash.component';

jest.mock('../../services/collection/collection.service', () => ({ CollectionService: class {} }));
jest.mock('../../services/translator/translator.service', () => ({ TranslatorService: class {} }));
jest.mock('../../common/logging/logger', () => ({ Logger: class {} }));

@Component({ templateUrl: '../../app.component.html' })
class TrashDrawerTestComponent {
    public constructor(public trash: TrashService) {}
}

describe('TrashComponent deletion', () => {
    let component: TrashComponent;
    let trash: TrashService;
    let dialog: any;
    let collection: any;
    let finishDeletion: (operation: Operation) => void;
    let failDeletion: (error: Error) => void;
    let deletionStarted: Promise<void>;

    beforeEach(() => {
        trash = new TrashService();
        dialog = { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) };
        let notifyStarted: () => void;
        deletionStarted = new Promise<void>((resolve) => (notifyStarted = resolve));
        collection = {
            deleteNotesPermanentlyAsync: jest.fn().mockImplementation(() => {
                notifyStarted();
                return new Promise<Operation>((resolve, reject) => {
                    finishDeletion = resolve;
                    failDeletion = reject;
                });
            }),
            getTrashedNotes: jest.fn().mockReturnValue([]),
            restoreNotes: jest.fn(),
            noteIsOpen: jest.fn(),
        };
        component = new TrashComponent(dialog, { getAsync: jest.fn().mockResolvedValue('text') } as any,
            collection, trash, {} as any);
        component.trashedNotes = [{ id: 'selected', title: 'Selected', isSelected: true },
            { id: 'other', isSelected: false }] as Note[];
    });

    it('stays busy and blocks toggling trash until deletion finishes', async () => {
        const openRequested = jest.fn();
        trash.openTrashRequested$.subscribe(openRequested);
        const deletion = component.deleteSelectedNotesAsync();
        await deletionStarted;

        expect(trash.isDeleting).toBe(true);
        trash.openTrash();
        expect(openRequested).not.toHaveBeenCalled();
        await component.deleteSelectedNotesAsync();
        await component.restoreSelectedNotesAsync();
        await component.openNoteAsync(component.trashedNotes[0]);
        expect(collection.deleteNotesPermanentlyAsync).toHaveBeenCalledTimes(1);
        expect(collection.deleteNotesPermanentlyAsync).toHaveBeenCalledWith(['selected']);
        expect(collection.restoreNotes).not.toHaveBeenCalled();
        expect(collection.noteIsOpen).not.toHaveBeenCalled();

        finishDeletion(Operation.Success);
        await deletion;
        expect(trash.isDeleting).toBe(false);
        expect(component.trashedNotes).toEqual([]);
        trash.openTrash();
        expect(openRequested).toHaveBeenCalledTimes(1);
    });

    it('unlocks trash and reports a deletion error', async () => {
        const deletion = component.deleteSelectedNotesAsync();
        await deletionStarted;
        finishDeletion(Operation.Error);
        await deletion;

        expect(trash.isDeleting).toBe(false);
        expect(dialog.open).toHaveBeenCalledWith(ErrorDialogComponent, expect.any(Object));
        expect(collection.getTrashedNotes).toHaveBeenCalled();
    });

    it('unlocks trash if deletion rejects unexpectedly', async () => {
        const deletion = component.deleteSelectedNotesAsync();
        await deletionStarted;
        failDeletion(new Error('Deletion failed'));

        await expect(deletion).rejects.toThrow('Deletion failed');
        expect(trash.isDeleting).toBe(false);
    });

    it('does not delete or lock trash when confirmation is cancelled', async () => {
        dialog.open.mockReturnValue({ afterClosed: () => of(false) });
        await component.deleteSelectedNotesAsync();

        expect(trash.isDeleting).toBe(false);
        expect(collection.deleteNotesPermanentlyAsync).not.toHaveBeenCalled();
    });

    it('shows a progress ring and prevents backdrop and Escape closing until deletion finishes', async () => {
        await TestBed.configureTestingModule({
            declarations: [TrashComponent, TrashDrawerTestComponent],
            imports: [FormsModule, ScrollingModule, MatButtonModule, MatCheckboxModule, MatProgressSpinnerModule,
                MatSidenavModule, MatTooltipModule, NoopAnimationsModule, TranslateModule.forRoot()],
            providers: [
                { provide: TrashService, useValue: trash },
                { provide: CollectionService, useValue: collection },
                { provide: MatDialog, useValue: dialog },
                { provide: TranslatorService, useValue: { getAsync: jest.fn().mockResolvedValue('text') } },
                { provide: Logger, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        const fixture = TestBed.createComponent(TrashDrawerTestComponent);
        fixture.detectChanges();
        const renderedTrash: TrashComponent = fixture.debugElement.query(By.directive(TrashComponent)).componentInstance;
        const drawerElement = fixture.debugElement.query(By.directive(MatDrawer));
        const drawer: MatDrawer = drawerElement.componentInstance;
        renderedTrash.trashedNotes = component.trashedNotes;
        const opening = drawer.open();
        fixture.detectChanges();
        await opening;
        await fixture.whenStable();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();

        const deletion = renderedTrash.deleteSelectedNotesAsync();
        await deletionStarted;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.app-trash__title mat-spinner')).toBeNull();
        expect(fixture.debugElement.query(By.css('.app-trash__progress mat-spinner')).componentInstance.diameter).toBe(100);
        expect(fixture.nativeElement.querySelector('.app-trash__buttons button mat-spinner')).toBeNull();
        expect(fixture.nativeElement.querySelector('.app-trash__buttons .la-trash-alt')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.app-trash').getAttribute('aria-busy')).toBe('true');
        expect(drawer.disableClose).toBe(true);
        fixture.debugElement.queryAll(By.css('.app-trash button, .app-trash input[type="checkbox"]'))
            .forEach((control) => expect(control.nativeElement.disabled).toBe(true));
        fixture.nativeElement.querySelector('.mat-drawer-backdrop').click();
        drawerElement.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
        await fixture.whenStable();
        expect(drawer.opened).toBe(true);

        finishDeletion(Operation.Success);
        await deletion;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
        expect(drawer.disableClose).toBe(false);
        fixture.nativeElement.querySelector('.mat-drawer-backdrop').click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(drawer.opened).toBe(false);
    });
});