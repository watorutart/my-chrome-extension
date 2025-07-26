import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractDomain, isValidDomain, findTabsByDomain } from '../domain';

describe('ドメインユーティリティテスト', () => {
  describe('extractDomain', () => {
    it('https URLからドメインを抽出できること', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com');
    });

    it('http URLからドメインを抽出できること', () => {
      expect(extractDomain('http://example.com/path')).toBe('example.com');
    });

    it('サブドメイン付きURLからドメインを抽出できること', () => {
      expect(extractDomain('https://sub.example.com/path')).toBe('sub.example.com');
    });

    it('ポート付きURLからドメインを抽出できること', () => {
      expect(extractDomain('https://example.com:8080/path')).toBe('example.com');
    });

    it('無効なURLのnullを返すこと', () => {
      expect(extractDomain('not-a-url')).toBeNull();
    });

    it('undefined URLのnullを返すこと', () => {
      expect(extractDomain(undefined)).toBeNull();
    });

    it('chrome://URLのnullを返すこと', () => {
      expect(extractDomain('chrome://settings')).toBeNull();
    });

    it('chrome-extension://URLのnullを返すこと', () => {
      expect(extractDomain('chrome-extension://abc123/popup.html')).toBeNull();
    });
  });

  describe('isValidDomain', () => {
    it('有効なドメインにtrueを返すこと', () => {
      expect(isValidDomain('example.com')).toBe(true);
    });

    it('サブドメインにtrueを返すこと', () => {
      expect(isValidDomain('sub.example.com')).toBe(true);
    });

    it('空文字列にfalseを返すこと', () => {
      expect(isValidDomain('')).toBe(false);
    });

    it('nullにfalseを返すこと', () => {
      expect(isValidDomain(null)).toBe(false);
    });

    it('undefinedにfalseを返すこと', () => {
      expect(isValidDomain(undefined)).toBe(false);
    });

    it('スペースを含むドメインにfalseを返すこと', () => {
      expect(isValidDomain('example .com')).toBe(false);
    });

    it('無効な文字を含むドメインにfalseを返すこと', () => {
      expect(isValidDomain('example@.com')).toBe(false);
    });
  });

  describe('findTabsByDomain', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('ドメインでタブを検索できること', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com/page1', windowId: 1 },
        { id: 2, url: 'https://example.com/page2', windowId: 1 },
        { id: 3, url: 'https://other.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabs as chrome.tabs.Tab[]);

      const result = await findTabsByDomain('example.com');
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('ドメインに一致するタブがない場合は空配列を返すこと', async () => {
      const mockTabs = [
        { id: 1, url: 'https://other.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabs as chrome.tabs.Tab[]);

      const result = await findTabsByDomain('example.com');
      
      expect(result).toHaveLength(0);
    });

    it('URLのないタブを適切に処理できること', async () => {
      const mockTabs = [
        { id: 1, windowId: 1 }, // No URL
        { id: 2, url: 'https://example.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabs as chrome.tabs.Tab[]);

      const result = await findTabsByDomain('example.com');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('windowIdが指定された場合にフィルタリングできること', async () => {
      const mockTabsWindow1 = [
        { id: 1, url: 'https://example.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabsWindow1 as chrome.tabs.Tab[]);

      const result = await findTabsByDomain('example.com', 1);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: 1 });
    });

    it('windowIdが指定されない場合は全ウィンドウを検索すること', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabs as chrome.tabs.Tab[]);

      await findTabsByDomain('example.com');
      
      expect(chrome.tabs.query).toHaveBeenCalledWith({});
    });
  });
});