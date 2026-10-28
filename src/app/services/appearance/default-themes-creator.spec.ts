import tinycolor from 'tinycolor2';
import { DefaultThemesCreator } from './default-themes-creator';
import { Theme } from './theme/theme';

describe('DefaultThemesCreator', () => {
    beforeEach(() => {});

    describe('constructor', () => {
        it('should create', () => {
            // Arrange

            // Act
            const defaultThemesCreator: DefaultThemesCreator = new DefaultThemesCreator();

            // Assert
            expect(defaultThemesCreator).toBeDefined();
        });
    });

    describe('createAllThemes', () => {
        it('should create all default themes', () => {
            // Arrange
            const defaultThemesCreator: DefaultThemesCreator = new DefaultThemesCreator();

            // Act
            const defaultThemes: Theme[] = defaultThemesCreator.createAllThemes();

            // Assert
            expect(defaultThemes.length).toEqual(6);
            expect(defaultThemes[0].name).toEqual('Knowte');
            expect(defaultThemes[1].name).toEqual('Sanguine');
            expect(defaultThemes[2].name).toEqual('Purple Lake');
            expect(defaultThemes[3].name).toEqual('Bloody Mary');
            expect(defaultThemes[4].name).toEqual('Quepal');
            expect(defaultThemes[5].name).toEqual('Adwaita');
        });

        it.each(new DefaultThemesCreator().createAllThemes())(
            'should give code a subtly distinct background and readable text in both modes of $name',
            (theme) => {
                for (const colors of [theme.lightColors, theme.darkColors]) {
                    const backgroundContrast = tinycolor.readability(colors.editorBackground, colors.editorCodeBackground);
                    expect(backgroundContrast).toBeGreaterThanOrEqual(1.25);
                    expect(backgroundContrast).toBeLessThanOrEqual(1.45);
                    expect(tinycolor.readability(colors.editorPrimaryText, colors.editorCodeBackground)).toBeGreaterThanOrEqual(4.5);
                }
            }
        );
    });
});
