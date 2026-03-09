import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    // Código de dominio propio — excluye primitivos shadcn/ui generados
    'components/dashboard/**/*.{ts,tsx}',
    'components/projects/**/*.{ts,tsx}',
    'components/agents/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    // Excluye hooks shadcn duplicados en components/ui
    '!components/ui/**',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};

export default createJestConfig(config);
