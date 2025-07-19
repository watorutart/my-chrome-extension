import { IGNORED_URL_PATTERNS } from '../constants';
import type { TabInfo } from '../types';

export function extractDomain(url?: string): string | null {
  if (!url) {
    return null;
  }

  // Check if URL should be ignored
  const shouldIgnore = IGNORED_URL_PATTERNS.some(pattern => url.startsWith(pattern));
  if (shouldIgnore) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

export function isValidDomain(domain?: string | null): domain is string {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain);
}

export async function findTabsByDomain(domain: string, windowId?: number): Promise<TabInfo[]> {
  const query = windowId ? { windowId } : {};
  
  try {
    const tabs = await chrome.tabs.query(query);
    
    return tabs
      .filter(isTabMatchingDomain(domain))
      .map(convertTabToTabInfo(domain));
  } catch (error) {
    console.error('Error querying tabs:', error);
    return [];
  }
}

function isTabMatchingDomain(domain: string) {
  return (tab: chrome.tabs.Tab): boolean => {
    if (!tab.url || !tab.id) return false;
    const tabDomain = extractDomain(tab.url);
    return tabDomain === domain;
  };
}

function convertTabToTabInfo(domain: string) {
  return (tab: chrome.tabs.Tab): TabInfo => ({
    id: tab.id!,
    url: tab.url,
    title: tab.title,
    windowId: tab.windowId,
    groupId: tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE ? tab.groupId : undefined,
    domain
  });
}