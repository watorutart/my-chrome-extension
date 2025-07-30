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

describe('Integration Tests - Complete Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChrome.runtime.lastError = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Tab Creation to Grouping Flow', () => {
    it('should create group when second tab for same domain is created', async () => {
      // Setup: First tab exists
      const existingTab = {
        id: 1,
        url: 'https://example.com/page1',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // New tab created
      const newTab = {
        id: 2,
        url: 'https://example.com/page2',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Mock responses for handleTabCreated flow
      mockChrome.tabs.query
        .mockResolvedValueOnce([existingTab]) // findTabsByDomain call
        .mockResolvedValueOnce([existingTab, newTab]); // tabs in window for group creation
      
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabGroups.update.mockResolvedValue({ 
        id: 10, 
        title: '[AUTO] example.com',
        windowId: 1,
        color: 'blue'
      });
      mockChrome.tabs.ungroup.mockResolvedValue();
      mockChrome.tabs.group
        .mockResolvedValueOnce(10) // First call returns groupId
        .mockResolvedValueOnce([2]); // Second call adds new tab

      // Execute
      await handleTabCreated(newTab);

      // Verify group creation process
      expect(mockChrome.tabs.group).toHaveBeenCalledWith({
        tabIds: [1]
      }); // First call to create group with temp tab
      expect(mockChrome.tabGroups.update).toHaveBeenCalledWith(10, {
        title: '[AUTO] example.com',
        color: 'blue',
      });
      expect(mockChrome.tabs.ungroup).toHaveBeenCalledWith([1]); // Remove temp tab
      expect(mockChrome.tabs.group).toHaveBeenCalledWith({
        tabIds: [2],
        groupId: 10,
      }); // Add new tab to group
    });

    it('should add tab to existing group when domain group exists', async () => {
      // Setup: Existing group and tab
      const existingTab = {
        id: 1,
        url: 'https://example.com/page1',
        windowId: 1,
        groupId: 10,
      };

      const existingGroup = {
        id: 10,
        title: '[AUTO] example.com',
        windowId: 1,
      };

      const newTab = {
        id: 2,
        url: 'https://example.com/page2',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Mock responses
      mockChrome.tabs.query.mockResolvedValue([existingTab]);
      mockChrome.tabGroups.query.mockResolvedValue([existingGroup]);
      mockChrome.tabs.group.mockResolvedValue([2]);

      // Execute
      await handleTabCreated(newTab);

      // Verify tab added to existing group
      expect(mockChrome.tabs.group).toHaveBeenCalledWith({
        tabIds: [2],
        groupId: 10,
      });
      expect(mockChrome.tabGroups.create).not.toHaveBeenCalled();
    });
  });

  describe('URL Change to Group Movement Flow', () => {
    it('should move tab to different group when URL domain changes', async () => {
      const tab = {
        id: 1,
        url: 'https://newdomain.com/page',
        windowId: 1,
        groupId: 10, // Currently in old group
      };

      const changeInfo = {
        url: 'https://newdomain.com/page',
      };

      // Setup: Existing tab in different domain group
      const existingNewDomainTab = {
        id: 2,
        url: 'https://newdomain.com/other',
        windowId: 1,
        groupId: 20,
      };

      const newDomainGroup = {
        id: 20,
        title: '[AUTO] newdomain.com',
        windowId: 1,
      };

      // Mock responses
      mockChrome.tabs.query.mockResolvedValue([existingNewDomainTab]);
      mockChrome.tabGroups.query.mockResolvedValue([newDomainGroup]);
      mockChrome.tabs.group.mockResolvedValue([1]);

      // Execute
      await handleTabUpdated(tab.id, changeInfo, tab);

      // Verify tab moved to new domain group
      expect(mockChrome.tabs.group).toHaveBeenCalledWith({
        tabIds: [1],
        groupId: 20,
      });
    });

    it('should create new group when tab URL changes to unique domain', async () => {
      const tab = {
        id: 1,
        url: 'https://uniquedomain.com/page',
        windowId: 1,
        groupId: 10,
      };

      const changeInfo = {
        url: 'https://uniquedomain.com/page',
      };

      // Mock responses - no existing tabs or groups for new domain
      mockChrome.tabs.query.mockResolvedValueOnce([]);
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabs.ungroup.mockResolvedValue();

      // Execute
      await handleTabUpdated(tab.id, changeInfo, tab);

      // Verify tab ungrouped (since it's the only tab for this domain)
      expect(mockChrome.tabs.ungroup).toHaveBeenCalledWith([1]);
    });
  });

  describe('Window Movement Flow', () => {
    it('should regroup tab after window movement', async () => {
      const tab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 2, // Moved to window 2
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      const moveInfo = {
        windowId: 2,
        fromIndex: 0,
        toIndex: 1,
      };

      // Setup: Existing tab in destination window
      const existingTabInDestWindow = {
        id: 3,
        url: 'https://example.com/other',
        windowId: 2,
        groupId: 30,
      };

      const existingGroupInDestWindow = {
        id: 30,
        title: '[AUTO] example.com',
        windowId: 2,
      };

      // Mock responses
      mockChrome.tabs.get.mockResolvedValue(tab);
      mockChrome.tabs.query.mockResolvedValue([existingTabInDestWindow]);
      mockChrome.tabGroups.query.mockResolvedValue([existingGroupInDestWindow]);
      mockChrome.tabs.group.mockResolvedValue([1]);

      // Execute
      await handleTabMoved(tab.id, moveInfo);

      // Verify tab grouped in destination window
      expect(mockChrome.tabs.group).toHaveBeenCalledWith({
        tabIds: [1],
        groupId: 30,
      });
    });

    it('should create new group in destination window when no existing group', async () => {
      const tab = {
        id: 1,
        url: 'https://newdomain.com/page',
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      const moveInfo = {
        windowId: 2,
        fromIndex: 0,
        toIndex: 1,
      };

      // Setup: Another tab with same domain in destination window
      const anotherTabSameDomain = {
        id: 4,
        url: 'https://newdomain.com/other',
        windowId: 2,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Mock responses
      mockChrome.tabs.get.mockResolvedValue(tab);
      mockChrome.tabs.query.mockResolvedValue([anotherTabSameDomain]);
      mockChrome.tabGroups.query.mockResolvedValue([]);
      mockChrome.tabGroups.create.mockResolvedValue({ id: 40 });
      mockChrome.tabs.group.mockResolvedValue([1, 4]);

      // Execute
      await handleTabMoved(tab.id, moveInfo);

      // Verify new group created and tabs grouped
      expect(mockChrome.tabGroups.create).toHaveBeenCalledWith({
        windowId: 2,
      });
      expect(mockChrome.tabGroups.update).toHaveBeenCalledWith(40, {
        title: '[AUTO] newdomain.com',
        color: 'blue',
      });
      expect(mockChrome.tabs.group).toHaveBeenCalledWith({
        tabIds: [1, 4],
        groupId: 40,
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle rapid tab creation for same domain', async () => {
      // Simulate multiple tabs being created rapidly
      const baseDomain = 'https://example.com';
      const tabs = [
        { id: 1, url: `${baseDomain}/page1`, windowId: 1, groupId: chrome.tabGroups.TAB_GROUP_ID_NONE },
        { id: 2, url: `${baseDomain}/page2`, windowId: 1, groupId: chrome.tabGroups.TAB_GROUP_ID_NONE },
        { id: 3, url: `${baseDomain}/page3`, windowId: 1, groupId: chrome.tabGroups.TAB_GROUP_ID_NONE },
      ];

      mockChrome.tabGroups.create.mockResolvedValue({ id: 50 });
      mockChrome.tabs.group.mockResolvedValue([1, 2, 3]);

      // First tab - no grouping yet
      mockChrome.tabs.query.mockResolvedValueOnce([]);
      mockChrome.tabGroups.query.mockResolvedValue([]);
      await handleTabCreated(tabs[0]);
      expect(mockChrome.tabGroups.create).not.toHaveBeenCalled();

      // Second tab - triggers grouping
      mockChrome.tabs.query.mockResolvedValueOnce([tabs[0]]);
      await handleTabCreated(tabs[1]);
      expect(mockChrome.tabGroups.create).toHaveBeenCalledTimes(1);

      // Third tab - adds to existing group
      const existingGroup = { id: 50, title: '[AUTO] example.com', windowId: 1 };
      mockChrome.tabs.query.mockResolvedValueOnce([tabs[0], tabs[1]]);
      mockChrome.tabGroups.query.mockResolvedValue([existingGroup]);
      mockChrome.tabs.group.mockResolvedValueOnce([3]);
      
      await handleTabCreated(tabs[2]);
      expect(mockChrome.tabs.group).toHaveBeenCalledWith({
        tabIds: [3],
        groupId: 50,
      });
    });

    it('should preserve user-created groups during automatic grouping', async () => {
      const newTab = {
        id: 1,
        url: 'https://example.com/page',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
      };

      // Existing tab in user-created group (no AUTO prefix)
      const existingTabInUserGroup = {
        id: 2,
        url: 'https://example.com/other',
        windowId: 1,
        groupId: 100,
      };

      const userCreatedGroup = {
        id: 100,
        title: 'My Custom Group', // No [AUTO] prefix
        windowId: 1,
      };

      // Mock responses
      mockChrome.tabs.query.mockResolvedValue([existingTabInUserGroup]);
      mockChrome.tabGroups.query.mockResolvedValue([userCreatedGroup]);

      // Execute
      await handleTabCreated(newTab);

      // Verify no automatic grouping occurred (respecting user group)
      expect(mockChrome.tabs.group).not.toHaveBeenCalled();
      expect(mockChrome.tabGroups.create).not.toHaveBeenCalled();
    });
  });
});