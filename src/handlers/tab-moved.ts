import { extractDomain } from '../utils/domain';
import { findGroupByDomain, createGroupForDomain, addTabToGroup } from '../utils/group';

/**
 * タブ移動時のイベントハンドラー
 * 
 * タブ移動時に、移動先ウィンドウで適切なグループに追加します：
 * 1. 移動先ウィンドウでのドメインに対応するグループを検索
 * 2. グループが存在しない場合は新しいグループを作成
 * 3. タブを適切なグループに追加
 * 4. エラーハンドリングとログ出力
 * 
 * 注意：同一ウィンドウ内の移動でも処理を行います。これにより、
 * 手動でグループから外されたタブが再度適切なグループに配置されます。
 * 
 * @param tabId - 移動されたタブのID
 * @param moveInfo - タブの移動情報
 */
export async function handleTabMoved(
  tabId: number,
  moveInfo: chrome.tabs.TabMoveInfo
): Promise<void> {
  try {
    // タブの最新情報を取得
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url || tab.id === undefined) {
      return;
    }

    // moveInfoには移動先のウィンドウIDが含まれている
    // tab.windowIdも移動後は移動先ウィンドウIDになっている
    const targetWindowId = moveInfo.windowId;

    // ドメインを抽出
    const domain = extractDomain(tab.url);
    if (!domain) {
      return;
    }

    // 移動先ウィンドウでのドメインに対応するグループを検索
    let targetGroup = await findGroupByDomain(domain, targetWindowId);

    // グループが存在しない場合は新しいグループを作成
    if (!targetGroup) {
      targetGroup = await createGroupForDomain(domain, targetWindowId);
      if (!targetGroup) {
        console.warn(`Failed to create group for domain: ${domain} in window ${targetWindowId}`);
        return;
      }
    }

    // タブをターゲットグループに追加
    const success = await addTabToGroup(tab.id, targetGroup.id);
    if (!success) {
      console.warn(`Failed to add tab ${tab.id} to group ${targetGroup.id}`);
    }

  } catch (error) {
    console.error('Error in handleTabMoved:', error);
  }
}