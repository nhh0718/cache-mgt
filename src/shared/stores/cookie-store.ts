import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { CookieItem, CookieProfile } from "../types/cookie"
import { chromeStorageAdapter } from "./chrome-storage-adapter"

interface CookieStoreState {
  /** Saved cookie profiles/presets */
  profiles: CookieProfile[]

  // Actions
  addProfile: (profile: CookieProfile) => void
  removeProfile: (id: string) => void
}

export const useCookieStore = create<CookieStoreState>()(
  persist(
    (set) => ({
      profiles: [],

      addProfile: (profile) =>
        set((state) => ({ profiles: [...state.profiles, profile] })),
      removeProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id)
        }))
    }),
    {
      name: "cookie-manager-store",
      storage: createJSONStorage(() => chromeStorageAdapter)
    }
  )
)
