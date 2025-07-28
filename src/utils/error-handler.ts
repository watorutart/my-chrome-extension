/**
 * Chrome拡張機能のエラーハンドリングユーティリティ
 * 
 * Chrome API呼び出しエラーの処理、状態整合性チェック、
 * 無効な参照の検証などを提供します。
 * 
 * 主な機能：
 * - Chrome API エラーの統一的な処理
 * - タブ・グループの状態検証
 * - 参照の有効性チェック
 * - エラー種別の判定
 */

/**
 * Chrome API呼び出しエラーを統一的に処理する
 * @param error - 発生したエラー
 * @param context - エラーが発生したAPI呼び出しのコンテキスト
 */
export function handleChromeApiError(error: unknown, context: string): void {
  console.error(`Chrome API Error in ${context}:`, error);
}

/**
 * タブの状態が有効かどうかを検証する
 * @param tabId - 検証するタブID
 * @returns タブが有効な場合はtrue
 */
export async function validateTabState(tabId: number): Promise<boolean> {
  try {
    // タブIDの基本検証
    if (!isValidTabReference(tabId)) {
      return false;
    }

    // Chrome APIでタブの存在を確認
    const tab = await chrome.tabs.get(tabId);
    
    // タブの基本プロパティを検証
    if (!tab || !tab.url || tab.id === undefined) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn(`Invalid tab reference: ${tabId}`, error);
    return false;
  }
}

/**
 * グループの状態が有効かどうかを検証する
 * @param groupId - 検証するグループID
 * @returns グループが有効な場合はtrue
 */
export async function validateGroupState(groupId: number): Promise<boolean> {
  try {
    // グループIDの基本検証
    if (!isValidGroupReference(groupId)) {
      return false;
    }

    // Chrome APIでグループの存在を確認
    const group = await chrome.tabGroups.get(groupId);
    
    // グループの基本プロパティを検証
    if (!group || !group.title || group.id === undefined) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn(`Invalid group reference: ${groupId}`, error);
    return false;
  }
}

/**
 * タブIDが有効な参照かどうかを検証する
 * @param tabId - 検証するタブID
 * @returns 有効なタブIDの場合はtrue
 */
export function isValidTabReference(tabId: any): tabId is number {
  return typeof tabId === 'number' && tabId > 0;
}

/**
 * グループIDが有効な参照かどうかを検証する
 * @param groupId - 検証するグループID
 * @returns 有効なグループIDの場合はtrue
 */
export function isValidGroupReference(groupId: any): groupId is number {
  return typeof groupId === 'number' && 
         groupId > 0 && 
         groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE;
}

/**
 * Chrome APIの権限エラーかどうかを判定する
 * @param error - 検証するエラー
 * @returns 権限エラーの場合はtrue
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Cannot access') ||
           error.message.includes('Permission denied') ||
           error.message.includes('Extension context invalidated');
  }
  return false;
}

/**
 * Chrome APIのコンテキスト無効化エラーかどうかを判定する
 * @param error - 検証するエラー
 * @returns コンテキスト無効化エラーの場合はtrue
 */
export function isContextInvalidatedError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Extension context invalidated') ||
           error.message.includes('context invalidated');
  }
  return false;
}

/**
 * リソースが見つからないエラーかどうかを判定する
 * @param error - 検証するエラー
 * @returns リソース未発見エラーの場合はtrue
 */
export function isResourceNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('not found') ||
           error.message.includes('No tab with id') ||
           error.message.includes('No group with id');
  }
  return false;
}