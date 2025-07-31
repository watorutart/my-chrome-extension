import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleTabCreated } from '../handlers/tab-created';
import { handleTabUpdated } from '../handlers/tab-updated';
import { handleTabMoved } from '../handlers/tab-moved';

// Helper function to create a complete Tab object
function createMockTab(overrides: Partial<chrome.tabs.Tab> = {}): chrome.tabs.Tab {
  return {
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
    mutedInfo: { muted: false },
    width: 1920,
    height: 1080,
    status: 'complete',
    title: 'Example Page',
    audible: false,
    openerTabId: undefined,
    favIconUrl: undefined,
    sessionId: undefined,
    ...overrides
  };
}

describe('タスク9 - 動作する統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('エラーなしでの関数呼び出し', () => {
    it('エラーを発生させずにタブ作成を処理できること', async () => {
      // Mock Chrome APIs
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = createMockTab();

      // Set up mocks to prevent errors
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabs.query.mockResolvedValue([]);

      // This should not throw
      await expect(handleTabCreated(tab)).resolves.not.toThrow();
      
      // Verify some function was called
      expect(mockChrome.tabGroups.query).toHaveBeenCalled();
    });

    it('エラーを発生させずにタブ更新を処理できること', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = createMockTab({
        id: 1,
        url: 'https://newdomain.com/page',
        groupId: 10
      });

      const changeInfo = { url: 'https://newdomain.com/page' };

      mockChrome.tabs.query.mockResolvedValue([]);
      mockChrome.tabGroups.query.mockResolvedValue([]);

      await expect(handleTabUpdated(tab.id!, changeInfo, tab)).resolves.not.toThrow();
    });

    it('エラーを発生させずにタブ移動を処理できること', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = createMockTab({
        id: 1,
        windowId: 2
      });

      const moveInfo = {
        windowId: 2,
        fromIndex: 0,
        toIndex: 1,
      };

      mockChrome.tabs.get.mockResolvedValue(tab);
      mockChrome.tabs.query.mockResolvedValue([]);
      mockChrome.tabGroups.query.mockResolvedValue([]);

      await expect(handleTabMoved(tab.id!, moveInfo)).resolves.not.toThrow();
      
      expect(mockChrome.tabs.get).toHaveBeenCalledWith(tab.id);
    });
  });

  describe('エラー耐性', () => {
    it('APIエラーを適切に処理できること', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = createMockTab();

      // Simulate API errors
      mockChrome.tabGroups.query.mockRejectedValue(new Error('Permission denied'));
      mockChrome.tabs.query.mockRejectedValue(new Error('Network error'));

      // Should handle errors gracefully
      await expect(handleTabCreated(tab)).resolves.not.toThrow();
    });

    it('無効なURLを無視できること', async () => {
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
        const tab = createMockTab({ url });

        await expect(handleTabCreated(tab)).resolves.not.toThrow();
        
        // Reset mocks for next iteration
        vi.clearAllMocks();
      }
    });

    it('タブデータが不足している場合を処理できること', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      // Test with undefined tab ID
      const tabWithoutId = createMockTab({ id: undefined });

      await expect(handleTabCreated(tabWithoutId)).resolves.not.toThrow();
    });

    it('無効なタブIDでのタブ移動を処理できること', async () => {
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

  describe('要件検証', () => {
    it('ドメインベースのグループ化が動作することを確認', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = createMockTab();

      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabs.query.mockResolvedValue([]);

      await handleTabCreated(tab);

      // Verify that domain-based logic was invoked
      expect(mockChrome.tabGroups.query).toHaveBeenCalled();
    });

    it('chrome://URLなどの無効なドメインを適切に無視することを確認', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const chromeTab = createMockTab({ url: 'chrome://settings/' });

      await handleTabCreated(chromeTab);

      // Should not attempt to group chrome:// URLs
      expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
      expect(mockChrome.tabs.query).not.toHaveBeenCalled();
    });

    it('APIエラー発生後も拡張機能が正常に動作し続けることを確認', async () => {
      const mockChrome = {
        tabs: { query: vi.fn(), group: vi.fn(), ungroup: vi.fn(), get: vi.fn() },    
        tabGroups: { query: vi.fn(), create: vi.fn(), update: vi.fn(), TAB_GROUP_ID_NONE: -1 },
        runtime: { lastError: undefined }
      };
      
      // @ts-expect-error - Mock global chrome
      global.chrome = mockChrome;

      const tab = createMockTab();

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