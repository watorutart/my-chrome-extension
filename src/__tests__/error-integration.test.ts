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

describe('Error Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChrome.runtime.lastError = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Permission Errors', () => {
    it('should handle tabs permission error gracefully', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Simulate permission error
      mockChrome.tabs.query.mockRejectedValue(new Error('Insufficient permissions'));

      // Should not throw and continue execution
      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabs.query).toHaveBeenCalled();
      expect(mockChrome.tabs.group).not.toHaveBeenCalled();
    });

    it('should handle tabGroups permission error gracefully', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      const existingTab = {
        id: 2,
        url: 'https://example.com/other',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // tabs query succeeds but tabGroups operations fail
      mockChrome.tabs.query.mockResolvedValue([existingTab]);
      mockChrome.tabGroups.query.mockRejectedValue(new Error('Extension lacks tabGroups permission'));

      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabs.query).toHaveBeenCalled();
      expect(mockChrome.tabGroups.query).toHaveBeenCalled();
      expect(mockChrome.tabGroups.create).not.toHaveBeenCalled();
    });

    it('should handle runtime.lastError in Chrome API calls', async () => {
      mockChrome.tabs.query.mockResolvedValue([{ 
        id: 2,
        url: 'https://example.com/other',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
        index: 0,
        pinned: false,
        highlighted: false,
        active: false,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        mutedInfo: undefined,
        width: 100,
        height: 100,
        status: 'complete',
        title: 'other',
        audible: false,
        openerTabId: undefined,
        favIconUrl: undefined,
        sessionId: undefined
      } as chrome.tabs.Tab]);
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabGroups.create.mockImplementation(() => {
        mockChrome.runtime.lastError = { message: 'Extension context invalidated' } as any;
        return Promise.reject(new Error('Extension context invalidated'));
      });

      await expect(handleTabCreated({
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
        index: 0,
        pinned: false,
        highlighted: false,
        active: false,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        mutedInfo: undefined,
        width: 100,
        height: 100,
        status: 'complete',
        title: 'page',
        audible: false,
        openerTabId: undefined,
        favIconUrl: undefined,
        sessionId: undefined
      } as chrome.tabs.Tab)).resolves.not.toThrow();

      expect(mockChrome.tabGroups.create).toHaveBeenCalled();
      expect(mockChrome.tabs.group).not.toHaveBeenCalled();
    });
  });

  describe('Invalid URL/Domain Handling', () => {
    it('should ignore chrome:// URLs', async () => {
      const tab = {
        id: 1,
        url: 'chrome://settings/',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      await handleTabCreated(tab);

      // Should not attempt any Chrome API calls for chrome:// URLs
      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
      expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
    });

    it('should ignore chrome-extension:// URLs', async () => {
      const tab = {
        id: 1,
        url: 'chrome-extension://abcdef123456/popup.html',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      await handleTabCreated(tab);

      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
      expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
    });

    it('should ignore data: URLs', async () => {
      const tab = {
        id: 1,
        url: 'data:text/html,<h1>Hello</h1>',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      await handleTabCreated(tab);

      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
      expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
    });

    it('should handle malformed URLs gracefully', async () => {
      const tab = {
        id: 1,
        url: 'not-a-valid-url',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
      expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
    });

    it('should handle missing URL gracefully', async () => {
      const tab = {
        id: 1,
        url: undefined,
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // @ts-expect-error - Testing undefined URL case
      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
      expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
    });
  });

  describe('Chrome API Failure Scenarios', () => {
    it('should handle tabs.query API failure', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      mockChrome.tabs.query.mockRejectedValue(new Error('Network error'));

      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabs.query).toHaveBeenCalled();
      expect(mockChrome.tabGroups.create).not.toHaveBeenCalled();
    });

    it('should handle tabGroups.create API failure', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      const existingTab = {
        id: 2,
        url: 'https://example.com/other',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      mockChrome.tabs.query.mockResolvedValue([existingTab]);
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabGroups.create.mockRejectedValue(new Error('Failed to create group'));

      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabGroups.create).toHaveBeenCalled();
      expect(mockChrome.tabs.group).not.toHaveBeenCalled();
    });

    it('should handle tabs.group API failure', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      const existingTab = {
        id: 2,
        url: 'https://example.com/other',
        windowId: 1,
        groupId: 10,
      };

      const existingGroup = {
        id: 10,
        title: '[AUTO] example.com',
        windowId: 1,
      };

      mockChrome.tabs.query.mockResolvedValue([existingTab]);
      mockChrome.tabGroups.query.mockResolvedValue([existingGroup]);
      mockChrome.tabs.group.mockRejectedValue(new Error('Failed to group tab'));

      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabs.group).toHaveBeenCalled();
    });

    it('should handle tabs.ungroup API failure in URL change scenario', async () => {
      const tab = {
        id: 1,
        url: 'https://newdomain.com/page',
        windowId: 1,
        groupId: 10,
      };

      const changeInfo = {
        url: 'https://newdomain.com/page',
      };

      // No other tabs for new domain - should ungroup
      mockChrome.tabs.query.mockResolvedValue([]);
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabs.ungroup.mockRejectedValue(new Error('Failed to ungroup tab'));

      await expect(handleTabUpdated(tab.id, changeInfo, tab)).resolves.not.toThrow();

      expect(mockChrome.tabs.ungroup).toHaveBeenCalled();
    });

    it('should handle tabGroups.update API failure', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      const existingTab = {
        id: 2,
        url: 'https://example.com/other',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      mockChrome.tabs.query.mockResolvedValue([existingTab]);
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabGroups.create.mockResolvedValue({ id: 10 });
      mockChrome.tabGroups.update.mockRejectedValue(new Error('Failed to update group'));
      mockChrome.tabs.group.mockResolvedValue([1, 2]);

      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabGroups.update).toHaveBeenCalled();
      // Should still attempt to group tabs even if update fails
      expect(mockChrome.tabs.group).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tab without windowId', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: undefined,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // @ts-expect-error - Testing undefined windowId case
      await expect(handleTabCreated(tab)).resolves.not.toThrow();

      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
    });

    it('should handle tab moved event with invalid tab data', async () => {
      const moveInfo = {
        windowId: 1,
        fromIndex: 0,
        toIndex: 1,
      };

      mockChrome.tabs.get.mockRejectedValue(new Error('Tab not found'));

      await expect(handleTabMoved(999, moveInfo)).resolves.not.toThrow();

      expect(mockChrome.tabs.get).toHaveBeenCalledWith(999);
    });

    it('should handle concurrent group operations', async () => {
      const tab1 = {
        id: 1,
        url: 'https://example.com/page1',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      const tab2 = {
        id: 2,
        url: 'https://example.com/page2',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Simulate concurrent operations
      mockChrome.tabs.query.mockResolvedValue([]);
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabGroups.create
        .mockResolvedValueOnce({ id: 10 })
        .mockRejectedValueOnce(new Error('Group already exists'));

      const promise1 = handleTabCreated(tab1);
      const promise2 = handleTabCreated(tab2);

      await expect(Promise.all([promise1, promise2])).resolves.not.toThrow();
    });
  });
});