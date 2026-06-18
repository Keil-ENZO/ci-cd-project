module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
    },
    testMatch: ['**/src/tests/unitaire/api.test.ts'],
    setupFiles: ['./.jest/setEnvVars.js'],
    roots: ['<rootDir>/src'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    moduleDirectories: ['node_modules', 'src'],
}
