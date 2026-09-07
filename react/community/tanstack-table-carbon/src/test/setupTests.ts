import '@testing-library/jest-dom';
import { vi } from 'vitest';
import './testGlobals'; // NOTE: Browser API polyfills

// Mock react-i18next globally for all tests
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));
