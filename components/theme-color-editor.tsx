"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Palette, RotateCcw, Save } from "lucide-react"
import { useThemeManager, type Theme, type ThemeColors } from "@/lib/theme-manager"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ColorEditorProps {
  theme: Theme
  open: boolean
  onClose: () => void
  onSave: (updatedTheme: Theme) => void
}

// Helper to convert HSL string to hex
function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(" ").map((v) => parseFloat(v.replace("%", "")))
  const lightness = l / 100
  const saturation = s / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const huePrime = h / 60
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1))
  const m = lightness - chroma / 2

  let r = 0,
    g = 0,
    b = 0

  if (huePrime >= 0 && huePrime < 1) {
    r = chroma
    g = x
    b = 0
  } else if (huePrime >= 1 && huePrime < 2) {
    r = x
    g = chroma
    b = 0
  } else if (huePrime >= 2 && huePrime < 3) {
    r = 0
    g = chroma
    b = x
  } else if (huePrime >= 3 && huePrime < 4) {
    r = 0
    g = x
    b = chroma
  } else if (huePrime >= 4 && huePrime < 5) {
    r = x
    g = 0
    b = chroma
  } else if (huePrime >= 5 && huePrime < 6) {
    r = chroma
    g = 0
    b = x
  }

  const red = Math.round((r + m) * 255)
  const green = Math.round((g + m) * 255)
  const blue = Math.round((b + m) * 255)

  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`
}

// Helper to convert hex to HSL string
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function ThemeColorEditor({ theme, open, onClose, onSave }: ColorEditorProps) {
  const [editedTheme, setEditedTheme] = useState<Theme>(JSON.parse(JSON.stringify(theme)))
  const [mode, setMode] = useState<"light" | "dark">("light")

  const colorGroups = [
    {
      name: "Base Colors",
      colors: [
        { key: "background", label: "Background" },
        { key: "foreground", label: "Foreground" },
      ],
    },
    {
      name: "Primary Colors",
      colors: [
        { key: "primary", label: "Primary" },
        { key: "primaryForeground", label: "Primary Text" },
      ],
    },
    {
      name: "Secondary Colors",
      colors: [
        { key: "secondary", label: "Secondary" },
        { key: "secondaryForeground", label: "Secondary Text" },
      ],
    },
    {
      name: "Accent Colors",
      colors: [
        { key: "accent", label: "Accent" },
        { key: "accentForeground", label: "Accent Text" },
      ],
    },
    {
      name: "Muted Colors",
      colors: [
        { key: "muted", label: "Muted" },
        { key: "mutedForeground", label: "Muted Text" },
      ],
    },
    {
      name: "UI Elements",
      colors: [
        { key: "card", label: "Card" },
        { key: "cardForeground", label: "Card Text" },
        { key: "popover", label: "Popover" },
        { key: "popoverForeground", label: "Popover Text" },
        { key: "border", label: "Border" },
        { key: "input", label: "Input" },
        { key: "ring", label: "Focus Ring" },
      ],
    },
    {
      name: "Semantic Colors",
      colors: [
        { key: "destructive", label: "Destructive" },
        { key: "destructiveForeground", label: "Destructive Text" },
      ],
    },
    {
      name: "Sidebar Colors",
      colors: [
        { key: "sidebarBackground", label: "Sidebar Background" },
        { key: "sidebarForeground", label: "Sidebar Text" },
        { key: "sidebarPrimary", label: "Sidebar Primary" },
        { key: "sidebarPrimaryForeground", label: "Sidebar Primary Text" },
        { key: "sidebarAccent", label: "Sidebar Accent" },
        { key: "sidebarAccentForeground", label: "Sidebar Accent Text" },
        { key: "sidebarBorder", label: "Sidebar Border" },
        { key: "sidebarRing", label: "Sidebar Ring" },
      ],
    },
  ]

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setEditedTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [mode]: {
          ...prev.colors[mode],
          [key]: hexToHsl(value),
        },
      },
    }))
  }

  const handleSave = () => {
    onSave(editedTheme)
    onClose()
  }

  const handleReset = () => {
    setEditedTheme(JSON.parse(JSON.stringify(theme)))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] w-[95vw] sm:w-full flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Edit Theme Colors: {theme.name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Customize every color in your theme. Changes are previewed in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "light" | "dark")} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 w-full flex-shrink-0">
              <TabsTrigger value="light">Light Mode</TabsTrigger>
              <TabsTrigger value="dark">Dark Mode</TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="mt-4 flex-1 overflow-y-auto">
              <div className="space-y-4 sm:space-y-6 pb-4">
                {colorGroups.map((group) => (
                  <div key={group.name}>
                    <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-muted-foreground">{group.name}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {group.colors.map(({ key, label }) => {
                        const hslValue = editedTheme.colors[mode][key as keyof ThemeColors]
                        const hexValue = hslToHex(hslValue)

                        return (
                          <div key={key} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded border-2 border-gray-300 cursor-pointer shadow-sm flex-shrink-0"
                                style={{ backgroundColor: `hsl(${hslValue})` }}
                                title="Click to change color"
                              />
                              <div className="flex-1 min-w-0">
                                <Label className="text-xs font-medium block mb-1 truncate">{label}</Label>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Input
                                    type="color"
                                    value={hexValue}
                                    onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                                    className="w-12 sm:w-16 h-7 sm:h-8 p-0.5 sm:p-1 cursor-pointer flex-shrink-0"
                                  />
                                  <Input
                                    type="text"
                                    value={hexValue}
                                    onChange={(e) => {
                                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                        handleColorChange(key as keyof ThemeColors, e.target.value)
                                      }
                                    }}
                                    className="text-[10px] sm:text-xs h-7 sm:h-8 font-mono min-w-0"
                                    placeholder="#000000"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 w-full">
              <p className="font-semibold mb-1">Tips:</p>
              <p className="break-words">Click swatches to pick colors • Type hex codes • Switch Light/Dark modes • Reset to restore</p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t gap-2 flex-col sm:flex-row flex-shrink-0">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Colors
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
