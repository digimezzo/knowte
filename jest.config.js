const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base');

module.exports = {
    preset: 'jest-preset-angular',
    roots: ['<rootDir>/'],
    testMatch: ['<rootDir>/src/**/*(*.)+(spec).+(ts)', '<rootDir>/main/**/*(*.)+(spec).+(js)'],
    setupFilesAfterEnv: ['<rootDir>/src/test.ts'],
    transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$|marked/))'],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
        prefix: '<rootDir>/',
    }),
    transform: {
        '^.+\\.{ts|tsx}?$': [
            'ts-jest',
            {
                babel: true,
                tsConfig: 'tsconfig.spec.json',
            },
        ],
    },
    setupFiles: ['<rootDir>/jest.setup.js'],
};