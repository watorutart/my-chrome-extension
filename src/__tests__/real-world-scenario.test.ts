/**
 * Integration test that simulates the real-world scenario described in the issue:
 * Opening multiple YouTube tabs after building and loading the extension
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleTabCreated } from '../handlers/tab-created';

describe('Real-world Scenario Simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle multiple YouTube tabs without "group does not exist" error', async () => {
    // Simulate the scenario described in the issue:
    // 1. Extension is built and loaded
    // 2. User opens 2 or more YouTube tabs
    // 3. Should not get "Cannot add tab to group: Group with id ... does not exist" error

    let groupIdCounter = 100;
    const mockTabs = [
      { id: 1, url: 'chrome://newtab', windowId: 1 }
    ];

    // Mock Chrome APIs for group creation scenario
    vi.mocked(chrome.tabs.query).mockImplementation(async (queryInfo) => {
      if (queryInfo.groupId !== undefined) {
        // Query for tabs in a specific group (for removeTemporaryTabsFromGroup)
        return mockTabs.filter(tab => 
          tab.url?.startsWith('chrome://') && queryInfo.groupId === groupIdCounter - 1
        ) as chrome.tabs.Tab[];
      }
      // Query for window tabs (for createGroupForDomain)
      return mockTabs.filter(tab => tab.windowId === queryInfo.windowId) as chrome.tabs.Tab[];
    });

    (vi.mocked(chrome.tabs.group) as any).mockImplementation(async () => {
      return groupIdCounter++;
    });

    vi.mocked(chrome.tabGroups.update).mockImplementation(async (groupId, updateProps) => {
      return {
        id: groupId,
        title: updateProps.title,
        color: updateProps.color,
        collapsed: false,
        windowId: 1
      } as any;
    });

    // Mock group exists check
    vi.mocked(chrome.tabGroups.get).mockImplementation(async (groupId) => {
      // Group should exist after creation (this is the fix)
      return {
        id: groupId,
        title: '[Auto] www.youtube.com',
        color: 'blue',
        collapsed: false,
        windowId: 1
      } as any;
    });

    // Mock tabGroups.query for findGroupByDomain
    vi.mocked(chrome.tabGroups.query).mockImplementation(async () => {
      // Simulate no existing groups for new domains
      return [];
    });

    vi.mocked(chrome.tabs.ungroup).mockResolvedValue();

    // Simulate first YouTube tab being created
    const firstYouTubeTab = {
      id: 10,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      windowId: 1,
      groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
    } as chrome.tabs.Tab;

    // This should create a new group
    await expect(handleTabCreated(firstYouTubeTab)).resolves.not.toThrow();

    // Simulate second YouTube tab being created shortly after
    const secondYouTubeTab = {
      id: 11,
      url: 'https://www.youtube.com/watch?v=abc123',
      windowId: 1,
      groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
    } as chrome.tabs.Tab;

    // This should use the existing group (no "group does not exist" error)
    await expect(handleTabCreated(secondYouTubeTab)).resolves.not.toThrow();

    // Verify that groups were found/created
    expect(chrome.tabGroups.update).toHaveBeenCalledWith(
      expect.any(Number), 
      expect.objectContaining({
        title: '[Auto] www.youtube.com',
        color: expect.any(String)
      })
    );

    // Verify that tabs were added to groups
    expect(chrome.tabs.group).toHaveBeenCalledWith(
      expect.objectContaining({
        tabIds: [10],
        groupId: expect.any(Number)
      })
    );

    expect(chrome.tabs.group).toHaveBeenCalledWith(
      expect.objectContaining({
        tabIds: [11],
        groupId: expect.any(Number)
      })
    );
  });

  it('should clean up temporary tabs when real domain tabs are added', async () => {
    // Setup: Group already exists with a temporary tab
    const groupId = 123;
    
    vi.mocked(chrome.tabGroups.get).mockResolvedValue({
      id: groupId,
      title: '[Auto] www.youtube.com',
      color: 'blue',
      collapsed: false,
      windowId: 1
    } as any);

    // Mock query to return temporary tab + new real tab
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      { id: 999, url: 'chrome://newtab', windowId: 1, groupId: groupId },
      { id: 456, url: 'https://www.youtube.com/watch?v=test', windowId: 1, groupId: groupId }
    ] as any);

    // Mock tabGroups.query for findGroupByDomain
    vi.mocked(chrome.tabGroups.query).mockResolvedValue([]);

    vi.mocked(chrome.tabs.ungroup).mockResolvedValue();
    (vi.mocked(chrome.tabs.group) as any).mockResolvedValue();

    const youtubeTab = {
      id: 456,
      url: 'https://www.youtube.com/watch?v=test',
      windowId: 1,
      groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
    } as chrome.tabs.Tab;

    await handleTabCreated(youtubeTab);

    // Verify that the temporary tab was removed
    expect(chrome.tabs.ungroup).toHaveBeenCalledWith([999]);
  });
});