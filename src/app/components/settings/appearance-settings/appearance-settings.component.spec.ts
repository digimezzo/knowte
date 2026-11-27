import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BaseApplication } from '../../../common/io/base-application';
import { Desktop } from '../../../common/io/desktop';
import { BaseSettings } from '../../../common/settings/base-settings';
import { BaseAppearanceService } from '../../../services/appearance/base-appearance.service';
import { TranslatorService } from '../../../services/translator/translator.service';
import { AppearanceSettingsComponent } from './appearance-settings.component';

jest.mock('@electron/remote', () => ({}));
jest.mock('electron', () => ({ ipcRenderer: {} }));

describe('Appearance settings title bar option', () => {
    it.each([true, false])('renders the title bar option when Snap is %s', async (isSnap) => {
        await TestBed.configureTestingModule({
            declarations: [AppearanceSettingsComponent],
            imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, NoopAnimationsModule, TranslateModule.forRoot()],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: BaseApplication, useValue: { getGlobal: () => isSnap } },
                { provide: BaseAppearanceService, useValue: {} },
                { provide: BaseSettings, useValue: {} },
                { provide: Desktop, useValue: {} },
                { provide: TranslatorService, useValue: { languages: [] } },
            ],
        }).overrideComponent(AppearanceSettingsComponent, { set: { styleUrls: [] } }).compileComponents();

        const fixture = TestBed.createComponent(AppearanceSettingsComponent);
        fixture.detectChanges();

        const text = fixture.nativeElement.textContent as string;
        expect(text.includes('SettingsPage.TitleBar')).toBe(!isSnap);
        expect(text.includes('SettingsPage.UseCustomTitleBar')).toBe(!isSnap);
    });
});
