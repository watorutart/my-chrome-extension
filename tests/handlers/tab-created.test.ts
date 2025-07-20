import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleTabCreated } from '../../src/handlers/tab-created';
import { extractDomain } from '../../src/utils/domain';
import { findGroupByDomain, createGroupForDomain, addTabToGroup } from '../../src/utils/group';

// Mock the utility functions
vi.mock('../../src/utils/domain');
vi.mock('../../src/utils/group');

const mockExtractDomain = vi.mocked(extractDomain);
const mockFindGroupByDomain = vi.mocked(findGroupByDomain);
const mockCreateGroupForDomain = vi.mocked(createGroupForDomain);
const mockAddTabToGroup = vi.mocked(addTabToGroup);

describe('タブ作成ハンドラーテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleTabCreated', () => {
    it('ドメインが有効でグループが存在する場合にタブをグループ化できること', async () => {
      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 1
      } as chrome.tabs.Tab;

      const mockGroup = {
        id: 1,
        title: '[Auto] example.com',
        color: 'blue' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 1,
        domain: 'example.com'
      };

      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(mockGroup);
      mockAddTabToGroup.mockResolvedValue(true);

      await handleTabCreated(mockTab);

      expect(mockExtractDomain).toHaveBeenCalledWith('https://example.com/page');
      expect(mockFindGroupByDomain).toHaveBeenCalledWith('example.com', 1);
      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 1);
      expect(mockCreateGroupForDomain).not.toHaveBeenCalled();
    });

    it('ドメインが有効でグループが存在しない場合に新しいグループを作成できること', async () => {
      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 1
      } as chrome.tabs.Tab;

      const mockNewGroup = {
        id: 2,
        title: '[Auto] example.com',
        color: 'red' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 1,
        domain: 'example.com'
      };

      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(null);
      mockCreateGroupForDomain.mockResolvedValue(mockNewGroup);
      mockAddTabToGroup.mockResolvedValue(true);

      await handleTabCreated(mockTab);

      expect(mockExtractDomain).toHaveBeenCalledWith('https://example.com/page');
      expect(mockFindGroupByDomain).toHaveBeenCalledWith('example.com', 1);
      expect(mockCreateGroupForDomain).toHaveBeenCalledWith('example.com', 1);
      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 2);
    });

    it('ドメイン抽出が失敗した場合にグループ化をスキップできること', async () => {
      const mockTab = {
        id: 123,
        url: 'chrome://settings',
        windowId: 1
      } as chrome.tabs.Tab;

      mockExtractDomain.mockReturnValue(null);

      await handleTabCreated(mockTab);

      expect(mockExtractDomain).toHaveBeenCalledWith('chrome://settings');
      expect(mockFindGroupByDomain).not.toHaveBeenCalled();
      expect(mockCreateGroupForDomain).not.toHaveBeenCalled();
      expect(mockAddTabToGroup).not.toHaveBeenCalled();
    });

    it('タブにURLがない場合にグループ化をスキップできること', async () => {
      const mockTab = {
        id: 123,
        windowId: 1
      } as chrome.tabs.Tab;

      await handleTabCreated(mockTab);

      expect(mockExtractDomain).not.toHaveBeenCalled();
      expect(mockFindGroupByDomain).not.toHaveBeenCalled();
      expect(mockCreateGroupForDomain).not.toHaveBeenCalled();
      expect(mockAddTabToGroup).not.toHaveBeenCalled();
    });

    it('タブにIDがない場合にグループ化をスキップできること', async () => {
      const mockTab = {
        url: 'https://example.com/page',
        windowId: 1
      } as chrome.tabs.Tab;

      await handleTabCreated(mockTab);

      expect(mockExtractDomain).not.toHaveBeenCalled();
      expect(mockFindGroupByDomain).not.toHaveBeenCalled();
      expect(mockCreateGroupForDomain).not.toHaveBeenCalled();
      expect(mockAddTabToGroup).not.toHaveBeenCalled();
    });

    it('グループ作成失敗時にタブ追加をスキップすること', async () => {
      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 1
      } as chrome.tabs.Tab;

      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(null);
      mockCreateGroupForDomain.mockResolvedValue(null);

      await handleTabCreated(mockTab);

      expect(mockCreateGroupForDomain).toHaveBeenCalledWith('example.com', 1);
      expect(mockAddTabToGroup).not.toHaveBeenCalled();
    });

    it('タブグループ追加失敗時にエラーをログ出力すること', async () => {
      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 1
      } as chrome.tabs.Tab;

      const mockGroup = {
        id: 1,
        title: '[Auto] example.com',
        color: 'blue' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 1,
        domain: 'example.com'
      };

      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(mockGroup);
      mockAddTabToGroup.mockResolvedValue(false);

      await handleTabCreated(mockTab);

      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 1);
      // Should not throw error, just log it
    });

    it('タブが既にグループに所属している場合にグループ化をスキップできること', async () => {
      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: 5 // Already in a group
      } as chrome.tabs.Tab;

      await handleTabCreated(mockTab);

      expect(mockExtractDomain).not.toHaveBeenCalled();
      expect(mockFindGroupByDomain).not.toHaveBeenCalled();
      expect(mockCreateGroupForDomain).not.toHaveBeenCalled();
      expect(mockAddTabToGroup).not.toHaveBeenCalled();
    });

    it('groupIdがTAB_GROUP_ID_NONEの場合にタブを処理できること', async () => {
      const mockTab = {
        id: 123,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      const mockGroup = {
        id: 1,
        title: '[Auto] example.com',
        color: 'blue' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 1,
        domain: 'example.com'
      };

      mockExtractDomain.mockReturnValue('example.com');
      mockFindGroupByDomain.mockResolvedValue(mockGroup);
      mockAddTabToGroup.mockResolvedValue(true);

      await handleTabCreated(mockTab);

      expect(mockExtractDomain).toHaveBeenCalledWith('https://example.com/page');
      expect(mockFindGroupByDomain).toHaveBeenCalledWith('example.com', 1);
      expect(mockAddTabToGroup).toHaveBeenCalledWith(123, 1);
    });
  });
});