import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.test\\.ts$',
  collectCoverageFrom: ['**/*.ts', '!**/index.ts', '!**/*.schema.ts'],
  coverageDirectory: '../coverage',
  coverageThresholds: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
  reporters: ['default'],
};

export default config;
