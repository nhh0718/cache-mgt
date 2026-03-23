/**
 * Background service worker for Cookie Manager extension.
 * Handles side panel setup and cookie change events.
 */

// Open side panel on extension icon click (right-click context or action click)
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch(() => {})

// Listen for messages from popup/views to open side panel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "open-sidepanel" && message.windowId) {
    chrome.sidePanel
      .open({ windowId: message.windowId })
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }))
    return true // Keep message channel open for async response
  }
})

// Log cookie changes
chrome.cookies.onChanged.addListener((changeInfo) => {
  console.log(
    `Cookie ${changeInfo.cause}: ${changeInfo.cookie.name} (${changeInfo.cookie.domain})`
  )
})

export {}
