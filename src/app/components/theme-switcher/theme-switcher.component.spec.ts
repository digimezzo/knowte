import { IMock, Mock, Times } from 'typemoq';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { Theme } from '../../services/appearance/theme/theme';
import { ThemeCoreColors } from '../../services/appearance/theme/theme-core-colors';
import { ThemeCreator } from '../../services/appearance/theme/theme-creator';
import { ThemeNeutralColors } from '../../services/appearance/theme/theme-neutral-colors';
import { ThemeSwitcherComponent } from './theme-switcher.component';

describe('ThemeSwitcherComponent', () => {
    let appearanceServiceMock: IMock<AppearanceService> = Mock.ofType<AppearanceService>();

    let component: ThemeSwitcherComponent;

    beforeEach(() => {
        appearanceServiceMock = Mock.ofType<AppearanceService>();

        component = new ThemeSwitcherComponent(appearanceServiceMock.object);
    });

    describe('constructor', () => {
        it('should create', () => {
            // Arrange

            // Act

            // Assert
            expect(component).toBeDefined();
        });

        it('should define appearanceService', () => {
            // Arrange

            // Act

            // Assert
            expect(component.appearanceService).toBeDefined();
        });
    });

    describe('setTheme', () => {
        it('should change the selected theme', () => {
            // Arrange
            const themeCreator: ThemeCreator = new ThemeCreator('My creator', 'my@email.com');
            const coreColors: ThemeCoreColors = new ThemeCoreColors('red', 'green', 'blue');
            const darkColors: ThemeNeutralColors = new ThemeNeutralColors(
                'red',
                'green',
                'blue',
                'black',
                'white',
                '#aaa',
                '#ccc',
                '#ddd',
                '#eee',
                '#fff',
                '#111',
                '#222',
                '#333',
                '#444',
                '#555',
                '#666',
                '#777',
                '#888',
                'black',
                '#fff'
            );
            const lightColors: ThemeNeutralColors = new ThemeNeutralColors(
                'red',
                'green',
                'blue',
                'black',
                'white',
                '#aaa',
                '#ccc',
                '#ddd',
                '#eee',
                '#fff',
                '#111',
                '#222',
                '#333',
                '#444',
                '#555',
                '#666',
                '#777',
                '#888',
                'black',
                '#fff'
            );

            // Act
            const defaultTheme: Theme = new Theme('My theme', themeCreator, coreColors, darkColors, lightColors);
            component.setTheme(defaultTheme);

            // Assert
            appearanceServiceMock.verify((x) => (x.selectedTheme = defaultTheme), Times.once());
        });
    });
});
