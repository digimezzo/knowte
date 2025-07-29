import {ThemeNeutralColors} from './theme-neutral-colors';

describe('ThemeNeutralColors', () => {
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
            '#fff', // highlightForeground
            '#fff', // tooltipText
            '#fff', // sliderBackground
            '#fff' // sliderThumbBackground
        );
    }

    beforeEach(() => {
    });

    describe('constructor', () => {
        it('should create', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors).toBeDefined();
        });

        it('should set background', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.background).toEqual('#242424');
        });

        it('should set primaryText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.primaryText).toEqual('#fff');
        });

        it('should set secondaryText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.secondaryText).toEqual('#5e5e5e');
        });

        it('should set separator', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.separator).toEqual('#454545');
        });

        it('should set contextMenuBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.contextMenuBackground).toEqual('#383838');
        });

        it('should set contextMenuPrimaryText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.contextMenuPrimaryText).toEqual('#fff');
        });

        it('should set contextMenuSecondaryText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.contextMenuSecondaryText).toEqual('#6e6e6e');
        });

        it('should set contextMenuSeparator', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.contextMenuSeparator).toEqual('#565656');
        });

        it('should set hoverBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.hoverBackground).toEqual('rgba(255, 255, 255, 0.03)');
        });

        it('should set selectionBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.selectionBackground).toEqual('rgba(255, 255, 255, 0.06)');
        });

        it('should set primaryButtonText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.primaryButtonText).toEqual('#fff');
        });

        it('should set secondaryButtonBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.secondaryButtonBackground).toEqual('#454545');
        });

        it('should set secondaryButtonText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.secondaryButtonText).toEqual('#fff');
        });

        it('should set editorBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.editorBackground).toEqual('#242424');
        });

        it('should set editorCodeBackground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.editorCodeBackground).toEqual('#2a2a2a');
        });

        it('should set editorBorder', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.editorBorder).toEqual('#454545');
        });

        it('should set editorPrimaryText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.editorPrimaryText).toEqual('#fff');
        });

        it('should set editorSecondaryText', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.editorSecondaryText).toEqual('#5e5e5e');
        });

        it('should set buttonBorder', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.buttonBorder).toEqual('#fff');
        });

        it('should set highlightForeground', () => {
            // Arrange

            // Act
            const colors: ThemeNeutralColors = createNeutralColors();

            // Assert
            expect(colors.highlightForeground).toEqual('#fff');
        });
    });
});
