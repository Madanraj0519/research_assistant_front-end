/**
 * Background Service Worker for Research Assistant Extension
 * Handles context menu, side panel, and communication
 */

// Initialize on installation
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for text selection
  chrome.contextMenus.create({
    id: "summarize-text",
    title: "Summarize with Research Assistant",
    contexts: ["selection"]
  });

  // Enable side panel globally
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  
  console.log("Research Assistant installed successfully");
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("🎯 Context menu clicked!", {
    menuItemId: info.menuItemId,
    hasText: !!info.selectionText,
    textPreview: info.selectionText?.substring(0, 50) + "...",
    tabTitle: tab?.title
  });

  if (info.menuItemId === "summarize-text" && info.selectionText) {
    console.log("📝 Saving selected text to storage");
    
    const contextData = {
      text: info.selectionText,
      sourceUrl: tab?.url || '',
      sourceTitle: tab?.title || 'Unknown Page',
      timestamp: new Date().toISOString(),
      selectionLength: info.selectionText.length,
      trigger: 'context_menu'
    };
    
    // Save to storage and open side panel
    saveContextAndNotify(contextData, tab?.id);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Message received in background:", message.type);
  
  if (message.type === 'SUMMARIZE_SELECTION' && message.payload) {
    console.log("📋 Auto-selection detected:", {
      length: message.payload.text?.length,
      url: message.payload.sourceUrl
    });
    
    // Add trigger type
    message.payload.trigger = 'auto_selection';
    
    saveContextAndNotify(message.payload, sender.tab?.id);
    sendResponse({ success: true });
  } else if (message.type === 'GET_CURRENT_CONTEXT') {
    // Return current context if any
    chrome.storage.local.get(['pendingContext'], (result) => {
      sendResponse(result.pendingContext || null);
    });
    return true; // Keep message channel open for async response
  } else if (message.type === 'CLEAR_CONTEXT') {
    // Clear the context
    chrome.storage.local.remove(['pendingContext']);
    chrome.action.setBadgeText({ text: "" });
    sendResponse({ success: true });
  } else if (message.type === 'RELOAD_CONTENT_SCRIPT') {
    // Reload content script for the current tab
    if (sender.tab?.id) {
      chrome.tabs.reload(sender.tab.id);
      sendResponse({ success: true });
    }
  }
  return true;
});

// Listen for side panel opening
chrome.sidePanel.onOpened.addListener(async ({ tabId }) => {
  console.log("🔓 Side panel opened");
  
  // Clear the badge notification
  await chrome.action.setBadgeText({ text: "" });
  
  // Notify content script that side panel opened
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'SIDE_PANEL_OPENED'
    });
  } catch (error) {
    // Content script might not be loaded on this page
    console.log("Could not notify content script:", error);
    
    // Try to inject content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
      console.log("Content script injected");
    } catch (injectError) {
      console.log("Could not inject content script:", injectError);
    }
  }
});

// Listen for extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log("🖱️ Extension icon clicked");
  
  // Check if there's pending context
  const result = await chrome.storage.local.get(['pendingContext']);
  if (result.pendingContext) {
    console.log("📝 Opening side panel with pending context");
    // Side panel will auto-open due to setPanelBehavior
  } else {
    console.log("ℹ️ No pending context, opening empty side panel");
    // Open side panel anyway
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.log("Error opening side panel:", error);
    }
  }
});

// Listen for tab activation to clear old context
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Clear context when switching tabs
  await chrome.storage.local.remove(['pendingContext']);
  await chrome.action.setBadgeText({ text: "" });
  console.log("🧹 Cleared context due to tab switch");
});

// Listen for tab updates (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    // Clear context when page reloads or navigates
    chrome.storage.local.remove(['pendingContext']);
    chrome.action.setBadgeText({ text: "" });
    console.log("🧹 Cleared context due to page navigation");
  }
});

/**
 * Save context data and show notification badge
 */
async function saveContextAndNotify(contextData, tabId) {
  if (!contextData.text || contextData.text.trim().length < 10) {
    console.log("Text too short to summarize");
    return;
  }

  try {
    console.log("💾 Saving context to storage:", {
      textLength: contextData.text.length,
      source: contextData.sourceTitle,
      trigger: contextData.trigger
    });

    // Save to local storage
    await chrome.storage.local.set({ 
      pendingContext: contextData,
      lastUpdated: new Date().toISOString()
    });

    // Show badge notification
    await chrome.action.setBadgeText({ text: "1" });
    await chrome.action.setBadgeBackgroundColor({ color: "#4F46E5" });
    await chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
    
    console.log("✅ Context saved and badge updated");

    // Try to open side panel automatically if it's not already open
    if (tabId && contextData.trigger === 'auto_selection') {
      try {
        // Check if side panel is already open
        const sidePanelOptions = await chrome.sidePanel.getOptions({ tabId });
        
        if (!sidePanelOptions.enabled) {
          // Enable side panel for this tab
          await chrome.sidePanel.setOptions({
            tabId,
            enabled: true,
            path: 'index.html?view=sidepanel'
          });
        }
        
        // Open side panel
        await chrome.sidePanel.open({ tabId });
        console.log("🚪 Side panel opened automatically");
      } catch (error) {
        console.log("Could not auto-open side panel:", error);
      }
    }
    
  } catch (error) {
    console.error("❌ Error saving context:", error);
  }
}

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.pendingContext) {
    console.log("🔄 Pending context updated");
  }
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log("🔄 Update available:", details.version);
  chrome.runtime.reload();
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});