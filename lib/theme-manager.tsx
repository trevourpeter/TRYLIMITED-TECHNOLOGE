"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface ThemeColors {
  // Base colors
  background: string
  foreground: string
  
  // Component colors
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  
  // UI colors
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  
  // Semantic colors
  destructive: string
  destructiveForeground: string
  
  // Borders and inputs
  border: string
  input: string
  ring: string
  
  // Sidebar colors
  sidebarBackground: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
  sidebarAccent: string
  sidebarAccentForeground: string
  sidebarBorder: string
  sidebarRing: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
  isCustom?: boolean
}

// Default/System theme
const DEFAULT_THEME: Theme = {
  id: "default",
  name: "Default",
  description: "Clean and professional default theme",
  colors: {
    light: {
      background: "0 0% 100%",
      foreground: "0 0% 3.9%",
      card: "0 0% 100%",
      cardForeground: "0 0% 3.9%",
      popover: "0 0% 100%",
      popoverForeground: "0 0% 3.9%",
      primary: "0 0% 9%",
      primaryForeground: "0 0% 98%",
      secondary: "0 0% 96.1%",
      secondaryForeground: "0 0% 9%",
      muted: "0 0% 96.1%",
      mutedForeground: "0 0% 45.1%",
      accent: "0 0% 96.1%",
      accentForeground: "0 0% 9%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 89.8%",
      input: "0 0% 89.8%",
      ring: "0 0% 3.9%",
      sidebarBackground: "0 0% 98%",
      sidebarForeground: "240 5.3% 26.1%",
      sidebarPrimary: "240 5.9% 10%",
      sidebarPrimaryForeground: "0 0% 98%",
      sidebarAccent: "240 4.8% 95.9%",
      sidebarAccentForeground: "240 5.9% 10%",
      sidebarBorder: "220 13% 91%",
      sidebarRing: "217.2 91.2% 59.8%",
    },
    dark: {
      background: "0 0% 3.9%",
      foreground: "0 0% 98%",
      card: "0 0% 3.9%",
      cardForeground: "0 0% 98%",
      popover: "0 0% 3.9%",
      popoverForeground: "0 0% 98%",
      primary: "0 0% 98%",
      primaryForeground: "0 0% 9%",
      secondary: "0 0% 14.9%",
      secondaryForeground: "0 0% 98%",
      muted: "0 0% 14.9%",
      mutedForeground: "0 0% 63.9%",
      accent: "0 0% 14.9%",
      accentForeground: "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 14.9%",
      input: "0 0% 14.9%",
      ring: "0 0% 83.1%",
      sidebarBackground: "240 5.9% 10%",
      sidebarForeground: "240 4.8% 95.9%",
      sidebarPrimary: "224.3 76.3% 48%",
      sidebarPrimaryForeground: "0 0% 100%",
      sidebarAccent: "240 3.7% 15.9%",
      sidebarAccentForeground: "240 4.8% 95.9%",
      sidebarBorder: "240 3.7% 15.9%",
      sidebarRing: "217.2 91.2% 59.8%",
    },
  },
}

