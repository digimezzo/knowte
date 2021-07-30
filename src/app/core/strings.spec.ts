import { Strings } from './strings';

describe('Strings', () => {
    describe('replaceFirst', () => {
        it('should replace the first occurrence of an old value by a new value', () => {
            // Arrange
            const sourceString: string = `A string 'with' single 'quotes'`;

            // Act
            const newString: string = Strings.replaceFirst(sourceString, `'`, `''`);

            // Assert
            expect(newString).toEqual(`A string ''with' single 'quotes'`);
        });
    });
});
