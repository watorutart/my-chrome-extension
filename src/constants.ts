export const AUTO_GROUP_PREFIX = '[Auto]';

export const IGNORED_URL_PATTERNS = [
  'chrome://',
  'chrome-extension://',
  'about:',
  'moz-extension://',
  'edge://',
  'opera://',
  'brave://'
];

export const MAX_GROUP_SIZE = 20;

export const DEFAULT_GROUP_COLORS: chrome.tabGroups.ColorEnum[] = [
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan',
  'orange'
];

export const GROUPING_CONFIG = {
  autoGroupPrefix: AUTO_GROUP_PREFIX,
  ignoredUrlPatterns: IGNORED_URL_PATTERNS,
  maxGroupSize: MAX_GROUP_SIZE,
  enableAutoGrouping: true
} as const;