// Predefined themes
const PREDEFINED_THEMES: Theme[] = [
  DEFAULT_THEME,
  {
    id: "blue",
    name: "Ocean Blue",
    description: "Calm and professional blue theme",
    colors: {
      light: {
        ...DEFAULT_THEME.colors.light,
        primary: "221.2 83.2% 53.3%",
        primaryForeground: "210 40% 98%",
        accent: "210 40% 96.1%",
        accentForeground: "222.2 47.4% 11.2%",
        sidebarBackground: "210 40% 96.1%",
        sidebarPrimary: "221.2 83.2% 53.3%",
        sidebarAccent: "210 40% 90%",
      },
      dark: {
        ...DEFAULT_THEME.colors.dark,
        primary: "217.2 91.2% 59.8%",
        primaryForeground: "222.2 47.4% 11.2%",
        accent: "217.2 32.6% 17.5%",
        sidebarPrimary: "217.2 91.2% 59.8%",
      },
    },
  },
  {
    id: "green",
    name: "Forest Green",
    description: "Natural and refreshing green theme",
    colors: {
      light: {
        ...DEFAULT_THEME.colors.light,
        primary: "142.1 76.2% 36.3%",
        primaryForeground: "355.7 100% 97.3%",
        accent: "142.1 76.2% 90%",
        accentForeground: "142.1 76.2% 16.3%",
        sidebarBackground: "142.1 76.2% 96%",
        sidebarPrimary: "142.1 76.2% 36.3%",
        sidebarAccent: "142.1 76.2% 88%",
      },
      dark: {
        ...DEFAULT_THEME.colors.dark,
        primary: "142.1 70.6% 45.3%",
        primaryForeground: "144.9 80.4% 10%",
        accent: "142.1 30% 20%",
        sidebarPrimary: "142.1 70.6% 45.3%",
      },
    },
  },
  {
    id: "purple",
    name: "Royal Purple",
    description: "Elegant and modern purple theme",
    colors: {
      light: {
        ...DEFAULT_THEME.colors.light,
        primary: "262.1 83.3% 57.8%",
        primaryForeground: "210 20% 98%",
        accent: "270 95.2% 95%",
        accentForeground: "262.1 83.3% 27.8%",
        sidebarBackground: "270 95.2% 97%",
        sidebarPrimary: "262.1 83.3% 57.8%",
        sidebarAccent: "270 95.2% 90%",
      },
      dark: {
        ...DEFAULT_THEME.colors.dark,
        primary: "263.4 70% 50.4%",
        primaryForeground: "210 20% 98%",
        accent: "262.1 30% 20%",
        sidebarPrimary: "263.4 70% 50.4%",
      },
    },
  },
  {
    id: "orange",
    name: "Sunset Orange",
    description: "Warm and energetic orange theme",
    colors: {
      light: {
        ...DEFAULT_THEME.colors.light,
        primary: "24.6 95% 53.1%",
        primaryForeground: "60 9.1% 97.8%",
        accent: "24.6 95% 95%",
        accentForeground: "24.6 95% 23.1%",
        sidebarBackground: "24.6 95% 97%",
        sidebarPrimary: "24.6 95% 53.1%",
        sidebarAccent: "24.6 95% 90%",
      },
      dark: {
        ...DEFAULT_THEME.colors.dark,
        primary: "20.5 90.2% 48.2%",
        primaryForeground: "60 9.1% 97.8%",
        accent: "24.6 30% 20%",
        sidebarPrimary: "20.5 90.2% 48.2%",
      },
    },
  },
  {
    id: "rose",
    name: "Elegant Rose",
    description: "Soft and sophisticated rose theme",
    colors: {
      light: {
        ...DEFAULT_THEME.colors.light,
        primary: "346.8 77.2% 49.8%",
        primaryForeground: "355.7 100% 97.3%",
        accent: "346.8 77.2% 95%",
        accentForeground: "346.8 77.2% 19.8%",
        sidebarBackground: "346.8 77.2% 97%",
        sidebarPrimary: "346.8 77.2% 49.8%",
        sidebarAccent: "346.8 77.2% 90%",
      },
      dark: {
        ...DEFAULT_THEME.colors.dark,
        primary: "346.8 77.2% 49.8%",
        primaryForeground: "355.7 100% 97.3%",
        accent: "346.8 30% 20%",
        sidebarPrimary: "346.8 77.2% 49.8%",
      },
    },
  },
]

interface ThemeContextType {
  currentTheme: Theme
  themes: Theme[]
  isDarkMode: boolean
  setTheme: (themeId: string) => void
  toggleDarkMode: () => void
  createCustomTheme: (theme: Omit<Theme, "id" | "isCustom">) => void
  updateCustomTheme: (themeId: string, theme: Partial<Theme>) => void
  deleteCustomTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeManagerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentThemeId, setCurrentThemeId] = useState("default")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [customThemes, setCustomThemes] = useState<Theme[]>([])

  const themes = [...PREDEFINED_THEMES, ...customThemes]
  const currentTheme = themes.find((t) => t.id === currentThemeId) || DEFAULT_THEME

  // Load user preferences
  useEffect(() => {
    if (user) {
      const storedThemeId = localStorage.getItem(`theme_${user.id}`)
      const storedDarkMode = localStorage.getItem(`darkMode_${user.id}`)
      const storedCustomThemes = localStorage.getItem(`customThemes_${user.id}`)

      if (storedThemeId) setCurrentThemeId(storedThemeId)
      if (storedDarkMode) setIsDarkMode(storedDarkMode === "true")
      if (storedCustomThemes) {
        try {
          setCustomThemes(JSON.parse(storedCustomThemes))
        } catch (error) {
          console.error("Failed to parse custom themes:", error)
        }
      }
    }
  }, [user])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const colors = isDarkMode ? currentTheme.colors.dark : currentTheme.colors.light

    // Apply all CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })

    // Toggle dark class
    if (isDarkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [currentTheme, isDarkMode])

  // Save preferences
  useEffect(() => {
    if (user) {
      localStorage.setItem(`theme_${user.id}`, currentThemeId)
      localStorage.setItem(`darkMode_${user.id}`, isDarkMode.toString())
      localStorage.setItem(`customThemes_${user.id}`, JSON.stringify(customThemes))
    }
  }, [currentThemeId, isDarkMode, customThemes, user])

  const setTheme = (themeId: string) => {
    setCurrentThemeId(themeId)
  }

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  const createCustomTheme = (theme: Omit<Theme, "id" | "isCustom">) => {
    const newTheme: Theme = {
      ...theme,
      id: `custom-${Date.now()}`,
      isCustom: true,
    }
    setCustomThemes((prev) => [...prev, newTheme])
    setCurrentThemeId(newTheme.id)
  }

  const updateCustomTheme = (themeId: string, updates: Partial<Theme>) => {
    setCustomThemes((prev) =>
      prev.map((t) => (t.id === themeId ? { ...t, ...updates } : t))
    )
  }

  const deleteCustomTheme = (themeId: string) => {
    setCustomThemes((prev) => prev.filter((t) => t.id !== themeId))
    if (currentThemeId === themeId) {
      setCurrentThemeId("default")
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        isDarkMode,
        setTheme,
        toggleDarkMode,
        createCustomTheme,
        updateCustomTheme,
        deleteCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeManager() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useThemeManager must be used within a ThemeManagerProvider")
  }
  return context
}
