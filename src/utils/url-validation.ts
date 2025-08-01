import { IGNORED_URL_PATTERNS } from '../constants';

/**
 * タブURLが有効（グループ化対象）かどうかを判定する
 * @param url - 検証するURL
 * @returns URLが有効でグループ化対象の場合はtrue
 */
export function isValidTabUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  // 無視すべきURLパターンをチェック
  return !IGNORED_URL_PATTERNS.some(pattern => url.startsWith(pattern));
}

/**
 * タブURLが無効（グループ化対象外）かどうかを判定する
 * @param url - 検証するURL  
 * @returns URLが無効でグループ化対象外の場合はtrue
 */
export function isIgnoredUrl(url: string | undefined): boolean {
  return !isValidTabUrl(url);
}