"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Palette, Plus, Trash2, Check, Moon, Sun, Edit2, Eye } from "lucide-react"
import { useThemeManager, type Theme, type ThemeColors } from "@/lib/theme-manager"
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
import { Textarea } from "@/components/ui/textarea"
import { ThemeColorEditor } from "@/components/theme-color-editor"

export function ThemeCustomizationSettings() {
  const { currentTheme, themes, isDarkMode, setTheme, toggleDarkMode, createCustomTheme, deleteCustomTheme, updateCustomTheme } =
    useThemeManager()
  const [showSuccess, setShowSuccess] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null)
  const [colorEditorOpen, setColorEditorOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)

  // Form state for creating custom theme
  const [themeName, setThemeName] = useState("")
  const [themeDescription, setThemeDescription] = useState("")
  const [baseTheme, setBaseTheme] = useState("default")

  const handleCreateTheme = () => {
    if (!themeName.trim()) {
      alert("Please enter a theme name")
      return
    }

    const base = themes.find((t) => t.id === baseTheme) || themes[0]
    
    createCustomTheme({
      name: themeName,
      description: themeDescription || `Custom theme based on ${base.name}`,
      colors: {
        light: { ...base.colors.light },
        dark: { ...base.colors.dark },
      },
    })

    setShowSuccess("Custom theme created successfully!")
    setTimeout(() => setShowSuccess(""), 3000)
    setCreateDialogOpen(false)
    setThemeName("")
    setThemeDescription("")
    setBaseTheme("default")
  }

  const handleDeleteTheme = (themeId: string) => {
    if (confirm("Are you sure you want to delete this custom theme?")) {
      deleteCustomTheme(themeId)
      setShowSuccess("Theme deleted successfully!")
      setTimeout(() => setShowSuccess(""), 3000)
    }
  }

  const handlePreviewTheme = (theme: Theme) => {
    setPreviewTheme(theme)
    setPreviewDialogOpen(true)
  }

  const handleEditColors = (theme: Theme) => {
    setEditingTheme(theme)
    setColorEditorOpen(true)
  }

  const handleSaveColors = (updatedTheme: Theme) => {
    if (updatedTheme.isCustom) {
      updateCustomTheme(updatedTheme.id, updatedTheme)
      setShowSuccess("Theme colors updated successfully!")
      setTimeout(() => setShowSuccess(""), 3000)
    }
  }

  const predefinedThemes = themes.filter((t) => !t.isCustom)
  const customThemes = themes.filter((t) => t.isCustom)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customization
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleDarkMode} className="gap-2">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDarkMode ? "Light" : "Dark"} Mode
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showSuccess && (
          <Alert>
            <AlertDescription>{showSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Current Theme</Label>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-sm px-4 py-2">
              {currentTheme.name}
            </Badge>
            {currentTheme.isCustom && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-2">{currentTheme.description}</span>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="predefined">Predefined Themes</TabsTrigger>
            <TabsTrigger value="custom">Custom Themes ({customThemes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="predefined" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {predefinedThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                    currentTheme.id === theme.id ? "ring-2 ring-primary bg-accent/50" : ""
                  }`}
                  onClick={() => {
                    setTheme(theme.id)
                    setShowSuccess(`Switched to ${theme.name} theme!`)
                    setTimeout(() => setShowSuccess(""), 3000)
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {theme.name}
                        {currentTheme.id === theme.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="text-sm text-muted-foreground">{theme.description}</div>
                    </div>
                  </div>

                  {/* Color preview */}
                  <div className="flex gap-1 mt-3">
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ background: `hsl(${theme.colors.light.primary})` }}
                      title="Primary"
                    />
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ background: `hsl(${theme.colors.light.secondary})` }}
                      title="Secondary"
                    />
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ background: `hsl(${theme.colors.light.accent})` }}
                      title="Accent"
                    />
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ background: `hsl(${theme.colors.light.muted})` }}
                      title="Muted"
                    />
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePreviewTheme(theme)
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-3 mt-4">
            <Button onClick={() => setCreateDialogOpen(true)} className="w-full mb-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Theme
            </Button>

            {customThemes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium text-gray-900">No custom themes yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Create your first custom theme to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`border rounded-lg p-4 transition-all ${
                      currentTheme.id === theme.id ? "ring-2 ring-primary bg-accent/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 cursor-pointer" onClick={() => setTheme(theme.id)}>
                        <div className="font-medium flex items-center gap-2">
                          {theme.name}
                          {currentTheme.id === theme.id && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="text-sm text-muted-foreground">{theme.description}</div>
                      </div>
                    </div>

                    {/* Color preview */}
                    <div className="flex gap-1 mt-3">
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ background: `hsl(${theme.colors.light.primary})` }}
                        title="Primary"
                      />
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ background: `hsl(${theme.colors.light.secondary})` }}
                        title="Secondary"
                      />
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ background: `hsl(${theme.colors.light.accent})` }}
                        title="Accent"
                      />
                      <div
                        className="h-6 w-6 rounded border"
                        style={{ background: `hsl(${theme.colors.light.muted})` }}
                        title="Muted"
                      />
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleEditColors(theme)}
                      >
                        <Palette className="h-3 w-3 mr-1" />
                        Edit Colors
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handlePreviewTheme(theme)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => setTheme(theme.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                        onClick={() => handleDeleteTheme(theme.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex gap-2">
            <Palette className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">About Themes</p>
              <ul className="space-y-1 text-xs">
                <li>• Choose from predefined themes or create your own</li>
                <li>• Each user account can have different theme preferences</li>
                <li>• Toggle between light and dark modes for each theme</li>
                <li>• Custom themes are based on predefined themes and can be edited later</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Create Theme Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Custom Theme</DialogTitle>
              <DialogDescription>
                Create a new theme based on an existing one. You can customize the colors later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="theme-name">Theme Name *</Label>
                <Input
                  id="theme-name"
                  placeholder="My Custom Theme"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-description">Description</Label>
                <Textarea
                  id="theme-description"
                  placeholder="A brief description of your theme"
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-theme">Base Theme</Label>
                <select
                  id="base-theme"
                  className="w-full px-3 py-2 border rounded-md"
                  value={baseTheme}
                  onChange={(e) => setBaseTheme(e.target.value)}
                >
                  {predefinedThemes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Your custom theme will start with colors from this theme
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTheme}>Create Theme</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Theme Preview: {previewTheme?.name}</DialogTitle>
              <DialogDescription>{previewTheme?.description}</DialogDescription>
            </DialogHeader>

            {previewTheme && (
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Light Mode Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(previewTheme.colors.light).slice(0, 8).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div
                          className="h-12 w-full rounded border mb-1"
                          style={{ background: `hsl(${value})` }}
                        />
                        <div className="text-xs text-muted-foreground truncate">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Dark Mode Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(previewTheme.colors.dark).slice(0, 8).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div
                          className="h-12 w-full rounded border mb-1"
                          style={{ background: `hsl(${value})` }}
                        />
                        <div className="text-xs text-muted-foreground truncate">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                Close
              </Button>
              {previewTheme && (
                <Button
                  onClick={() => {
                    setTheme(previewTheme.id)
                    setPreviewDialogOpen(false)
                    setShowSuccess(`Switched to ${previewTheme.name} theme!`)
                    setTimeout(() => setShowSuccess(""), 3000)
                  }}
                >
                  Use This Theme
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Color Editor Dialog */}
        {editingTheme && (
          <ThemeColorEditor
            theme={editingTheme}
            open={colorEditorOpen}
            onClose={() => setColorEditorOpen(false)}
            onSave={handleSaveColors}
          />
        )}
      </CardContent>
    </Card>
  )
}
