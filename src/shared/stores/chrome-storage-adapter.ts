import type { StateStorage } from "zustand/middleware"

/**
 * Zustand persist adapter using chrome.storage.local.
 * Enables cross-view state synchronization between popup, sidepanel, and fullpage.
 */
export const chromeStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const result = await chrome.storage.local.get(name)
    return result[name] ?? null
  },

  setItem: async (name: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [name]: value })
  },

  removeItem: async (name: string): Promise<void> => {
    await chrome.storage.local.remove(name)
  }
}
