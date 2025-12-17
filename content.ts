/**
 * Content Script for Research Assistant Extension
 *
 * This script runs on web pages and enables:
 * - Text selection detection
 * - Floating action button for quick summarization
 * - Auto-selection detection for side panel
 * - Communication with background service worker
 */

// Types
interface SelectionData {
  text: string;
  sourceUrl: string;
  sourceTitle: string;
  timestamp?: string;
  selectionLength?: number;
  trigger?: string;
}

// Global state
let selectionTimeout: ReturnType<typeof setTimeout> | null = null;
let lastSelectedText = '';
let isSidePanelOpen = false;
let autoSelectionEnabled = true;
let isInitialized = false;

// Create floating button element
function createFloatingButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = 'ra-floating-btn';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      <path d="M19 3v4"></path>
      <path d="M21 5h-4"></path>
    </svg>
    <span>Summarize</span>
  `;

  // Styles
  button.style.cssText = `
    position: fixed;
    display: none;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
    color: white;
    border: none;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    transform: scale(0.95);
    opacity: 0;
  `;

  // Hover effect
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.5), 0 3px 6px rgba(0, 0, 0, 0.15)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)';
  });

  return button;
}

// Create auto-selection notification
function createAutoSelectionNotification(): HTMLDivElement {
  const notification = document.createElement('div');
  notification.id = 'ra-auto-selection-notification';
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        <path d="M19 3v4"/>
        <path d="M21 5h-4"/>
      </svg>
      <span>Text sent to Research Assistant</span>
    </div>
  `;

  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 16px;
    background: #4F46E5;
    color: white;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 2147483646;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
  `;

  return notification;
}

// Show floating button near selection
function showFloatingButton(x: number, y: number): void {
  const button = document.getElementById('ra-floating-btn') as HTMLButtonElement;
  if (!button) return;

  // Position button above the selection
  const buttonWidth = 120;
  const buttonHeight = 36;
  const padding = 10;

  let posX = x - buttonWidth / 2;
  let posY = y - buttonHeight - padding;

  // Keep button within viewport
  posX = Math.max(padding, Math.min(posX, window.innerWidth - buttonWidth - padding));
  posY = Math.max(padding, posY);

  // If button would be above viewport, show below selection
  if (posY < padding) {
    posY = y + padding;
  }

  button.style.left = `${posX}px`;
  button.style.top = `${posY}px`;
  button.style.display = 'flex';

  // Animate in
  requestAnimationFrame(() => {
    button.style.opacity = '1';
    button.style.transform = 'scale(1)';
  });
}

// Hide floating button
function hideFloatingButton(): void {
  const button = document.getElementById('ra-floating-btn') as HTMLButtonElement;
  if (!button) return;

  button.style.opacity = '0';
  button.style.transform = 'scale(0.95)';

  setTimeout(() => {
    button.style.display = 'none';
  }, 200);
}

// Get selected text data
function getSelectionData(): SelectionData | null {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (!text || text.length < 10) {
    return null;
  }

  return {
    text,
    sourceUrl: window.location.href,
    sourceTitle: document.title || 'Unknown Page',
    timestamp: new Date().toISOString(),
    selectionLength: text.length
  };
}

// Send selection to background script
function sendToExtension(data: SelectionData, trigger: 'button' | 'auto' = 'button'): void {
  try {
    const payload = {
      ...data,
      trigger: trigger === 'auto' ? 'auto_selection' : 'floating_button'
    };

    chrome.runtime.sendMessage({
      type: 'SUMMARIZE_SELECTION',
      payload: payload
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Research Assistant: Extension context invalidated');
        return;
      }
      if (response?.success) {
        if (trigger === 'auto') {
          showAutoSelectionNotification();
        } else {
          showNotification('Text sent to Research Assistant!');
        }
      }
    });
  } catch (error) {
    console.log('Research Assistant: Could not communicate with extension');
  }
}

// Handle auto text selection
function handleAutoTextSelection(e: MouseEvent): void {
  // Clear any existing timeout
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }

  // Get the current selection
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  // Only process if there's actually text selected
  if (!selectedText || selectedText === lastSelectedText || selectedText.length < 10) {
    return;
  }

  // Update last selected text
  lastSelectedText = selectedText;

  // Set a timeout to debounce the selection
  selectionTimeout = setTimeout(() => {
    // Only send if auto-selection is enabled and side panel is not open
    if (autoSelectionEnabled && !isSidePanelOpen) {
      const data = getSelectionData();
      if (data) {
        console.log("🔍 Auto-selection detected:", {
          length: data.text.length,
          preview: data.text.substring(0, 100)
        });
        
        sendToExtension(data, 'auto');
      }
    }

    // Also show floating button for manual option
    const data = getSelectionData();
    if (data) {
      showFloatingButton(e.clientX, e.clientY);
    } else {
      hideFloatingButton();
    }
  }, 500); // 500ms debounce for auto-selection
}

// Show auto-selection notification
function showAutoSelectionNotification(): void {
  let notification = document.getElementById('ra-auto-selection-notification') as HTMLDivElement;
  
  if (!notification) {
    notification = createAutoSelectionNotification();
    document.body.appendChild(notification);
  }

  // Show notification
  requestAnimationFrame(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  });

  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Show notification toast
function showNotification(message: string): void {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #10B981;
    color: white;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 2147483645;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
  `;

  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      toast.remove();
      style.remove();
    }, 300);
  }, 2000);
}

