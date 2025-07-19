import { extractDomain } from '../utils/domain';
import { findGroupByDomain, createGroupForDomain, addTabToGroup } from '../utils/group';

export async function handleTabCreated(tab: chrome.tabs.Tab): Promise<void> {
  try {
    if (!canTabBeGrouped(tab)) {
      return;
    }

    const domain = extractDomain(tab.url);
    if (!domain) {
      return;
    }

    const group = await getOrCreateGroupForDomain(domain, tab.windowId);
    if (!group) {
      console.error(`Failed to get or create group for domain: ${domain}`);
      return;
    }

    await addTabToGroupSafely(tab.id!, group.id);
  } catch (error) {
    console.error('Error handling tab created:', error);
  }
}

function canTabBeGrouped(tab: chrome.tabs.Tab): boolean {
  // Skip if tab has no URL or ID
  if (!tab.url || !tab.id) {
    return false;
  }

  // Skip if tab is already in a group (except TAB_GROUP_ID_NONE)
  if (tab.groupId && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
    return false;
  }

  return true;
}

async function getOrCreateGroupForDomain(domain: string, windowId: number) {
  // Look for existing auto-generated group for this domain
  let group = await findGroupByDomain(domain, windowId);
  
  // Create new group if none exists
  if (!group) {
    group = await createGroupForDomain(domain, windowId);
  }

  return group;
}

async function addTabToGroupSafely(tabId: number, groupId: number): Promise<void> {
  const success = await addTabToGroup(tabId, groupId);
  if (!success) {
    console.error(`Failed to add tab ${tabId} to group ${groupId}`);
  }
}