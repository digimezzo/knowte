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
            expect(defaultThemes.length).toEqual(5);
            expect(defaultThemes[0].name).toEqual('Knowte');
            expect(defaultThemes[1].name).toEqual('Sanguine');
            expect(defaultThemes[2].name).toEqual('Purple Lake');
            expect(defaultThemes[3].name).toEqual('Bloody Mary');
            expect(defaultThemes[4].name).toEqual('Quepal');
        });
    });
});