// Clean up all event listeners and elements
function cleanup(): void {
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
    selectionTimeout = null;
  }
  
  document.removeEventListener('mouseup', handleAutoTextSelection, true);
  document.removeEventListener('mousedown', hideOnOutsideClick);
  document.removeEventListener('keydown', hideOnEscape);
  window.removeEventListener('scroll', handleScroll);
  
  // Remove floating button if exists
  const button = document.getElementById('ra-floating-btn');
  if (button && button.parentNode) {
    button.parentNode.removeChild(button);
  }
  
  // Remove notification if exists
  const notification = document.getElementById('ra-auto-selection-notification');
  if (notification && notification.parentNode) {
    notification.parentNode.removeChild(notification);
  }
  
  isInitialized = false;
  console.log('Research Assistant content script cleaned up');
}

// Event listener functions (for proper removal)
function hideOnOutsideClick(e: MouseEvent): void {
  if ((e.target as HTMLElement).id !== 'ra-floating-btn' &&
      !(e.target as HTMLElement).closest('#ra-floating-btn')) {
    hideFloatingButton();
  }
}

function hideOnEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    hideFloatingButton();
  }
}

let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
function handleScroll(): void {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(() => {
    hideFloatingButton();
  }, 100);
}

// Initialize content script
function init(): void {
  // Clean up first if already initialized
  if (isInitialized) {
    cleanup();
  }
  
  console.log('Research Assistant content script loaded for:', window.location.href);
  
  // Add floating button to page
  const button = createFloatingButton();
  document.body.appendChild(button);

  // Handle text selection for auto-detection
  document.addEventListener('mouseup', handleAutoTextSelection, true);

  // Handle floating button click
  button.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const data = getSelectionData();
    if (data) {
      sendToExtension(data, 'button');
      hideFloatingButton();

      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  });

  // Hide button when clicking elsewhere
  document.addEventListener('mousedown', hideOnOutsideClick);

  // Hide button on scroll
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Hide button when pressing Escape
  document.addEventListener('keydown', hideOnEscape);

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SIDE_PANEL_OPENED') {
      console.log('Side panel opened - disabling auto-selection');
      isSidePanelOpen = true;
      autoSelectionEnabled = false;
      
      // Re-enable after a delay
      setTimeout(() => {
        autoSelectionEnabled = true;
        isSidePanelOpen = false;
      }, 5000);
    }
    sendResponse({ received: true });
  });

  isInitialized = true;
  
  // Clean up on page unload
  window.addEventListener('beforeunload', cleanup);
}

// Handle SPA navigation
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    // Re-initialize for SPA navigation
    setTimeout(init, 100);
  }
});

observer.observe(document, { subtree: true, childList: true });

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    // Also observe for dynamic content
    observer.observe(document.body, { childList: true, subtree: true });
  });
} else {
  init();
}

export {};