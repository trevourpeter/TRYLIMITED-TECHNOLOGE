"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface KeyboardManagerContextType {
  disableGlobalShortcuts: () => void
  enableGlobalShortcuts: () => void
  areShortcutsEnabled: boolean
}

const KeyboardManagerContext = createContext<KeyboardManagerContextType | undefined>(undefined)

export function KeyboardManagerProvider({ children }: { children: ReactNode }) {
  const [areShortcutsEnabled, setAreShortcutsEnabled] = useState(true)

  const disableGlobalShortcuts = () => setAreShortcutsEnabled(false)
  const enableGlobalShortcuts = () => setAreShortcutsEnabled(true)

  return (
    <KeyboardManagerContext.Provider value={{
      disableGlobalShortcuts,
      enableGlobalShortcuts,
      areShortcutsEnabled
    }}>
      {children}
    </KeyboardManagerContext.Provider>
  )
}

export function useKeyboardManager() {
  const context = useContext(KeyboardManagerContext)
  if (context === undefined) {
    throw new Error("useKeyboardManager must be used within a KeyboardManagerProvider")
  }
  return context
}

// Hook to automatically disable shortcuts when a modal is open
export function useModalKeyboardManager(isOpen: boolean) {
  const { disableGlobalShortcuts, enableGlobalShortcuts } = useKeyboardManager()

  useEffect(() => {
    if (isOpen) {
      disableGlobalShortcuts()
    } else {
      enableGlobalShortcuts()
    }

    return () => {
      if (isOpen) {
        enableGlobalShortcuts()
      }
    }
  }, [isOpen, disableGlobalShortcuts, enableGlobalShortcuts])
} 