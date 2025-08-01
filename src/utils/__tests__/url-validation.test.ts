import { describe, it, expect } from 'vitest';
import { isValidTabUrl, isIgnoredUrl } from '../url-validation';

describe('URL検証ユーティリティ', () => {
  describe('isValidTabUrl', () => {
    it('有効なHTTP/HTTPSのURLでtrueを返すこと', () => {
      expect(isValidTabUrl('https://example.com')).toBe(true);
      expect(isValidTabUrl('http://example.com')).toBe(true);
      expect(isValidTabUrl('https://www.google.com/search?q=test')).toBe(true);
    });

    it('無効なURLでfalseを返すこと', () => {
      expect(isValidTabUrl('chrome://settings/')).toBe(false);
      expect(isValidTabUrl('chrome-extension://abcdef/popup.html')).toBe(false);
      expect(isValidTabUrl('about:blank')).toBe(false);
      expect(isValidTabUrl('data:text/html,<h1>Test</h1>')).toBe(false);
      expect(isValidTabUrl('moz-extension://test')).toBe(false);
      expect(isValidTabUrl('edge://settings')).toBe(false);
      expect(isValidTabUrl('opera://settings')).toBe(false);
      expect(isValidTabUrl('brave://settings')).toBe(false);
    });

    it('undefined/空文字でfalseを返すこと', () => {
      expect(isValidTabUrl(undefined)).toBe(false);
      expect(isValidTabUrl('')).toBe(false);
    });
  });

  describe('isIgnoredUrl', () => {
    it('有効なHTTP/HTTPSのURLでfalseを返すこと', () => {
      expect(isIgnoredUrl('https://example.com')).toBe(false);
      expect(isIgnoredUrl('http://example.com')).toBe(false);
    });

    it('無効なURLでtrueを返すこと', () => {
      expect(isIgnoredUrl('chrome://settings/')).toBe(true);
      expect(isIgnoredUrl('chrome-extension://abcdef/popup.html')).toBe(true);
      expect(isIgnoredUrl('about:blank')).toBe(true);
      expect(isIgnoredUrl('data:text/html,<h1>Test</h1>')).toBe(true);
    });

    it('undefined/空文字でtrueを返すこと', () => {
      expect(isIgnoredUrl(undefined)).toBe(true);
      expect(isIgnoredUrl('')).toBe(true);
    });
  });
});