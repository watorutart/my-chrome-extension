/**
 * タブの基本情報を表すインターフェース
 * Chrome拡張機能でタブ管理に使用される
 */
export interface TabInfo {
  /** タブの一意識別子 */
  id: number;
  /** タブのURL */
  url?: string;
  /** タブのタイトル */
  title?: string;
  /** タブが属するウィンドウのID */
  windowId: number;
  /** タブが属するグループのID（グループに属していない場合はundefined） */
  groupId?: number;
  /** タブのドメイン（抽出済み） */
  domain?: string;
}

/**
 * タブグループの情報を表すインターフェース
 * 自動生成されたグループの管理に使用される
 */
export interface GroupInfo {
  /** グループの一意識別子 */
  id: number;
  /** グループのタイトル */
  title?: string;
  /** グループの色 */
  color: chrome.tabGroups.ColorEnum;
  /** グループが折りたたまれているかどうか */
  collapsed: boolean;
  /** グループが属するウィンドウのID */
  windowId: number;
  /** グループに関連付けられたドメイン */
  domain?: string;
}

/**
 * ドメイン別のグループ情報を表すインターフェース
 * ドメインごとのタブとグループの関係を管理する
 */
export interface DomainGroup {
  /** 対象のドメイン名 */
  domain: string;
  /** 関連付けられたグループのID */
  groupId?: number;
  /** このドメインに属するタブのIDリスト */
  tabIds: number[];
}

/**
 * タブ自動グループ化の設定を表すインターフェース
 * 拡張機能の動作をカスタマイズするための設定項目
 */
export interface GroupingConfig {
  /** 自動生成されたグループのタイトルプレフィックス */
  autoGroupPrefix: string;
  /** グループ化を無視するURLパターンのリスト */
  ignoredUrlPatterns: string[];
  /** グループあたりの最大タブ数 */
  maxGroupSize: number;
  /** 自動グループ化機能の有効/無効 */
  enableAutoGrouping: boolean;
}