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
    // Capa de servicios e infraestructura HTTP
    'lib/http/**/*.{ts,tsx}',
    'lib/services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    // Excluye hooks shadcn duplicados en components/ui
    '!components/ui/**',
    // Excluye repositories (SWR hooks — requieren renderHook, no unit tests puros)
    '!lib/repositories/**',
    // Excluye tipos de dominio (solo interfaces, sin lógica ejecutable)
    '!lib/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // 100% de cobertura obligatorio en la capa de servicios e HTTP
    './lib/services/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './lib/http/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default createJestConfig(config);
