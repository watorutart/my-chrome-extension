import { describe, it, expect } from 'vitest';
import type { TabInfo, GroupInfo, DomainGroup, GroupingConfig } from '../types';

describe('型定義テスト', () => {
  describe('TabInfoインターフェース', () => {
    it('有効なTabInfoオブジェクトを受け入れること', () => {
      const tabInfo: TabInfo = {
        id: 1,
        url: 'https://example.com',
        title: 'Example',
        windowId: 1,
        groupId: 1,
        domain: 'example.com'
      };
      
      expect(tabInfo.id).toBe(1);
      expect(tabInfo.url).toBe('https://example.com');
      expect(tabInfo.domain).toBe('example.com');
    });

    it('必須フィールドのみTabInfoを受け入れること', () => {
      const tabInfo: TabInfo = {
        id: 1,
        windowId: 1
      };
      
      expect(tabInfo.id).toBe(1);
      expect(tabInfo.windowId).toBe(1);
      expect(tabInfo.url).toBeUndefined();
    });
  });

  describe('GroupInfoインターフェース', () => {
    it('有効なGroupInfoオブジェクトを受け入れること', () => {
      const groupInfo: GroupInfo = {
        id: 1,
        title: 'Test Group',
        color: 'blue',
        collapsed: false,
        windowId: 1,
        domain: 'example.com'
      };
      
      expect(groupInfo.id).toBe(1);
      expect(groupInfo.color).toBe('blue');
      expect(groupInfo.collapsed).toBe(false);
    });

    it('必須フィールドのみGroupInfoを受け入れること', () => {
      const groupInfo: GroupInfo = {
        id: 1,
        color: 'red',
        collapsed: true,
        windowId: 1
      };
      
      expect(groupInfo.id).toBe(1);
      expect(groupInfo.color).toBe('red');
      expect(groupInfo.title).toBeUndefined();
    });
  });

  describe('DomainGroupインターフェース', () => {
    it('有効なDomainGroupオブジェクトを受け入れること', () => {
      const domainGroup: DomainGroup = {
        domain: 'example.com',
        groupId: 1,
        tabIds: [1, 2, 3]
      };
      
      expect(domainGroup.domain).toBe('example.com');
      expect(domainGroup.groupId).toBe(1);
      expect(domainGroup.tabIds).toHaveLength(3);
    });

    it('groupIdなしのDomainGroupを受け入れること', () => {
      const domainGroup: DomainGroup = {
        domain: 'example.com',
        tabIds: [1, 2]
      };
      
      expect(domainGroup.domain).toBe('example.com');
      expect(domainGroup.groupId).toBeUndefined();
      expect(domainGroup.tabIds).toEqual([1, 2]);
    });
  });

  describe('GroupingConfigインターフェース', () => {
    it('有効なGroupingConfigオブジェクトを受け入れること', () => {
      const config: GroupingConfig = {
        autoGroupPrefix: '[Test]',
        ignoredUrlPatterns: ['chrome://'],
        maxGroupSize: 10,
        enableAutoGrouping: true
      };
      
      expect(config.autoGroupPrefix).toBe('[Test]');
      expect(config.ignoredUrlPatterns).toEqual(['chrome://']);
      expect(config.maxGroupSize).toBe(10);
      expect(config.enableAutoGrouping).toBe(true);
    });
  });
});