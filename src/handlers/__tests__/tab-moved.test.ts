import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleTabMoved } from '../tab-moved';
import { extractDomain } from '../../utils/domain';
import { findGroupByDomain, createGroupForDomain, addTabToGroup } from '../../utils/group';

// Mock the utility functions
vi.mock('../../utils/domain');
vi.mock('../../utils/group');

const mockExtractDomain = vi.mocked(extractDomain);
const mockFindGroupByDomain = vi.mocked(findGroupByDomain);
const mockCreateGroupForDomain = vi.mocked(createGroupForDomain);
const mockAddTabToGroup = vi.mocked(addTabToGroup);

// Mock chrome APIs
const mockTabsGet = vi.fn();

Object.assign(globalThis, {
  chrome: {
    tabs: {
      get: mockTabsGet
    },
    tabGroups: {
      TAB_GROUP_ID_NONE: -1
    }
  }
});

describe('タブ移動ハンドラーテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleTabMoved', () => {
    it('ウィンドウ間移動時に移動先ウィンドウの適切なグループに追加すること', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 2,
        fromIndex: 1,
        toIndex: 0
      };

      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      const mockGroup = {
        id: 1,
        title: '[Auto] example.com',
        color: 'blue' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 2,
        domain: 'example.com'
      };

      mockTabsGet.mockResolvedValue(mockTab);
      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(mockGroup);
      mockAddTabToGroup.mockResolvedValue(true);

      await handleTabMoved(tabId, moveInfo);

      expect(mockTabsGet).toHaveBeenCalledWith(123);
      expect(mockExtractDomain).toHaveBeenCalledWith('https://example.com/page');
      expect(mockFindGroupByDomain).toHaveBeenCalledWith('example.com', 2);
      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 1);
    });

    it('移動先ウィンドウに対応するグループが存在しない場合に新しいグループを作成すること', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 2,
        fromIndex: 1,
        toIndex: 0
      };

      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      const mockNewGroup = {
        id: 2,
        title: '[Auto] example.com',
        color: 'red' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 2,
        domain: 'example.com'
      };

      mockTabsGet.mockResolvedValue(mockTab);
      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(null);
      mockCreateGroupForDomain.mockResolvedValue(mockNewGroup);
      mockAddTabToGroup.mockResolvedValue(true);

      await handleTabMoved(tabId, moveInfo);

      expect(mockCreateGroupForDomain).toHaveBeenCalledWith('example.com', 2);
      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 2);
    });

    it('同一ウィンドウ内の移動でも適切なグループに配置すること', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 1,
        fromIndex: 1,
        toIndex: 2
      };

      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: 1
      } as chrome.tabs.Tab;

      const mockGroup = {
        id: 2,
        title: '[Auto] example.com',
        color: 'blue' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 1,
        domain: 'example.com'
      };

      mockTabsGet.mockResolvedValue(mockTab);
      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(mockGroup);
      mockAddTabToGroup.mockResolvedValue(true);

      await handleTabMoved(tabId, moveInfo);

      expect(mockExtractDomain).toHaveBeenCalledWith('https://example.com/page');
      expect(mockFindGroupByDomain).toHaveBeenCalledWith('example.com', 1);
      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 2);
    });

    it('タブが既にグループに所属している場合でもウィンドウ間移動時は再グループ化すること', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 2,
        fromIndex: 1,
        toIndex: 0
      };

      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 2,
        groupId: 1 // 既に別のグループに所属
      } as chrome.tabs.Tab;

      const mockGroup = {
        id: 3,
        title: '[Auto] example.com',
        color: 'green' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 2,
        domain: 'example.com'
      };

      mockTabsGet.mockResolvedValue(mockTab);
      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(mockGroup);
      mockAddTabToGroup.mockResolvedValue(true);

      await handleTabMoved(tabId, moveInfo);

      expect(mockExtractDomain).toHaveBeenCalledWith('https://example.com/page');
      expect(mockFindGroupByDomain).toHaveBeenCalledWith('example.com', 2);
      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 3);
    });

    it('無効なドメインの場合は何もしないこと', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 2,
        fromIndex: 1,
        toIndex: 0
      };

      const mockTab = {
        id: 123,
        url: 'chrome://settings',
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      mockTabsGet.mockResolvedValue(mockTab);
      mockExtractDomain.mockReturnValue(null);

      await handleTabMoved(tabId, moveInfo);

      expect(mockFindGroupByDomain).not.toHaveBeenCalled();
      expect(mockCreateGroupForDomain).not.toHaveBeenCalled();
      expect(mockAddTabToGroup).not.toHaveBeenCalled();
    });

    it('タブ情報取得に失敗した場合はエラーをハンドルすること', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 2,
        fromIndex: 1,
        toIndex: 0
      };

      mockTabsGet.mockRejectedValue(new Error('Tab not found'));

      await handleTabMoved(tabId, moveInfo);

      // Should not throw error, just handle gracefully
      expect(mockExtractDomain).not.toHaveBeenCalled();
    });

    it('グループ作成に失敗した場合はタブ追加をスキップすること', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 2,
        fromIndex: 1,
        toIndex: 0
      };

      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      mockTabsGet.mockResolvedValue(mockTab);
      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(null);
      mockCreateGroupForDomain.mockResolvedValue(null);

      await handleTabMoved(tabId, moveInfo);

      expect(mockCreateGroupForDomain).toHaveBeenCalledWith('example.com', 2);
      expect(mockAddTabToGroup).not.toHaveBeenCalled();
    });

    it('タブグループ追加に失敗した場合はエラーをログ出力すること', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 2,
        fromIndex: 1,
        toIndex: 0
      };

      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      const mockGroup = {
        id: 1,
        title: '[Auto] example.com',
        color: 'blue' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 2,
        domain: 'example.com'
      };

      mockTabsGet.mockResolvedValue(mockTab);
      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(mockGroup);
      mockAddTabToGroup.mockResolvedValue(false);

      await handleTabMoved(tabId, moveInfo);

      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 1);
      // Should not throw error, just log it
    });

    it('タブにURLがない場合は何もしないこと', async () => {
      const tabId = 123;
      const moveInfo = {
        windowId: 2,
        fromIndex: 1,
        toIndex: 0
      };

      const mockTab = {
        id: 123,
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      mockTabsGet.mockResolvedValue(mockTab);

      await handleTabMoved(tabId, moveInfo);

      expect(mockExtractDomain).not.toHaveBeenCalled();
      expect(mockFindGroupByDomain).not.toHaveBeenCalled();
      expect(mockCreateGroupForDomain).not.toHaveBeenCalled();
      expect(mockAddTabToGroup).not.toHaveBeenCalled();
    });
  });
});