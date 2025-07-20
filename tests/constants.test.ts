import { describe, it, expect } from 'vitest';
import {
  AUTO_GROUP_PREFIX,
  IGNORED_URL_PATTERNS,
  MAX_GROUP_SIZE,
  DEFAULT_GROUP_COLORS,
  GROUPING_CONFIG
} from '../src/constants';

describe('定数テスト', () => {
  describe('AUTO_GROUP_PREFIX', () => {
    it('正しく定義されていること', () => {
      expect(AUTO_GROUP_PREFIX).toBe('[Auto]');
    });
  });

  describe('IGNORED_URL_PATTERNS', () => {
    it('期待されるURLパターンを含んでいること', () => {
      expect(IGNORED_URL_PATTERNS).toContain('chrome://');
      expect(IGNORED_URL_PATTERNS).toContain('chrome-extension://');
      expect(IGNORED_URL_PATTERNS).toContain('about:');
    });

    it('正しい長さを持っていること', () => {
      expect(IGNORED_URL_PATTERNS).toHaveLength(7);
    });
  });

  describe('MAX_GROUP_SIZE', () => {
    it('正の数であること', () => {
      expect(MAX_GROUP_SIZE).toBeGreaterThan(0);
      expect(MAX_GROUP_SIZE).toBe(20);
    });
  });

  describe('DEFAULT_GROUP_COLORS', () => {
    it('有効なChromeタブグループの色を含んでいること', () => {
      const validColors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
      DEFAULT_GROUP_COLORS.forEach(color => {
        expect(validColors).toContain(color);
      });
    });

    it('期待される長さを持っていること', () => {
      expect(DEFAULT_GROUP_COLORS).toHaveLength(8);
    });
  });

  describe('GROUPING_CONFIG', () => {
    it('正しい構造を持っていること', () => {
      expect(GROUPING_CONFIG).toEqual({
        autoGroupPrefix: AUTO_GROUP_PREFIX,
        ignoredUrlPatterns: IGNORED_URL_PATTERNS,
        maxGroupSize: MAX_GROUP_SIZE,
        enableAutoGrouping: true
      });
    });

    it('enableAutoGroupingがデフォルトでtrueであること', () => {
      expect(GROUPING_CONFIG.enableAutoGrouping).toBe(true);
    });
  });
});