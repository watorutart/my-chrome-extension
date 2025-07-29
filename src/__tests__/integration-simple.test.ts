import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handleTabCreated } from '../handlers/tab-created';
import { handleTabUpdated } from '../handlers/tab-updated';
import { handleTabMoved } from '../handlers/tab-moved';

// Mock Chrome APIs
const mockChrome = {
  tabs: {
    query: vi.fn(),
    group: vi.fn(),
    ungroup: vi.fn(),
    get: vi.fn(),
  },
  tabGroups: {
    query: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    TAB_GROUP_ID_NONE: -1,
  },
  runtime: {
    lastError: undefined,
  },
};

// @ts-expect-error - Mock global chrome
global.chrome = mockChrome;

describe('Simple Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChrome.runtime.lastError = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Tab Creation Flow', () => {
    it('should not group single tab when no existing group', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Mock: No existing group found
      mockChrome.tabGroups.query.mockResolvedValue([]);
      // Mock: findTabsByDomain returns empty (called within createGroupForDomain)
      mockChrome.tabs.query.mockResolvedValue([]);

      await handleTabCreated(tab);

      // Since there are no tabs for group creation, no grouping should occur
      expect(mockChrome.tabs.group).not.toHaveBeenCalled();
    });

    it('should add tab to existing group', async () => {
      const newTab = {
        id: 2,
        url: 'https://example.com/page2',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Mock existing group
      const existingGroup = {
        id: 10,
        title: '[AUTO] example.com',
        windowId: 1,
        color: 'blue',
      };

      // findGroupByDomain will find the existing group
      mockChrome.tabGroups.query.mockResolvedValue([existingGroup]);
      // addTabToGroup will call chrome.tabs.group
      mockChrome.tabs.group.mockResolvedValue([2]);

      await handleTabCreated(newTab);

      expect(mockChrome.tabs.group).toHaveBeenCalledWith({
        tabIds: [2],
        groupId: 10,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs gracefully', async () => {
      const tab = {
        id: 1,
        url: 'chrome://settings/',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      // Should not attempt Chrome API calls for chrome:// URLs
      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
    });

    it('should handle Chrome API errors gracefully', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      mockChrome.tabs.query.mockRejectedValue(new Error('Permission denied'));

      await expect(handleTabCreated(tab)).resolves.not.toThrow();
    });

    it('should handle tab update errors gracefully', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: 10,
      };

      const changeInfo = { url: 'https://example.com/newpage' };

      mockChrome.tabs.query.mockRejectedValue(new Error('Tab not found'));

      await expect(handleTabUpdated(tab.id, changeInfo, tab)).resolves.not.toThrow();
    });

    it('should handle tab move errors gracefully', async () => {
      const moveInfo = {
        windowId: 2,
        fromIndex: 0,
        toIndex: 1,
      };

      mockChrome.tabs.get.mockRejectedValue(new Error('Tab not found'));

      await expect(handleTabMoved(999, moveInfo)).resolves.not.toThrow();
    });
  });

  describe('URL Validation', () => {
    const invalidUrls = [
      'chrome://settings/',
      'chrome-extension://abcdef/popup.html',
      'data:text/html,<h1>Test</h1>',
      'about:blank',
      undefined,
      '',
    ];

    invalidUrls.forEach((url) => {
      it(`should ignore ${url || 'empty/undefined'} URLs`, async () => {
        const tab = {
          id: 1,
          url,
          windowId: 1,
          groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
        };

        // @ts-expect-error - Testing invalid URLs
        await handleTabCreated(tab);

        // Should not make any Chrome API calls
        expect(mockChrome.tabs.query).not.toHaveBeenCalled();
        expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
      });
    });
  });

  describe('Tab State Validation', () => {
    it('should skip tabs without ID', async () => {
      const tab = {
        id: undefined,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // @ts-expect-error - Testing undefined ID
      await handleTabCreated(tab);

      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
    });

    it('should skip tabs already in groups', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: 5, // Already in a group
      };

      await handleTabCreated(tab);

      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
    });
  });
});