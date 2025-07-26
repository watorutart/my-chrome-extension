import { IGNORED_URL_PATTERNS } from '../constants';
import type { TabInfo } from '../types';

/**
 * URLからドメイン名を抽出する
 * 無視すべきURLパターン（chrome://など）は除外される
 * @param url - 抽出対象のURL
 * @returns ドメイン名（抽出できない場合はnull）
 */
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

/**
 * ドメイン名の有効性を検証する
 * @param domain - 検証対象のドメイン名
 * @returns 有効なドメイン名の場合はtrue
 */
export function isValidDomain(domain?: string | null): domain is string {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain);
}

/**
 * 指定されたドメインに属する全てのタブを検索する
 * @param domain - 検索対象のドメイン名
 * @param windowId - 検索対象のウィンドウID（未指定の場合は全ウィンドウ）
 * @returns 該当するタブの情報リスト
 */
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

/**
 * 指定されたドメインとタブのドメインが一致するかを判定する高階関数を返す
 * @param domain - 照合するドメイン名
 * @returns タブがドメインに一致するかを判定する関数
 */
function isTabMatchingDomain(domain: string) {
  return (tab: chrome.tabs.Tab): boolean => {
    if (!tab.url || !tab.id) return false;
    const tabDomain = extractDomain(tab.url);
    return tabDomain === domain;
  };
}

/**
 * Chrome TabオブジェクトをTabInfo型に変換する高階関数を返す
 * @param domain - タブに関連付けるドメイン名
 * @returns Tab を TabInfo に変換する関数
 */
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