import { describe, it, expect } from 'vitest';
import {
  AUTO_GROUP_PREFIX,
  IGNORED_URL_PATTERNS,
  MAX_GROUP_SIZE,
  DEFAULT_GROUP_COLORS,
  GROUPING_CONFIG
} from '../src/constants';

describe('Constants', () => {
  describe('AUTO_GROUP_PREFIX', () => {
    it('should be correctly defined', () => {
      expect(AUTO_GROUP_PREFIX).toBe('[Auto]');
    });
  });

  describe('IGNORED_URL_PATTERNS', () => {
    it('should contain expected URL patterns', () => {
      expect(IGNORED_URL_PATTERNS).toContain('chrome://');
      expect(IGNORED_URL_PATTERNS).toContain('chrome-extension://');
      expect(IGNORED_URL_PATTERNS).toContain('about:');
    });

    it('should have correct length', () => {
      expect(IGNORED_URL_PATTERNS).toHaveLength(7);
    });
  });

  describe('MAX_GROUP_SIZE', () => {
    it('should be a positive number', () => {
      expect(MAX_GROUP_SIZE).toBeGreaterThan(0);
      expect(MAX_GROUP_SIZE).toBe(20);
    });
  });

  describe('DEFAULT_GROUP_COLORS', () => {
    it('should contain valid Chrome tab group colors', () => {
      const validColors = ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
      DEFAULT_GROUP_COLORS.forEach(color => {
        expect(validColors).toContain(color);
      });
    });

    it('should have expected length', () => {
      expect(DEFAULT_GROUP_COLORS).toHaveLength(8);
    });
  });

  describe('GROUPING_CONFIG', () => {
    it('should have correct structure', () => {
      expect(GROUPING_CONFIG).toEqual({
        autoGroupPrefix: AUTO_GROUP_PREFIX,
        ignoredUrlPatterns: IGNORED_URL_PATTERNS,
        maxGroupSize: MAX_GROUP_SIZE,
        enableAutoGrouping: true
      });
    });

    it('should have enableAutoGrouping as true by default', () => {
      expect(GROUPING_CONFIG.enableAutoGrouping).toBe(true);
    });
  });
});