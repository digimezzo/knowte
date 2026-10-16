import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { Subject } from 'rxjs';
import { Constants } from '../../common/application/constants';
import { Operation } from '../../common/enums/operation';
import { Logger } from '../../common/logging/logger';
import { BaseSettings } from '../../common/settings/base-settings';
import { Notebook } from '../../data/entities/notebook';
import { BaseAppearanceService } from '../../services/appearance/base-appearance.service';
import { CollectionService } from '../../services/collection/collection.service';
import { FileService } from '../../services/file/file.service';
import { SnackBarService } from '../../services/snack-bar/snack-bar.service';
import { TranslatorService } from '../../services/translator/translator.service';
import { UpdateService } from '../../services/update/update.service';
import { CollectionComponent } from './collection.component';
import { NoteCreator } from './note-creator';

jest.mock('@electron/remote', () => ({ getGlobal: jest.fn() }));
jest.mock('electron', () => ({ ipcRenderer: {} }));
jest.mock('nanoid', () => ({ nanoid: () => 'notebook-id' }));
jest.mock('../../common/utils/date-utils', () => ({ DateUtils: class {} }));
jest.mock('../../services/collection/note-date-formatter', () => ({ NoteDateFormatter: class {} }));

describe('CollectionComponent notebook archiving', () => {
    let fixture: ComponentFixture<CollectionComponent>;
    let component: CollectionComponent;
    let settings: { showArchivedNotebooks: boolean; notebooksPaneWidth: number };
    let archived: Notebook;
    let regular: Notebook;
    let allNotes: Notebook;
    let notebookEdited: Subject<void>;
    let archive: jest.Mock;
    let openDialog: jest.Mock;

    beforeEach(async () => {
        settings = { showArchivedNotebooks: false, notebooksPaneWidth: 300 };
        allNotes = new Notebook('All notes');
        allNotes.id = Constants.allNotesNotebookId;
        allNotes.isDefault = true;
        const unfiled = new Notebook('Unfiled notes');
        unfiled.id = Constants.unfiledNotesNotebookId;
        unfiled.isDefault = true;
        regular = new Notebook('Regular notebook');
        regular.id = 'regular';
        archived = new Notebook('Old notebook');
        archived.id = 'archived';
        archived.isArchived = true;
        notebookEdited = new Subject<void>();
        archive = jest.fn().mockImplementation(async (ids: string[], isArchived: boolean) => {
            for (const notebook of [regular, archived]) {
                if (ids.includes(notebook.id)) {
                    notebook.isArchived = isArchived;
                }
            }
            notebookEdited.next();
            return Operation.Success;
        });
        openDialog = jest.fn();

        await TestBed.configureTestingModule({
            declarations: [CollectionComponent],
            imports: [TranslateModule.forRoot(), MatTooltipModule, NoopAnimationsModule, AngularSplitModule],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: BaseAppearanceService, useValue: {} },
                { provide: BaseSettings, useValue: settings },
                { provide: CollectionService, useValue: {
                    initializeAsync: jest.fn().mockResolvedValue(undefined),
                    getNotebooksAsync: jest.fn(async () => [allNotes, unfiled, ...[regular, archived]
                        .filter((notebook) => settings.showArchivedNotebooks || !notebook.isArchived)]),
                    setNotebooksArchivedAsync: archive,
                    notebookEdited$: notebookEdited,
                    notebookDeleted$: new Subject(),
                    notesCountChanged$: new Subject(),
                    noteMarkChanged$: new Subject(),
                } },
                { provide: TranslatorService, useValue: { getAsync: jest.fn().mockResolvedValue('Archive failed') } },
                { provide: SnackBarService, useValue: {} },
                { provide: UpdateService, useValue: { checkForUpdatesAsync: jest.fn() } },
                { provide: FileService, useValue: {} },
                { provide: MatBottomSheet, useValue: {} },
                { provide: NoteCreator, useValue: {} },
                { provide: MatDialog, useValue: { open: openDialog } },
                { provide: Logger, useValue: {} },
            ],
        }).overrideComponent(CollectionComponent, { set: { styleUrls: [] } }).compileComponents();

        fixture = TestBed.createComponent(CollectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    afterEach(() => fixture?.destroy());

    it('toggles archived visibility using the notebook heading icon', async () => {
        expect(fixture.nativeElement.textContent).not.toContain('Old notebook');
        const toggle = fixture.debugElement.query(By.css('.notebooks-archive-toggle'));
        const button: HTMLButtonElement = toggle.nativeElement;
        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect(button.getAttribute('aria-label')).toBe('NotebookArchive.ShowArchived');
        expect(toggle.injector.get(MatTooltip).message).toBe('NotebookArchive.ShowArchived');
        expect(button.classList.contains('notebooks-archive-toggle--active')).toBe(false);
        button.click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(settings.showArchivedNotebooks).toBe(true);
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(button.getAttribute('aria-label')).toBe('NotebookArchive.HideArchived');
        expect(toggle.injector.get(MatTooltip).message).toBe('NotebookArchive.HideArchived');
        expect(button.classList.contains('notebooks-archive-toggle--active')).toBe(true);
        expect(component.notebooksCount).toBe(2);
        const archiveIcon: HTMLElement = fixture.nativeElement.querySelector('.notebook-archive-icon');
        expect(archiveIcon.classList.contains('la-archive')).toBe(true);
        expect(archiveIcon.getAttribute('aria-label')).toBe('NotebookArchive.Archived');
        expect(archiveIcon.textContent).toBe('');
        expect(fixture.nativeElement.textContent).toContain('Old notebook');

        component.setSelectedNotebooks(archived);
        button.click();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(settings.showArchivedNotebooks).toBe(false);
        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect(button.getAttribute('aria-label')).toBe('NotebookArchive.ShowArchived');
        expect(button.classList.contains('notebooks-archive-toggle--active')).toBe(false);
        expect(component.activeNotebook.id).toBe(Constants.allNotesNotebookId);
        expect(component.canRenameNotebook).toBe(false);
        expect(component.canDeleteNotebooks).toBe(false);
        expect(component.canUnarchiveNotebooks).toBe(false);
        expect(fixture.nativeElement.textContent).not.toContain('Old notebook');
    });

    it('archives a selected notebook and resets selection to All notes', async () => {
        component.setSelectedNotebooks(regular);
        fixture.detectChanges();
        fixture.nativeElement.querySelector('button[aria-label="NotebookArchive.Archive"]').click();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(archive).toHaveBeenCalledWith(['regular'], true);
        expect(component.notebooks).not.toContain(regular);
        expect(component.activeNotebook.id).toBe(Constants.allNotesNotebookId);
        expect(component.canArchiveNotebooks).toBe(false);
    });

    it('unarchives selected archived notebooks but never offers archiving for built-in notebooks', async () => {
        expect(component.canArchiveNotebooks).toBe(false);
        await component.toggleArchivedNotebooksAsync();
        component.setSelectedNotebooks(archived);
        fixture.detectChanges();
        fixture.nativeElement.querySelector('button[aria-label="NotebookArchive.Unarchive"]').click();
        await fixture.whenStable();
        await component.toggleArchivedNotebooksAsync();
        fixture.detectChanges();

        expect(archive).toHaveBeenCalledWith(['archived'], false);
        expect(component.notebooks).toContain(archived);
        expect(archived.isArchived).toBe(false);
    });

    it('shows an error dialog when archiving fails', async () => {
        archive.mockResolvedValueOnce(Operation.Error);
        component.setSelectedNotebooks(regular);
        await component.setNotebooksArchivedAsync(true);

        expect(openDialog).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            data: { errorText: 'Archive failed' },
        }));
        expect(component.notebooks).toContain(regular);
    });

    it.each([
        [false, 'Archive', 'ArchiveNotebooks'],
        [true, 'Unarchive', 'UnarchiveNotebooks'],
    ])('uses singular and plural archive tooltips for archived=%s', async (isArchived, singular, plural) => {
        await component.toggleArchivedNotebooksAsync();
        regular.isArchived = isArchived;
        archived.isArchived = isArchived;
        component.setSelectedNotebooks(regular);
        fixture.detectChanges();

        const singleButton = fixture.debugElement.query(By.css(`button[aria-label="NotebookArchive.${singular}"]`));
        expect(singleButton.injector.get(MatTooltip).message).toBe(`NotebookArchive.${singular}`);

        component.setSelectedNotebooks(archived, { ctrlKey: true } as MouseEvent);
        fixture.detectChanges();

        const multipleButton = fixture.debugElement.query(By.css(`button[aria-label="NotebookArchive.${plural}"]`));
        expect(multipleButton.injector.get(MatTooltip).message).toBe(`NotebookArchive.${plural}`);
    });
});
