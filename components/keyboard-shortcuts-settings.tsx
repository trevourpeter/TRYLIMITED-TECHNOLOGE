"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Keyboard, RotateCcw, Edit2, X, Check } from "lucide-react"
import { useShortcuts, type KeyboardShortcut } from "@/lib/shortcuts-manager"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function KeyboardShortcutsSettings() {
  const { shortcuts, updateShortcut, resetShortcuts, formatShortcut } = useShortcuts()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedKeys, setRecordedKeys] = useState<{
    key: string
    ctrl: boolean
    alt: boolean
    shift: boolean
    meta: boolean
  } | null>(null)
  const [showSuccess, setShowSuccess] = useState("")
  const [error, setError] = useState("")

  const handleStartRecording = (shortcutId: string) => {
    setEditingId(shortcutId)
    setIsRecording(true)
    setRecordedKeys(null)
    setError("")
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isRecording) return

    e.preventDefault()
    e.stopPropagation()

    // Ignore modifier keys alone
    if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      return
    }

    setRecordedKeys({
      key: e.key,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
    })
  }

  const handleSaveShortcut = () => {
    if (!editingId || !recordedKeys) return

    // Check for conflicts
    const conflict = shortcuts.find(
      (s) =>
        s.id !== editingId &&
        s.key.toLowerCase() === recordedKeys.key.toLowerCase() &&
        !!s.modifiers.ctrl === recordedKeys.ctrl &&
        !!s.modifiers.alt === recordedKeys.alt &&
        !!s.modifiers.shift === recordedKeys.shift &&
        !!s.modifiers.meta === recordedKeys.meta
    )

    if (conflict) {
      setError(`This shortcut is already assigned to "${conflict.name}"`)
      return
    }

    updateShortcut(editingId, {
      key: recordedKeys.key,
      modifiers: {
        ctrl: recordedKeys.ctrl,
        alt: recordedKeys.alt,
        shift: recordedKeys.shift,
        meta: recordedKeys.meta,
      },
    })

    setShowSuccess("Shortcut updated successfully!")
    setTimeout(() => setShowSuccess(""), 3000)
    setEditingId(null)
    setIsRecording(false)
    setRecordedKeys(null)
    setError("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setIsRecording(false)
    setRecordedKeys(null)
    setError("")
  }

  const handleResetAll = () => {
    if (confirm("Are you sure you want to reset all shortcuts to defaults?")) {
      resetShortcuts()
      setShowSuccess("All shortcuts reset to defaults!")
      setTimeout(() => setShowSuccess(""), 3000)
    }
  }

  const formatRecordedKeys = () => {
    if (!recordedKeys) return "Press any key combination..."

    const parts: string[] = []
    if (recordedKeys.ctrl) parts.push("Ctrl")
    if (recordedKeys.alt) parts.push("Alt")
    if (recordedKeys.shift) parts.push("Shift")
    if (recordedKeys.meta) parts.push("Meta")

    let keyDisplay = recordedKeys.key
    if (recordedKeys.key === " ") keyDisplay = "Space"
    else if (recordedKeys.key.length === 1) keyDisplay = recordedKeys.key.toUpperCase()

    parts.push(keyDisplay)
    return parts.join(" + ")
  }

  const getCategoryShortcuts = (category: KeyboardShortcut["category"]) => {
    return shortcuts.filter((s) => s.category === category)
  }

  const categories: { value: KeyboardShortcut["category"]; label: string }[] = [
    { value: "general", label: "General" },
    { value: "pos", label: "Point of Sale" },
    { value: "products", label: "Products" },
    { value: "sales", label: "Sales" },
    { value: "navigation", label: "Navigation" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleResetAll}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSuccess && (
          <Alert>
            <AlertDescription>{showSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            Customize keyboard shortcuts for quick access to common actions. Click "Edit" next to any shortcut to
            change it.
          </p>
          <p className="mt-2 font-medium">Note: Each user account can have different shortcuts.</p>
        </div>

        <Separator />

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="space-y-3 mt-4">
              {getCategoryShortcuts(cat.value).map((shortcut) => (
                <div key={shortcut.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{shortcut.name}</div>
                    <div className="text-sm text-muted-foreground">{shortcut.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono text-xs px-3 py-1">
                      {formatShortcut(shortcut)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartRecording(shortcut.id)}
                      className="bg-transparent"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}

              {getCategoryShortcuts(cat.value).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No shortcuts in this category</div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Shortcut Dialog */}
        <Dialog open={!!editingId} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent
            onKeyDown={(e: any) => handleKeyDown(e)}
            className="sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>Edit Keyboard Shortcut</DialogTitle>
              <DialogDescription>
                {shortcuts.find((s) => s.id === editingId)?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Shortcut</Label>
                <div className="p-3 border rounded-md bg-muted">
                  <Badge variant="secondary" className="font-mono">
                    {editingId && formatShortcut(shortcuts.find((s) => s.id === editingId)!)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>New Shortcut</Label>
                <div className="p-4 border-2 border-dashed rounded-md bg-secondary/50 text-center">
                  {isRecording ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Press your desired key combination</div>
                      <div className="font-mono text-lg font-semibold">{formatRecordedKeys()}</div>
                    </div>
                  ) : (
                    <Button onClick={() => setIsRecording(true)} variant="outline">
                      Start Recording
                    </Button>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• You can use Ctrl, Alt, Shift, or Meta (Windows key) modifiers</p>
                <p>• Avoid using common browser shortcuts like Ctrl+T, Ctrl+W</p>
                <p>• Press Escape to cancel recording</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveShortcut} disabled={!recordedKeys}>
                <Check className="h-4 w-4 mr-2" />
                Save Shortcut
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
