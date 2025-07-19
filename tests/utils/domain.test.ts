import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractDomain, isValidDomain, findTabsByDomain } from '../../src/utils/domain';

describe('Domain Utils', () => {
  describe('extractDomain', () => {
    it('should extract domain from https URL', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com');
    });

    it('should extract domain from http URL', () => {
      expect(extractDomain('http://example.com/path')).toBe('example.com');
    });

    it('should extract domain from URL with subdomain', () => {
      expect(extractDomain('https://sub.example.com/path')).toBe('sub.example.com');
    });

    it('should extract domain from URL with port', () => {
      expect(extractDomain('https://example.com:8080/path')).toBe('example.com');
    });

    it('should return null for invalid URL', () => {
      expect(extractDomain('not-a-url')).toBeNull();
    });

    it('should return null for undefined URL', () => {
      expect(extractDomain(undefined)).toBeNull();
    });

    it('should return null for chrome:// URLs', () => {
      expect(extractDomain('chrome://settings')).toBeNull();
    });

    it('should return null for chrome-extension:// URLs', () => {
      expect(extractDomain('chrome-extension://abc123/popup.html')).toBeNull();
    });
  });

  describe('isValidDomain', () => {
    it('should return true for valid domain', () => {
      expect(isValidDomain('example.com')).toBe(true);
    });

    it('should return true for subdomain', () => {
      expect(isValidDomain('sub.example.com')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidDomain('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidDomain(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidDomain(undefined)).toBe(false);
    });

    it('should return false for domain with spaces', () => {
      expect(isValidDomain('example .com')).toBe(false);
    });

    it('should return false for invalid characters', () => {
      expect(isValidDomain('example@.com')).toBe(false);
    });
  });

  describe('findTabsByDomain', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should find tabs by domain', async () => {
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

    it('should return empty array when no tabs match domain', async () => {
      const mockTabs = [
        { id: 1, url: 'https://other.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabs as chrome.tabs.Tab[]);

      const result = await findTabsByDomain('example.com');
      
      expect(result).toHaveLength(0);
    });

    it('should handle tabs without URL', async () => {
      const mockTabs = [
        { id: 1, windowId: 1 }, // No URL
        { id: 2, url: 'https://example.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabs as chrome.tabs.Tab[]);

      const result = await findTabsByDomain('example.com');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('should filter by windowId when provided', async () => {
      const mockTabsWindow1 = [
        { id: 1, url: 'https://example.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabsWindow1 as chrome.tabs.Tab[]);

      const result = await findTabsByDomain('example.com', 1);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: 1 });
    });

    it('should query all windows when windowId not provided', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com/page1', windowId: 1 }
      ];

      vi.mocked(chrome.tabs.query).mockResolvedValue(mockTabs as chrome.tabs.Tab[]);

      await findTabsByDomain('example.com');
      
      expect(chrome.tabs.query).toHaveBeenCalledWith({});
    });
  });
});