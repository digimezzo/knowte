import { Theme } from './theme';
import { ThemeCoreColors } from './theme-core-colors';
import { ThemeCreator } from './theme-creator';
import { ThemeNeutralColors } from './theme-neutral-colors';

describe('Theme', () => {
    function createNeutralColors(): ThemeNeutralColors {
        return new ThemeNeutralColors(
            '#242424', // background
            '#fff', // primaryText
            '#5e5e5e', // secondaryText
            '#454545', // separator
            '#383838', // contextMenuBackground
            '#fff', // contextMenuPrimaryText
            '#6e6e6e', // contextMenuSecondaryText
            '#565656', // contextMenuSeparator
            'rgba(255, 255, 255, 0.03)', // hoverBackground
            'rgba(255, 255, 255, 0.06)', // selectionBackground
            '#fff', // primaryButtonText
            '#454545', // secondaryButtonBackground
            '#fff', // secondaryButtonText
            '#242424', // editorBackground
            '#2a2a2a', // editorCodeBackground
            '#454545', // editorBorder
            '#fff', // editorPrimaryText
            '#5e5e5e', // editorSecondaryText
            '#fff', // buttonBorder
            '#fff' // highlightForeground
        );
    }

    beforeEach(() => {});

    describe('constructor', () => {
        it('should create', () => {
            // Arrange
            const creator: ThemeCreator = new ThemeCreator('My creator', 'my@email.com');
            const coreColors: ThemeCoreColors = new ThemeCoreColors('#fff', '#000', '#ccc');
            const darkColors: ThemeNeutralColors = createNeutralColors();
            const lightColors: ThemeNeutralColors = createNeutralColors();

            // Act
            const theme: Theme = new Theme('My name', creator, coreColors, darkColors, lightColors);

            // Assert
            expect(theme).toBeDefined();
        });

        it('should set name', () => {
            // Arrange
            const creator: ThemeCreator = new ThemeCreator('My creator', 'my@email.com');
            const coreColors: ThemeCoreColors = new ThemeCoreColors('#fff', '#000', '#ccc');
            const darkColors: ThemeNeutralColors = createNeutralColors();
            const lightColors: ThemeNeutralColors = createNeutralColors();

            // Act
            const theme: Theme = new Theme('My name', creator, coreColors, darkColors, lightColors);

            // Assert
            expect(theme.name).toEqual('My name');
        });

        it('should set creator', () => {
            // Arrange
            const creator: ThemeCreator = new ThemeCreator('My creator', 'my@email.com');
            const coreColors: ThemeCoreColors = new ThemeCoreColors('#fff', '#000', '#ccc');
            const darkColors: ThemeNeutralColors = createNeutralColors();
            const lightColors: ThemeNeutralColors = createNeutralColors();

            // Act
            const theme: Theme = new Theme('My name', creator, coreColors, darkColors, lightColors);

            // Assert
            expect(theme.creator).toBe(creator);
        });

        it('should set coreColors', () => {
            // Arrange
            const creator: ThemeCreator = new ThemeCreator('My creator', 'my@email.com');
            const coreColors: ThemeCoreColors = new ThemeCoreColors('#fff', '#000', '#ccc');
            const darkColors: ThemeNeutralColors = createNeutralColors();
            const lightColors: ThemeNeutralColors = createNeutralColors();

            // Act
            const theme: Theme = new Theme('My name', creator, coreColors, darkColors, lightColors);

            // Assert
            expect(theme.coreColors).toBe(coreColors);
        });

        it('should set darkColors', () => {
            // Arrange
            const creator: ThemeCreator = new ThemeCreator('My creator', 'my@email.com');
            const coreColors: ThemeCoreColors = new ThemeCoreColors('#fff', '#000', '#ccc');
            const darkColors: ThemeNeutralColors = createNeutralColors();
            const lightColors: ThemeNeutralColors = createNeutralColors();

            // Act
            const theme: Theme = new Theme('My name', creator, coreColors, darkColors, lightColors);

            // Assert
            expect(theme.darkColors).toBe(darkColors);
        });

        it('should set lightColors', () => {
            // Arrange
            const creator: ThemeCreator = new ThemeCreator('My creator', 'my@email.com');
            const coreColors: ThemeCoreColors = new ThemeCoreColors('#fff', '#000', '#ccc');
            const darkColors: ThemeNeutralColors = createNeutralColors();
            const lightColors: ThemeNeutralColors = createNeutralColors();

            // Act
            const theme: Theme = new Theme('My name', creator, coreColors, darkColors, lightColors);

            // Assert
            expect(theme.lightColors).toBe(lightColors);
        });

        it('should set isBroken to false', () => {
            // Arrange
            const creator: ThemeCreator = new ThemeCreator('My creator', 'my@email.com');
            const coreColors: ThemeCoreColors = new ThemeCoreColors('#fff', '#000', '#ccc');
            const darkColors: ThemeNeutralColors = createNeutralColors();
            const lightColors: ThemeNeutralColors = createNeutralColors();

            // Act
            const theme: Theme = new Theme('My name', creator, coreColors, darkColors, lightColors);

            // Assert
            expect(theme.isBroken).toEqual(false);
        });
    });
});
