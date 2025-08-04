import { extractDomain } from '../utils/domain';
import { findGroupByDomain, createGroupForDomain, addTabToGroup } from '../utils/group';

/**
 * 新しく作成されたタブを自動的にドメイン別グループに追加する
 * @param tab - 作成されたタブの情報
 */
export async function handleTabCreated(tab: chrome.tabs.Tab): Promise<void> {
  try {
    if (!canTabBeGrouped(tab)) {
      return;
    }

    const domain = extractDomain(tab.url);
    if (!domain) {
      return;
    }

    const group = await getOrCreateGroupForDomain(domain, tab.windowId, tab.id);
    if (!group) {
      console.error(`Failed to get or create group for domain: ${domain}`);
      return;
    }

    // タブがすでにグループに含まれているかチェック
    if (tab.groupId === group.id) {
      return; // 既にグループ化済み
    }

    await addTabToGroupSafely(tab.id!, group.id);
  } catch (error) {
    console.error('Error handling tab created:', error);
  }
}

/**
 * タブが自動グループ化の対象かどうかを判定する
 * @param tab - 判定対象のタブ
 * @returns グループ化可能な場合はtrue
 */
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

/**
 * 指定されたドメインのグループを取得、または新規作成する
 * @param domain - 対象のドメイン名
 * @param windowId - ウィンドウID
 * @returns グループ情報（作成/取得に失敗した場合はnull）
 */
async function getOrCreateGroupForDomain(domain: string, windowId: number, targetTabId?: number) {
  // Look for existing auto-generated group for this domain
  let group = await findGroupByDomain(domain, windowId);
  
  // Create new group if none exists
  if (!group) {
    group = await createGroupForDomain(domain, windowId, targetTabId);
  }

  return group;
}

/**
 * タブを指定されたグループに安全に追加する
 * 失敗した場合はエラーログを出力する
 * @param tabId - 追加するタブのID
 * @param groupId - 追加先のグループID
 */
async function addTabToGroupSafely(tabId: number, groupId: number): Promise<void> {
  const success = await addTabToGroup(tabId, groupId);
  if (!success) {
    console.error(`Failed to add tab ${tabId} to group ${groupId}`);
  }
}