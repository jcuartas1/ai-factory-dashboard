import '@testing-library/jest-dom';
import React from 'react';

// Mock global de @clerk/nextjs — evita conexiones reales a Clerk en tests
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  UserButton: () => React.createElement('div', { 'data-testid': 'user-button' }),
  SignIn: () => React.createElement('div', { 'data-testid': 'sign-in' }),
  SignUp: () => React.createElement('div', { 'data-testid': 'sign-up' }),
  useUser: () => ({ isLoaded: true, isSignedIn: true, user: { fullName: 'Test User' } }),
  useAuth: () => ({ isLoaded: true, isSignedIn: true }),
}));

// Mock global de @clerk/nextjs/server — evita imports de server-only en tests
jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: jest.fn(),
  createRouteMatcher: jest.fn(() => jest.fn(() => false)),
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
}));
