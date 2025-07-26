import { vi, beforeEach } from 'vitest';

// Chrome API mock setup
const mockChrome = {
  tabs: {
    query: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    move: vi.fn(),
    group: vi.fn(),
    ungroup: vi.fn(),
    onCreated: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    },
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    },
    onMoved: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  },
  tabGroups: {
    query: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    move: vi.fn(),
    TAB_GROUP_ID_NONE: -1,
    onCreated: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    },
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    },
    onMoved: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  },
  runtime: {
    lastError: null,
    onInstalled: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    }
  }
};

// Global chrome object for tests
(globalThis as any).chrome = mockChrome;

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});