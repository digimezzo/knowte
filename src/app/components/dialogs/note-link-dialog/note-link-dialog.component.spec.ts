import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogClose, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { By } from '@angular/platform-browser';
import { NoteLinkTarget } from '../../../services/results/note-link-targets-result';
import { NoteLinkDialogComponent } from './note-link-dialog.component';

describe('Note link picker', () => {
    let fixture: ComponentFixture<NoteLinkDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NoteLinkDialogComponent],
            imports: [
                FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
                MatListModule, NoopAnimationsModule, TranslateModule.forRoot(),
                ScrollingModule,
            ],
            providers: [{
                provide: MAT_DIALOG_DATA,
                useValue: [
                    { id: 'first', title: 'Same title', notebookName: 'Projects' },
                    { id: 'second', title: 'Same title', notebookName: 'Ideas' },
                ],
            }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(NoteLinkDialogComponent);
        fixture.detectChanges();
    });

    async function renderViewport(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    it('shows notebook names without internal IDs', async () => {
        await renderViewport();
        const text = fixture.nativeElement.textContent;
        expect(text).toContain('Projects');
        expect(text).toContain('Ideas');
        expect(text).not.toContain('first');
        expect(text).not.toContain('second');
        expect(fixture.nativeElement.querySelectorAll('button[mat-list-item]')).toHaveLength(2);
    });

    it('filters case-insensitively by notebook and shows an empty state', async () => {
        fixture.componentInstance.searchText = ' PROJECTS ';
        await renderViewport();
        expect(fixture.nativeElement.querySelectorAll('button[mat-list-item]')).toHaveLength(1);
        fixture.componentInstance.searchText = 'unmatched';
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('button[mat-list-item]')).toHaveLength(0);
        expect(fixture.nativeElement.textContent).toContain('NoteLinks.NoNotes');
    });

    it('does not refilter notes during change detection', async () => {
        fixture.componentInstance.searchText = 'Same title';
        const filtered = fixture.componentInstance.filteredNotes;
        await renderViewport();
        fixture.detectChanges();
        expect(fixture.componentInstance.filteredNotes).toBe(filtered);
        fixture.componentInstance.searchText = '';
        expect(fixture.componentInstance.filteredNotes).toBe(fixture.componentInstance.notes);
    });

    it.each(['itl', 'TITLE', 'ject', 'title same', 'itl ject', '  TITLE   same  '])(
        'matches text anywhere and unordered search words through the input: %s',
        async (query) => {
            const input: HTMLInputElement = fixture.nativeElement.querySelector('.notes-content-search-input');
            input.value = query;
            input.dispatchEvent(new Event('input'));
            await renderViewport();
            const rows: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button[mat-list-item]');
            expect(rows.length).toBeGreaterThan(0);
            expect(rows[0].textContent).toContain('Same title');
            expect(rows[0].textContent).toContain('Projects');
        },
    );

    it('renders a bounded number of rows for 10,000 notes and can find the last note', async () => {
        const notes: NoteLinkTarget[] = Array.from({ length: 10000 }, (_, index) => ({
            id: `note-${index}`,
            title: `Note ${index}`,
            notebookName: 'Notebook',
        }));
        fixture.componentInstance.notes = notes;
        fixture.componentInstance.searchText = '';
        const viewport = fixture.debugElement.query(By.directive(CdkVirtualScrollViewport))
            .injector.get(CdkVirtualScrollViewport);
        jest.spyOn(viewport.elementRef.nativeElement, 'clientHeight', 'get').mockReturnValue(320);
        viewport.checkViewportSize();
        await renderViewport();
        const rows = fixture.nativeElement.querySelectorAll('button[mat-list-item]');
        expect(rows.length).toBeGreaterThan(0);
        expect(rows.length).toBeLessThan(30);
        expect(fixture.componentInstance.filteredNotes).toHaveLength(10000);

        fixture.componentInstance.searchText = 'Note 9999';
        await renderViewport();
        expect(fixture.nativeElement.querySelectorAll('button[mat-list-item]')).toHaveLength(1);
        expect(fixture.nativeElement.textContent).toContain('Note 9999');
        const close = fixture.debugElement.query(By.directive(MatDialogClose)).injector.get(MatDialogClose);
        expect(close.dialogResult).toBe(notes[9999]);
    });

    it('shows the main-window search design and clears the query without closing the picker', async () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('.notes-content-search-input');
        expect(input.getAttribute('aria-label')).toBe('NoteLinks.Search');
        expect(fixture.nativeElement.querySelector('.la-search')).not.toBeNull();
        input.value = 'Projects';
        input.dispatchEvent(new Event('input'));
        await renderViewport();
        expect(fixture.nativeElement.querySelector('.notes-content-search-highlight')).not.toBeNull();
        expect(fixture.nativeElement.querySelectorAll('button[mat-list-item]')).toHaveLength(1);

        fixture.nativeElement.querySelector('button.notes-content-search-icons').click();
        await renderViewport();
        expect(input.value).toBe('');
        expect(document.activeElement).toBe(input);
        expect(fixture.nativeElement.querySelectorAll('button[mat-list-item]')).toHaveLength(2);
        expect(fixture.nativeElement.querySelector('.la-search')).not.toBeNull();
    });
});
