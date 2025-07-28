import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  handleChromeApiError, 
  validateTabState, 
  validateGroupState, 
  isValidTabReference, 
  isValidGroupReference,
  isPermissionError,
  isContextInvalidatedError,
  isResourceNotFoundError
} from '../error-handler';

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

// Mock chrome APIs
const mockTabsGet = vi.fn();
const mockTabGroupsGet = vi.fn();

Object.assign(globalThis, {
  chrome: {
    tabs: {
      get: mockTabsGet
    },
    tabGroups: {
      get: mockTabGroupsGet,
      TAB_GROUP_ID_NONE: -1
    }
  }
});

describe('エラーハンドリングユーティリティテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
  });

  describe('handleChromeApiError', () => {
    it('Chrome拡張機能APIエラーを適切にログ出力すること', () => {
      const error = new Error('Extension context invalidated.');
      const context = 'tabs.query';

      handleChromeApiError(error, context);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Chrome API Error in tabs.query:',
        error
      );
    });

    it('権限不足エラーを適切にログ出力すること', () => {
      const error = new Error('Cannot access tabs');
      const context = 'tabGroups.create';

      handleChromeApiError(error, context);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Chrome API Error in tabGroups.create:',
        error
      );
    });

    it('一般的なエラーを適切にログ出力すること', () => {
      const error = new Error('Unknown error');
      const context = 'general';

      handleChromeApiError(error, context);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Chrome API Error in general:',
        error
      );
    });

    it('エラーオブジェクト以外でも適切に処理すること', () => {
      const error = 'String error';
      const context = 'test';

      handleChromeApiError(error, context);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Chrome API Error in test:',
        error
      );
    });
  });

  describe('validateTabState', () => {
    it('有効なタブ状態でtrueを返すこと', async () => {
      const mockTab = {
        id: 123,
        url: 'https://example.com',
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      mockTabsGet.mockResolvedValue(mockTab);

      const result = await validateTabState(123);

      expect(result).toBe(true);
      expect(mockTabsGet).toHaveBeenCalledWith(123);
    });

    it('タブが存在しない場合にfalseを返すこと', async () => {
      mockTabsGet.mockRejectedValue(new Error('Tab not found'));

      const result = await validateTabState(999);

      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Invalid tab reference: 999',
        expect.any(Error)
      );
    });

    it('タブIDが無効な場合にfalseを返すこと', async () => {
      const result = await validateTabState(-1);

      expect(result).toBe(false);
      expect(mockTabsGet).not.toHaveBeenCalled();
    });

    it('タブにURLがない場合にfalseを返すこと', async () => {
      const mockTab = {
        id: 123,
        windowId: 1,
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
      } as chrome.tabs.Tab;

      mockTabsGet.mockResolvedValue(mockTab);

      const result = await validateTabState(123);

      expect(result).toBe(false);
    });
  });

  describe('validateGroupState', () => {
    it('有効なグループ状態でtrueを返すこと', async () => {
      const mockGroup = {
        id: 1,
        title: '[Auto] example.com',
        color: 'blue' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 1
      };

      mockTabGroupsGet.mockResolvedValue(mockGroup);

      const result = await validateGroupState(1);

      expect(result).toBe(true);
      expect(mockTabGroupsGet).toHaveBeenCalledWith(1);
    });

    it('グループが存在しない場合にfalseを返すこと', async () => {
      mockTabGroupsGet.mockRejectedValue(new Error('Group not found'));

      const result = await validateGroupState(999);

      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Invalid group reference: 999',
        expect.any(Error)
      );
    });

    it('グループIDが無効な場合にfalseを返すこと', async () => {
      const result = await validateGroupState(-1);

      expect(result).toBe(false);
      expect(mockTabGroupsGet).not.toHaveBeenCalled();
    });

    it('グループにタイトルがない場合にfalseを返すこと', async () => {
      const mockGroup = {
        id: 1,
        color: 'blue' as chrome.tabGroups.ColorEnum,
        collapsed: false,
        windowId: 1
      };

      mockTabGroupsGet.mockResolvedValue(mockGroup);

      const result = await validateGroupState(1);

      expect(result).toBe(false);
    });
  });

  describe('isValidTabReference', () => {
    it('有効なタブIDでtrueを返すこと', () => {
      expect(isValidTabReference(1)).toBe(true);
      expect(isValidTabReference(100)).toBe(true);
    });

    it('無効なタブIDでfalseを返すこと', () => {
      expect(isValidTabReference(-1)).toBe(false);
      expect(isValidTabReference(0)).toBe(false);
      expect(isValidTabReference(undefined as any)).toBe(false);
      expect(isValidTabReference(null as any)).toBe(false);
      expect(isValidTabReference('invalid' as any)).toBe(false);
    });
  });

  describe('isValidGroupReference', () => {
    it('有効なグループIDでtrueを返すこと', () => {
      expect(isValidGroupReference(1)).toBe(true);
      expect(isValidGroupReference(100)).toBe(true);
    });

    it('TAB_GROUP_ID_NONEでfalseを返すこと', () => {
      expect(isValidGroupReference(chrome.tabGroups.TAB_GROUP_ID_NONE)).toBe(false);
    });

    it('無効なグループIDでfalseを返すこと', () => {
      expect(isValidGroupReference(-2)).toBe(false);
      expect(isValidGroupReference(0)).toBe(false);
      expect(isValidGroupReference(undefined as any)).toBe(false);
      expect(isValidGroupReference(null as any)).toBe(false);
      expect(isValidGroupReference('invalid' as any)).toBe(false);
    });
  });

  describe('エラー種別判定', () => {
    describe('isPermissionError', () => {
      it('権限エラーを正しく判定すること', () => {
        const permissionError = new Error('Cannot access tabs');
        const deniedError = new Error('Permission denied');
        const contextError = new Error('Extension context invalidated');
        const otherError = new Error('Some other error');

        expect(isPermissionError(permissionError)).toBe(true);
        expect(isPermissionError(deniedError)).toBe(true);
        expect(isPermissionError(contextError)).toBe(true);
        expect(isPermissionError(otherError)).toBe(false);
        expect(isPermissionError('string error')).toBe(false);
        expect(isPermissionError(null)).toBe(false);
      });
    });

    describe('isContextInvalidatedError', () => {
      it('コンテキスト無効化エラーを正しく判定すること', () => {
        const contextError1 = new Error('Extension context invalidated');
        const contextError2 = new Error('context invalidated');
        const otherError = new Error('Some other error');

        expect(isContextInvalidatedError(contextError1)).toBe(true);
        expect(isContextInvalidatedError(contextError2)).toBe(true);
        expect(isContextInvalidatedError(otherError)).toBe(false);
        expect(isContextInvalidatedError('string error')).toBe(false);
        expect(isContextInvalidatedError(null)).toBe(false);
      });
    });

    describe('isResourceNotFoundError', () => {
      it('リソース未発見エラーを正しく判定すること', () => {
        const notFoundError = new Error('not found');
        const tabNotFoundError = new Error('No tab with id: 123');
        const groupNotFoundError = new Error('No group with id: 456');
        const otherError = new Error('Some other error');

        expect(isResourceNotFoundError(notFoundError)).toBe(true);
        expect(isResourceNotFoundError(tabNotFoundError)).toBe(true);
        expect(isResourceNotFoundError(groupNotFoundError)).toBe(true);
        expect(isResourceNotFoundError(otherError)).toBe(false);
        expect(isResourceNotFoundError('string error')).toBe(false);
        expect(isResourceNotFoundError(null)).toBe(false);
      });
    });
  });
});