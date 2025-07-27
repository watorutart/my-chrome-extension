import { handleTabCreated } from './handlers/tab-created';
import { handleTabUpdated } from './handlers/tab-updated';
import { handleTabMoved } from './handlers/tab-moved';

// Set up event listeners when the extension starts
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome Tab Auto Grouping extension installed');
});

// Listen for tab creation events
chrome.tabs.onCreated.addListener((tab) => {
  handleTabCreated(tab);
});

// Listen for tab update events (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  handleTabUpdated(tabId, changeInfo, tab);
});

// Listen for tab move events (window changes, position changes)
chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  handleTabMoved(tabId, moveInfo);
});

// Log that background script is loaded
console.log('Chrome Tab Auto Grouping background script loaded');