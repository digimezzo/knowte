import { FontSize } from './font-size';

describe('FontSize', () => {
    describe('constructor', () => {
        it('should have normal size', () => {
            // Arrange
            // Act
            const fontSize = new FontSize(14);

            // Assert
            expect(fontSize.normalSize).toEqual(14);
        });

        it('should have larger size', () => {
            // Arrange
            // Act
            const fontSize = new FontSize(14);

            // Assert
            expect(fontSize.largeSize).toEqual(14 * 1.42);
        });

        it('should have largest size', () => {
            // Arrange
            // Act
            const fontSize = new FontSize(14);

            // Assert
            expect(fontSize.largerSize).toEqual(14 * 1.72);
        });
    });
});
