import { handleTabCreated } from './handlers/tab-created';

// Set up event listeners when the extension starts
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome Tab Auto Grouping extension installed');
});

// Listen for tab creation events
chrome.tabs.onCreated.addListener((tab) => {
  handleTabCreated(tab);
});

// Log that background script is loaded
console.log('Chrome Tab Auto Grouping background script loaded');