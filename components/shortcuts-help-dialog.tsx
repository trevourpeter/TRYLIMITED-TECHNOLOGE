"use client"

import { useState } from "react"
import { useShortcuts, type KeyboardShortcut } from "@/lib/shortcuts-manager"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Keyboard, Info } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ShortcutsHelpDialog() {
  const { shortcuts, formatShortcut } = useShortcuts()
  const [open, setOpen] = useState(false)

  const getCategoryShortcuts = (category: KeyboardShortcut["category"]) => {
    return shortcuts.filter((s) => s.category === category)
  }

  const categories: { value: KeyboardShortcut["category"]; label: string; description: string }[] = [
    { value: "general", label: "General", description: "Common actions throughout the app" },
    { value: "pos", label: "Point of Sale", description: "Quick sales and checkout operations" },
    { value: "products", label: "Products", description: "Product management shortcuts" },
    { value: "sales", label: "Sales", description: "Sales history and reporting" },
    { value: "navigation", label: "Navigation", description: "Navigate between pages" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick reference for all available keyboard shortcuts. You can customize these in Settings.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryShortcuts = getCategoryShortcuts(category.value)
              if (categoryShortcuts.length === 0) return null

              return (
                <div key={category.value}>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold">{category.label}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>

                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{shortcut.name}</div>
                          <div className="text-sm text-muted-foreground">{shortcut.description}</div>
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs px-3 py-1 ml-4">
                          {formatShortcut(shortcut)}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Separator className="mt-6" />
                </div>
              )
            })}

            <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Customization</p>
                <p>
                  You can customize all shortcuts in <strong>Settings → Keyboard Shortcuts</strong>. Each user account
                  can have different shortcuts.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
