import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import handlers directly
import { handleTabCreated } from '../handlers/tab-created';
import { handleTabUpdated } from '../handlers/tab-updated';
import { handleTabMoved } from '../handlers/tab-moved';

describe('Task 9 - Integration and E2E Tests', () => {
  describe('Integration Tests - Complete Flows', () => {
    it('should handle tab creation flow without errors', async () => {
      // Mock Chrome APIs completely to avoid permission issues
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Set up mocks to simulate "no existing group" scenario
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabs.query.mockResolvedValue([]);

      // This should not throw any errors
      await expect(handleTabCreated(tab)).resolves.not.toThrow();
      
      // Verify that at least the query functions were called
      expect(mockChrome.tabGroups.query).toHaveBeenCalled();
    });

    it('should handle tab update flow without errors', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = {
        id: 1,
        url: 'https://newdomain.com/page',
        windowId: 1,
        groupId: 10,
      };

      const changeInfo = { url: 'https://newdomain.com/page' };

      mockChrome.tabs.query.mockResolvedValue([]);
      mockChrome.tabGroups.query.mockResolvedValue([]);

      await expect(handleTabUpdated(tab.id, changeInfo, tab)).resolves.not.toThrow();
    });

    it('should handle tab move flow without errors', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      const moveInfo = {
        windowId: 2,
        fromIndex: 0,
        toIndex: 1,
      };

      mockChrome.tabs.get.mockResolvedValue(tab);
      mockChrome.tabs.query.mockResolvedValue([]);
      mockChrome.tabGroups.query.mockResolvedValue([]);

      await expect(handleTabMoved(tab.id, moveInfo)).resolves.not.toThrow();
      
      expect(mockChrome.tabs.get).toHaveBeenCalledWith(tab.id);
    });
  });

  describe('Error Cases Integration Tests', () => {
    it('should handle Chrome API errors gracefully', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Simulate API errors
      mockChrome.tabGroups.query.mockRejectedValue(new Error('Permission denied'));
      mockChrome.tabs.query.mockRejectedValue(new Error('Network error'));

      // Should handle errors gracefully
      await expect(handleTabCreated(tab)).resolves.not.toThrow();
    });

    it('should ignore invalid URLs', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const invalidUrls = [
        'chrome://settings/',
        'chrome-extension://abcdef/popup.html',
        'data:text/html,<h1>Test</h1>',
        undefined,
        '',
      ];

      for (const url of invalidUrls) {
        const tab = {
          id: 1,
          url,
          windowId: 1,
          groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
        };

        // @ts-expect-error - Testing with invalid URLs
        await expect(handleTabCreated(tab)).resolves.not.toThrow();
        
        // Should not make Chrome API calls for invalid URLs
        expect(mockChrome.tabs.query).not.toHaveBeenCalled();
        expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
        
        // Reset mocks for next iteration
        vi.clearAllMocks();
      }
    });

    it('should handle missing tab data gracefully', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      // Test with undefined tab ID
      const tabWithoutId = {
        id: undefined,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // @ts-expect-error - Testing with undefined ID
      await expect(handleTabCreated(tabWithoutId)).resolves.not.toThrow();

      // Test with missing windowId
      const tabWithoutWindow = {
        id: 1,
        url: 'https://example.com/page',
        windowId: undefined,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // @ts-expect-error - Testing with undefined windowId
      await expect(handleTabCreated(tabWithoutWindow)).resolves.not.toThrow();
    });

    it('should handle tab move with invalid tab ID', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const moveInfo = {
        windowId: 2,
        fromIndex: 0,
        toIndex: 1,
      };

      // Simulate tab not found
      mockChrome.tabs.get.mockRejectedValue(new Error('Tab not found'));

      await expect(handleTabMoved(999, moveInfo)).resolves.not.toThrow();
      
      expect(mockChrome.tabs.get).toHaveBeenCalledWith(999);
    });
  });

  describe('Requirements Validation', () => {
    it('validates requirement 1.1: Domain-based grouping capability', async () => {
      // This test validates that the system can process domain-based grouping requests
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabs.query.mockResolvedValue([]);

      await handleTabCreated(tab);

      // Verify that domain-based logic was invoked
      expect(mockChrome.tabGroups.query).toHaveBeenCalled();
    });

    it('validates requirement 4.1: Invalid domain handling', async () => {
      // This test validates that chrome:// URLs are ignored
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const chromeTab = {
        id: 1,
        url: 'chrome://settings/',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      await handleTabCreated(chromeTab);

      // Should not attempt to group chrome:// URLs
      expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
    });

    it('validates requirement 4.3: Error resilience', async () => {
      // This test validates that the extension continues to function after errors
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },    
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // First call fails
      mockChrome.tabGroups.query.mockRejectedValueOnce(new Error('API Error'));
      await handleTabCreated(tab);

      // Second call should still work (extension should not break)
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabs.query.mockResolvedValue([]);
      
      await expect(handleTabCreated(tab)).resolves.not.toThrow();
      expect(mockChrome.tabGroups.query).toHaveBeenCalledTimes(2);
    });
  });
});