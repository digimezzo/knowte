import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Scheduler } from '../../../common/scheduling/scheduler';
import { Notebook } from '../../../data/entities/notebook';
import { CollectionClient } from '../../../services/collection/collection.client';
import { TranslatorService } from '../../../services/translator/translator.service';
import { NotebookSwitcherComponent } from './notebook-switcher.component';

describe('NotebookSwitcherComponent', () => {
    const defaultNotebook: Notebook = { id: '1', name: 'Default', isDefault: true, isSelected: false };
    const newNotebook: Notebook = { id: '2', name: 'New notebook', isDefault: false, isSelected: false };
    let fixture: ComponentFixture<NotebookSwitcherComponent>;
    let component: NotebookSwitcherComponent;
    let menuTrigger: MatMenuTrigger;
    let overlayContainer: OverlayContainer;
    let resolveNotebooks: (notebooks: Notebook[]) => void;
    let getNotebooksAsync: jest.Mock;
    let setNotebook: jest.Mock;

    beforeEach(async () => {
        setNotebook = jest.fn();
        getNotebooksAsync = jest.fn().mockImplementation(
            () => new Promise<Notebook[]>((resolve) => (resolveNotebooks = resolve))
        );

        await TestBed.configureTestingModule({
            declarations: [NotebookSwitcherComponent],
            imports: [MatMenuModule, MatTooltipModule, NoopAnimationsModule, TranslateModule.forRoot()],
            providers: [
                {
                    provide: CollectionClient,
                    useValue: {
                        getNotebooksAsync,
                        setNotebook,
                        getNoteDetailsAsync: jest.fn().mockResolvedValue({ notebookName: 'Default' }),
                        notebookChanged$: new Subject(),
                    },
                },
                { provide: TranslatorService, useValue: { languageChanged$: new Subject() } },
                { provide: Scheduler, useValue: {} },
            ],
        })
            .overrideComponent(NotebookSwitcherComponent, { set: { styleUrls: [] } })
            .compileComponents();

        fixture = TestBed.createComponent(NotebookSwitcherComponent);
        component = fixture.componentInstance;
        component.noteId = 'note-id';
        fixture.detectChanges();
        menuTrigger = fixture.debugElement.query(By.directive(MatMenuTrigger)).injector.get(MatMenuTrigger);
        overlayContainer = TestBed.inject(OverlayContainer);
        await fixture.whenStable();
    });

    afterEach(() => {
        fixture.destroy();
        overlayContainer.ngOnDestroy();
    });

    it('renders notebooks before opening the menu on the first click', async () => {
        const notebooks = [defaultNotebook, { ...newNotebook, name: 'A notebook with a longer name' }];
        const originalOpenMenu = menuTrigger.openMenu.bind(menuTrigger);
        const openMenu = jest.spyOn(menuTrigger, 'openMenu').mockImplementation(() => {
            originalOpenMenu();
            expect(overlayContainer.getContainerElement().querySelectorAll('button[mat-menu-item]').length).toBe(notebooks.length);
        });

        fixture.nativeElement.querySelector('.window-button').click();

        expect(getNotebooksAsync).toHaveBeenCalledTimes(1);
        expect(openMenu).not.toHaveBeenCalled();

        resolveNotebooks(notebooks);
        await fixture.whenStable();

        expect(component.notebooks).toEqual(notebooks);
        expect(openMenu).toHaveBeenCalledTimes(1);
    });

    it('refreshes and renders notebooks before reopening the menu', async () => {
        const originalOpenMenu = menuTrigger.openMenu.bind(menuTrigger);
        const openMenu = jest.spyOn(menuTrigger, 'openMenu').mockImplementation(() => {
            originalOpenMenu();
            expect(overlayContainer.getContainerElement().querySelectorAll('button[mat-menu-item]').length).toBe(component.notebooks.length);
        });

        const firstOpen = component.openNotebooksMenuAsync(menuTrigger);
        resolveNotebooks([defaultNotebook]);
        await firstOpen;
        menuTrigger.closeMenu();
        await fixture.whenStable();

        const secondOpen = component.openNotebooksMenuAsync(menuTrigger);
        expect(openMenu).toHaveBeenCalledTimes(1);
        resolveNotebooks([defaultNotebook, newNotebook]);
        await secondOpen;

        expect(getNotebooksAsync).toHaveBeenCalledTimes(2);
        expect(openMenu).toHaveBeenCalledTimes(2);
    });

    it('still changes the notebook and closes the menu when an item is selected', async () => {
        const opening = component.openNotebooksMenuAsync(menuTrigger);
        resolveNotebooks([defaultNotebook, newNotebook]);
        await opening;

        const items = overlayContainer.getContainerElement().querySelectorAll<HTMLElement>('.menu-item');
        items[1].click();
        await fixture.whenStable();

        expect(setNotebook).toHaveBeenCalledWith(newNotebook.id, [component.noteId]);
        expect(menuTrigger.menuOpen).toBe(false);
    });

    it('does not issue duplicate requests while notebooks are loading', async () => {
        const openMenu = jest.spyOn(menuTrigger, 'openMenu').mockImplementation(() => {});
        const opening = component.openNotebooksMenuAsync(menuTrigger);
        await component.openNotebooksMenuAsync(menuTrigger);

        expect(getNotebooksAsync).toHaveBeenCalledTimes(1);
        resolveNotebooks([]);
        await opening;
        expect(openMenu).toHaveBeenCalledTimes(1);
    });

    it('does not open the menu after the component is destroyed', async () => {
        const openMenu = jest.spyOn(menuTrigger, 'openMenu');
        const opening = component.openNotebooksMenuAsync(menuTrigger);
        fixture.destroy();
        resolveNotebooks([]);
        await opening;

        expect(openMenu).not.toHaveBeenCalled();
    });

    it('propagates load failures and allows a later retry', async () => {
        const error = new Error('Failed to load notebooks');
        getNotebooksAsync.mockRejectedValueOnce(error);
        const openMenu = jest.spyOn(menuTrigger, 'openMenu').mockImplementation(() => {});

        await expect(component.openNotebooksMenuAsync(menuTrigger)).rejects.toThrow(error);
        expect(openMenu).not.toHaveBeenCalled();

        const retry = component.openNotebooksMenuAsync(menuTrigger);
        resolveNotebooks([]);
        await retry;
        expect(openMenu).toHaveBeenCalledTimes(1);
    });
});
