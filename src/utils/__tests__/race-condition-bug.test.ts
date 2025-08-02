/**
 * Test to reproduce the specific race condition issue
 * where groups get deleted after temporary tab is removed
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGroupForDomain, addTabToGroup } from '../group';

describe('Race Condition Bug Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not have race condition after fix - group should exist', async () => {
    // Setup the scenario with the fix
    
    // 1. Mock tabs.query to return a sample tab
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      { id: 999, url: 'chrome://newtab', windowId: 1 }
    ] as any);

    // 2. Mock tabs.group to create a group (returns group ID)
    (vi.mocked(chrome.tabs.group) as any).mockResolvedValue(123);

    // 3. Mock tabGroups.update to return updated group info
    const mockGroup = {
      id: 123,
      title: '[Auto] www.youtube.com',
      color: 'blue',
      collapsed: false,
      windowId: 1
    };
    vi.mocked(chrome.tabGroups.update).mockResolvedValue(mockGroup as any);

    // 4. Create the group for domain (no ungroup call with fix)
    const group = await createGroupForDomain('www.youtube.com', 1);
    expect(group).not.toBeNull();
    expect(group!.id).toBe(123);

    // Verify that ungroup was NOT called (this is the fix)
    expect(chrome.tabs.ungroup).not.toHaveBeenCalled();

    // 5. Mock that the group still exists when we try to add tabs
    vi.mocked(chrome.tabGroups.get).mockResolvedValue(mockGroup as any);
    
    // 6. Mock query for removeTemporaryTabsFromGroup
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      { id: 999, url: 'chrome://newtab', windowId: 1, groupId: 123 },
      { id: 456, url: 'https://www.youtube.com/watch?v=test', windowId: 1, groupId: 123 }
    ] as any);

    // 7. Try to add a tab to the group
    const success = await addTabToGroup(456, 123);
    
    // 8. This should succeed because the group still exists
    expect(success).toBe(true);
    expect(chrome.tabGroups.get).toHaveBeenCalledWith(123);
    expect(chrome.tabs.group).toHaveBeenCalledWith({
      tabIds: [456],
      groupId: 123
    });
  });

  it('should remove temporary tabs when adding real tabs', async () => {
    // Mock the group exists
    vi.mocked(chrome.tabGroups.get).mockResolvedValue({ id: 123 } as any);
    
    // Mock tabs in the group (temporary tab + new real tab)
    vi.mocked(chrome.tabs.query).mockResolvedValue([
      { id: 999, url: 'chrome://newtab', windowId: 1, groupId: 123 },
      { id: 456, url: 'https://www.youtube.com/watch?v=test', windowId: 1, groupId: 123 }
    ] as any);

    // Mock ungroup for temporary tabs
    vi.mocked(chrome.tabs.ungroup).mockResolvedValue();

    const success = await addTabToGroup(456, 123);
    
    expect(success).toBe(true);
    expect(chrome.tabs.ungroup).toHaveBeenCalledWith([999]); // Remove temporary tab
  });
});