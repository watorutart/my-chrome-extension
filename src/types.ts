export interface TabInfo {
  id: number;
  url?: string;
  title?: string;
  windowId: number;
  groupId?: number;
  domain?: string;
}

export interface GroupInfo {
  id: number;
  title?: string;
  color: chrome.tabGroups.ColorEnum;
  collapsed: boolean;
  windowId: number;
  domain?: string;
}

export interface DomainGroup {
  domain: string;
  groupId?: number;
  tabIds: number[];
}

export interface GroupingConfig {
  autoGroupPrefix: string;
  ignoredUrlPatterns: string[];
  maxGroupSize: number;
  enableAutoGrouping: boolean;
}