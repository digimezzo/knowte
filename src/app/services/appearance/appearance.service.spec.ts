import { OverlayContainer } from '@angular/cdk/overlay';
import * as remote from '@electron/remote';
import { EventEmitter } from 'events';
import { Subject } from 'rxjs';
import { BaseApplication } from '../../common/io/base-application';
import { Desktop } from '../../common/io/desktop';
import { DocumentProxy } from '../../common/io/document-proxy';
import { FileAccess } from '../../common/io/file-access';
import { Logger } from '../../common/logging/logger';
import { BaseSettings } from '../../common/settings/base-settings';
import { AppearanceService } from './appearance.service';
import { DefaultThemesCreator } from './default-themes-creator';

jest.mock('@electron/remote', () => ({ getGlobal: jest.fn() }));

describe('AppearanceService window synchronization', () => {
    const themesCreator = new DefaultThemesCreator();
    const themes = themesCreator.createAllThemes();

    beforeEach(() => {
        (remote.getGlobal as jest.Mock).mockReturnValue(new EventEmitter());
    });

    function createWindow(useLightBackgroundTheme: boolean = true) {
        const settings = {
            theme: themes[0].name,
            fontSize: 14,
            followSystemTheme: false,
            useLightBackgroundTheme,
            followSystemColor: false,
        } as BaseSettings;
        const element = document.createElement('div');
        const body = document.createElement('div');
        const overlay = document.createElement('div');
        const service = new AppearanceService(
            settings,
            { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as unknown as Logger,
            { getContainerElement: () => overlay } as unknown as OverlayContainer,
            { getGlobal: () => false } as unknown as BaseApplication,
            {
                applicationDataDirectory: () => '/test',
                combinePath: (...parts: string[]) => parts.join('/'),
                createFullDirectoryPathIfDoesNotExist: jest.fn(),
                writeToFile: jest.fn(),
                getFilesInDirectory: () => themes.map((theme) => theme.name),
                getFileContentAsString: (name: string) => JSON.stringify(themes.find((theme) => theme.name === name)),
            } as unknown as FileAccess,
            {
                accentColorChanged$: new Subject<void>(),
                nativeThemeUpdated$: new Subject<void>(),
                shouldUseDarkColors: () => true,
                getAccentColor: () => '123456ff',
            } as unknown as Desktop,
            themesCreator,
            { getDocumentElement: () => element, getBody: () => body } as DocumentProxy
        );
        service.applyAppearance();
        return { service, settings, element, body, overlay };
    }

    it.each([true, false])('updates an open note when switching from light=%s', (initialLightTheme) => {
        const mainWindow = createWindow(initialLightTheme);
        const noteWindow = createWindow(initialLightTheme);

        mainWindow.service.useLightBackgroundTheme = !initialLightTheme;

        const expectedClass = initialLightTheme ? 'default-theme-dark' : 'default-theme-light';
        expect(noteWindow.body.className).toBe(expectedClass);
        expect(noteWindow.overlay.className).toBe(expectedClass);
        expect(noteWindow.element.style.getPropertyValue('--theme-editor-background')).toBe(
            mainWindow.element.style.getPropertyValue('--theme-editor-background')
        );
        const colors = initialLightTheme ? themes[0].darkColors : themes[0].lightColors;
        for (const property of ['--theme-classic-note-code-background', '--color-canvas-subtle', '--color-neutral-muted']) {
            expect(mainWindow.element.style.getPropertyValue(property)).toBe(colors.editorCodeBackground);
            expect(noteWindow.element.style.getPropertyValue(property)).toBe(colors.editorCodeBackground);
        }
        expect(noteWindow.service.isUsingLightTheme).toBe(!initialLightTheme);
    });

    it.each([true, false])('applies the shared code background to Markdown and legacy notes with light=%s', (useLightTheme) => {
        const window = createWindow(useLightTheme);
        const colors = useLightTheme ? themes[0].lightColors : themes[0].darkColors;

        for (const property of ['--theme-classic-note-code-background', '--color-canvas-subtle', '--color-neutral-muted']) {
            expect(window.element.style.getPropertyValue(property)).toBe(colors.editorCodeBackground);
        }
        expect(window.element.style.getPropertyValue('--color-canvas-default')).toBe(colors.editorBackground);
        expect(window.element.style.getPropertyValue('--theme-editor-primary-text')).toBe(colors.editorPrimaryText);
    });

    it('synchronizes following the system theme', () => {
        const mainWindow = createWindow();
        const noteWindow = createWindow();

        mainWindow.service.followSystemTheme = true;

        expect(noteWindow.service.followSystemTheme).toBe(true);
        expect(noteWindow.body.className).toBe('default-theme-dark');
    });

    it('synchronizes following the system accent color', () => {
        const mainWindow = createWindow();
        const noteWindow = createWindow();

        mainWindow.service.followSystemColor = true;

        expect(noteWindow.element.style.getPropertyValue('--theme-accent-color')).toBe('#123456');
    });

    it('continues synchronizing the selected color theme', () => {
        const mainWindow = createWindow();
        const noteWindow = createWindow();

        mainWindow.service.selectedTheme = mainWindow.service.themes[1];

        expect(noteWindow.service.selectedTheme.name).toBe(themes[1].name);
        expect(noteWindow.element.style.getPropertyValue('--theme-accent-color')).toBe(themes[1].coreColors.accentColor);
    });
});