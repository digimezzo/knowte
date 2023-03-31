import { ThemeNeutralColors } from './theme-neutral-colors';

describe('ThemeNeutralColors', () => {
    function createNeutralColors(): ThemeNeutralColors {
        return new ThemeNeutralColors(
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
            'orange',
            'grey',
            'magenta',
            'brown'
        );
    }

    beforeEach(() => {});

    describe('constructor', () => {
        it('should create', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors).toBeDefined();
        });

        it('should set windowButtonIcon', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.windowButtonIcon).toEqual('red');
        });

        it('should set hoveredItemBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.hoveredItemBackground).toEqual('green');
        });

        it('should set selectedItemBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.selectedItemBackground).toEqual('blue');
        });

        it('should set tabText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.tabText).toEqual('black');
        });

        it('should set selectedTabText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.selectedTabText).toEqual('white');
        });

        it('should set mainBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.mainBackground).toEqual('#aaa');
        });

        it('should set dragImageBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.dragImageBackground).toEqual('#ccc');
        });

        it('should set dragImageBorder', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.dragImageBorder).toEqual('#ddd');
        });

        it('should set primaryText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.primaryText).toEqual('#eee');
        });

        it('should set secondaryText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.secondaryText).toEqual('#fff');
        });

        it('should set sliderBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.sliderBackground).toEqual('#111');
        });

        it('should set sliderThumbBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.sliderThumbBackground).toEqual('#222');
        });

        it('should set paneSeparators', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.paneSeparators).toEqual('#333');
        });

        it('should set settingsSeparators', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.settingsSeparators).toEqual('#444');
        });

        it('should set contextMenuSeparators', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.contextMenuSeparators).toEqual('#555');
        });

        it('should set scrollBars', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.scrollBars).toEqual('#666');
        });

        it('should set commandIcon', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.commandIcon).toEqual('#777');
        });

        it('should set primaryButtonText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.primaryButtonText).toEqual('orange');
        });

        it('should set secondaryButtonBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.secondaryButtonBackground).toEqual('grey');
        });

        it('should set secondaryButtonText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.secondaryButtonText).toEqual('magenta');
        });

        it('should set editorBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.editorBackground).toEqual('brown');
        });
    });
});
