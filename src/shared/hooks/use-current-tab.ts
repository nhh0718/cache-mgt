import { useCallback, useEffect, useState } from "react"

interface CurrentTab {
  url: string
  domain: string
  tabId: number
}

/**
 * Hook to get the current active tab's URL and domain.
 * Auto-updates when user switches tabs or navigates to a new page.
 */
export function useCurrentTab() {
  const [tab, setTab] = useState<CurrentTab | null>(null)

  const refreshTab = useCallback(async () => {
    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (activeTab?.url) {
        const urlObj = new URL(activeTab.url)
        setTab({
          url: activeTab.url,
          domain: urlObj.hostname,
          tabId: activeTab.id!
        })
      }
    } catch {
      // Silently fail — tab info not critical
    }
  }, [])

  useEffect(() => {
    refreshTab()

    // Re-fetch when user switches to a different tab
    const onActivated = () => { refreshTab() }
    chrome.tabs.onActivated.addListener(onActivated)

    // Re-fetch when the current tab navigates to a new URL
    const onUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.url || changeInfo.status === "complete") {
        refreshTab()
      }
    }
    chrome.tabs.onUpdated.addListener(onUpdated)

    return () => {
      chrome.tabs.onActivated.removeListener(onActivated)
      chrome.tabs.onUpdated.removeListener(onUpdated)
    }
  }, [refreshTab])

  return tab
}
