import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { readFileSync } from 'fs';
import { compileString } from 'sass';
import { ActionsBottomSheetComponent, NoteAction, NoteActionsData } from './actions-bottom-sheet.component';

describe('ActionsBottomSheetComponent', () => {
    let fixture: ComponentFixture<ActionsBottomSheetComponent>;
    let dismiss: jest.Mock;
    let data: NoteActionsData;

    beforeEach(async () => {
        dismiss = jest.fn();
        data = { isPinned: false, isMarked: false, isEncrypted: false, isTrashed: false };
        await TestBed.configureTestingModule({
            declarations: [ActionsBottomSheetComponent],
            imports: [MatButtonModule, MatDividerModule, NoopAnimationsModule, TranslateModule.forRoot()],
            providers: [
                { provide: MAT_BOTTOM_SHEET_DATA, useValue: data },
                { provide: MatBottomSheetRef, useValue: { dismiss } },
            ],
        }).compileComponents();
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', {
            Tooltips: {
                Search: 'Search', PinNote: 'Pin', UnpinNote: 'Unpin',
                MarkNote: 'Mark', UnmarkNote: 'Unmark', EncryptNote: 'Encrypt',
                DecryptNote: 'Decrypt', DeleteNote: 'Delete',
            },
            Tags: { Edit: 'Edit tags' },
            Notes: { ExportNote: 'Export', ExportNoteToPdf: 'PDF', PrintNote: 'Print' },
        });

        translate.use('en');
        fixture = TestBed.createComponent(ActionsBottomSheetComponent);
        fixture.detectChanges();
    });

    function buttons(): HTMLButtonElement[] {
        return Array.from(fixture.nativeElement.querySelectorAll('button'));
    }

    it('renders a separated share row, five labeled grid buttons and a separate Delete button', () => {
        expect(buttons().map((button) => button.textContent.trim()))
            .toEqual(['Export', 'PDF', 'Print', 'Search', 'Edit tags', 'Pin', 'Mark', 'Encrypt', 'Delete']);
        expect(fixture.nativeElement.querySelectorAll('.note-share-actions button')).toHaveLength(3);
        expect(fixture.nativeElement.querySelectorAll('.note-actions-grid:not(.note-share-actions) button')).toHaveLength(5);
        expect(fixture.nativeElement.querySelector('.note-actions-grid .note-delete-action')).toBeNull();
        expect(fixture.nativeElement.querySelectorAll('mat-divider')).toHaveLength(2);
    });

    it.each<NoteAction>(['export', 'exportPdf', 'print', 'search', 'tags', 'pin', 'mark', 'encrypt', 'delete'])(
        'returns the selected %s action through sheet dismissal', (action) => {
            const actions: NoteAction[] = ['export', 'exportPdf', 'print', 'search', 'tags', 'pin', 'mark', 'encrypt', 'delete'];
            buttons()[actions.indexOf(action)].click();
            expect(dismiss).toHaveBeenCalledTimes(1);
            expect(dismiss).toHaveBeenCalledWith(action);
        },
    );

    it('uses current pin, mark and encryption state for labels and the decryption action', () => {
        data.isPinned = true;
        data.isMarked = true;
        data.isEncrypted = true;
        fixture.detectChanges();

        expect(buttons().map((button) => button.textContent.trim()))
            .toEqual(['Export', 'PDF', 'Print', 'Search', 'Edit tags', 'Unpin', 'Unmark', 'Decrypt', 'Delete']);
        buttons()[7].click();
        expect(dismiss).toHaveBeenCalledWith('decrypt');
    });

    it('hides Delete and its divider for trashed notes', () => {
        data.isTrashed = true;
        fixture.detectChanges();

        expect(buttons()).toHaveLength(8);
        expect(fixture.nativeElement.querySelector('.note-delete-action')).toBeNull();
        expect(fixture.nativeElement.querySelectorAll('mat-divider')).toHaveLength(1);
    });
});

describe('Actions sheet container styling', () => {
    let style: HTMLStyleElement;

    function actionsRule(): CSSStyleRule {
        const rule = Array.from(style.sheet.cssRules).find(
            (entry): entry is CSSStyleRule => entry instanceof CSSStyleRule &&
                entry.selectorText.includes('.note-actions-sheet'),
        );
        expect(rule).toBeDefined();
        return rule;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ActionsBottomSheetComponent],
            imports: [
                MatBottomSheetModule, MatButtonModule, MatDividerModule,
                NoopAnimationsModule, TranslateModule.forRoot(),
            ],
        }).compileComponents();
        style = document.createElement('style');
        style.textContent = compileString(readFileSync('src/css/angular-material-mods.scss', 'utf8')).css;
        document.head.appendChild(style);
    });

    afterEach(() => {
        TestBed.inject(MatBottomSheet).ngOnDestroy();
        TestBed.inject(OverlayContainer).ngOnDestroy();
        style.remove();
    });

    it('applies equal padding to the real Material container without adding inner padding', () => {
        const ref = TestBed.inject(MatBottomSheet).open(ActionsBottomSheetComponent, {
            panelClass: 'note-actions-sheet',
            data: { isPinned: false, isMarked: false, isEncrypted: false, isTrashed: false },
        });
        const overlay = TestBed.inject(OverlayContainer).getContainerElement();
        const container = overlay.querySelector<HTMLElement>('.note-actions-sheet .mat-bottom-sheet-container');

        expect(container).not.toBeNull();
        expect(container.classList.contains('note-actions-sheet')).toBe(false);
        const rule = actionsRule();
        expect(container.matches(rule.selectorText)).toBe(true);
        expect(rule.style.getPropertyValue('padding')).toBe('16px');
        expect(rule.style.getPropertyValue('width')).toBe('');
        expect(rule.style.getPropertyValue('min-width')).toBe('');
        expect(rule.style.getPropertyValue('max-width')).toBe('');
        ref.dismiss();
    });

    it('does not change the padding of other bottom sheets', () => {
        const ref = TestBed.inject(MatBottomSheet).open(ActionsBottomSheetComponent, {
            data: { isPinned: false, isMarked: false, isEncrypted: false, isTrashed: false },
        });
        const container = TestBed.inject(OverlayContainer).getContainerElement()
            .querySelector<HTMLElement>('.mat-bottom-sheet-container');
        expect(container.matches(actionsRule().selectorText)).toBe(false);
        ref.dismiss();
    });
});
