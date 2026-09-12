"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface KeyboardShortcut {
  id: string
  name: string
  description: string
  key: string
  modifiers: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  }
  action: string
  category: "pos" | "navigation" | "products" | "sales" | "general"
}

export interface ShortcutsSettings {
  userId: string
  shortcuts: KeyboardShortcut[]
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "focus-search",
    name: "Focus Search",
    description: "Focus the search/filter input",
    key: "f",
    modifiers: { ctrl: true },
    action: "FOCUS_SEARCH",
    category: "general",
  },
  {
    id: "open-barcode-scanner",
    name: "Open Barcode Scanner",
    description: "Open the barcode scanner dialog",
    key: "b",
    modifiers: { ctrl: true },
    action: "OPEN_BARCODE_SCANNER",
    category: "pos",
  },
  {
    id: "complete-sale",
    name: "Complete Sale",
    description: "Open checkout dialog to complete the sale",
    key: "Enter",
    modifiers: { ctrl: true },
    action: "COMPLETE_SALE",
    category: "pos",
  },
  {
    id: "clear-cart",
    name: "Clear Cart",
    description: "Clear all items from the cart",
    key: "Delete",
    modifiers: { ctrl: true },
    action: "CLEAR_CART",
    category: "pos",
  },
  {
    id: "add-product",
    name: "Add New Product",
    description: "Open dialog to add a new product",
    key: "n",
    modifiers: { ctrl: true },
    action: "ADD_PRODUCT",
    category: "products",
  },
  {
    id: "quick-sale",
    name: "Quick Sale",
    description: "Open POS interface for quick sale",
    key: "s",
    modifiers: { ctrl: true, shift: true },
    action: "QUICK_SALE",
    category: "pos",
  },
  {
    id: "view-reports",
    name: "View Reports",
    description: "Navigate to reports page",
    key: "r",
    modifiers: { ctrl: true, shift: true },
    action: "VIEW_REPORTS",
    category: "navigation",
  },
  {
    id: "cash-up",
    name: "Cash Up",
    description: "Open cash up management",
    key: "u",
    modifiers: { ctrl: true, shift: true },
    action: "CASH_UP",
    category: "pos",
  },
]

interface ShortcutsContextType {
  shortcuts: KeyboardShortcut[]
  updateShortcut: (id: string, updates: Partial<KeyboardShortcut>) => void
  resetShortcuts: () => void
  getShortcutByAction: (action: string) => KeyboardShortcut | undefined
  checkShortcut: (e: KeyboardEvent, action: string) => boolean
  formatShortcut: (shortcut: KeyboardShortcut) => string
}

const ShortcutsContext = createContext<ShortcutsContextType | undefined>(undefined)

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(DEFAULT_SHORTCUTS)

  // Load user-specific shortcuts from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`shortcuts_${user.id}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as KeyboardShortcut[]
          setShortcuts(parsed)
        } catch (error) {
          console.error("Failed to parse shortcuts:", error)
          setShortcuts(DEFAULT_SHORTCUTS)
        }
      } else {
        setShortcuts(DEFAULT_SHORTCUTS)
      }
    }
  }, [user])

  // Save shortcuts whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`shortcuts_${user.id}`, JSON.stringify(shortcuts))
    }
  }, [shortcuts, user])

  const updateShortcut = (id: string, updates: Partial<KeyboardShortcut>) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const resetShortcuts = () => {
    setShortcuts(DEFAULT_SHORTCUTS)
    if (user) {
      localStorage.removeItem(`shortcuts_${user.id}`)
    }
  }

  const getShortcutByAction = (action: string) => {
    return shortcuts.find((s) => s.action === action)
  }

  const checkShortcut = (e: KeyboardEvent, action: string): boolean => {
    const shortcut = getShortcutByAction(action)
    if (!shortcut) return false

    const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
    const ctrlMatch = !!e.ctrlKey === !!shortcut.modifiers.ctrl
    const altMatch = !!e.altKey === !!shortcut.modifiers.alt
    const shiftMatch = !!e.shiftKey === !!shortcut.modifiers.shift
    const metaMatch = !!e.metaKey === !!shortcut.modifiers.meta

    return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch
  }

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    if (shortcut.modifiers.ctrl) parts.push("Ctrl")
    if (shortcut.modifiers.alt) parts.push("Alt")
    if (shortcut.modifiers.shift) parts.push("Shift")
    if (shortcut.modifiers.meta) parts.push("Meta")
    
    // Format the key nicely
    let keyDisplay = shortcut.key
    if (shortcut.key === " ") keyDisplay = "Space"
    else if (shortcut.key.length === 1) keyDisplay = shortcut.key.toUpperCase()
    
    parts.push(keyDisplay)
    return parts.join(" + ")
  }

  return (
    <ShortcutsContext.Provider
      value={{
        shortcuts,
        updateShortcut,
        resetShortcuts,
        getShortcutByAction,
        checkShortcut,
        formatShortcut,
      }}
    >
      {children}
    </ShortcutsContext.Provider>
  )
}

export function useShortcuts() {
  const context = useContext(ShortcutsContext)
  if (context === undefined) {
    throw new Error("useShortcuts must be used within a ShortcutsProvider")
  }
  return context
}
