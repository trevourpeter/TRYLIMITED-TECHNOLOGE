"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Store, Shield, Database } from "lucide-react"
import { KeyboardShortcutsSettings } from "@/components/keyboard-shortcuts-settings"
import { ThemeCustomizationSettings } from "@/components/theme-customization-settings"

export function SettingsPage() {
  const [showSuccess, setShowSuccess] = useState("")

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    name: "Stationery Store",
    address: "123 Main Street, City, State 12345",
    phone: "+1 (555) 123-4567",
    email: "info@stationerystore.com",
    taxRate: "10",
    currency: "USD",
    receiptFooter: "Thank you for your business!",
  })

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    lowStockThreshold: "10",
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: "en",
    timezone: "UTC-5",
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    requirePasswordChange: true,
    twoFactorAuth: false,
    loginAttempts: "3",
  })

  const handleSaveStoreSettings = () => {
    // In a real app, this would save to a backend
    localStorage.setItem("storeSettings", JSON.stringify(storeSettings))
    setShowSuccess("Store settings saved successfully!")
    setTimeout(() => setShowSuccess(""), 3000)
  }

  const handleSaveSystemSettings = () => {
    localStorage.setItem("systemSettings", JSON.stringify(systemSettings))
    setShowSuccess("System settings saved successfully!")
    setTimeout(() => setShowSuccess(""), 3000)
  }

  const handleSaveSecuritySettings = () => {
    localStorage.setItem("securitySettings", JSON.stringify(securitySettings))
    setShowSuccess("Security settings saved successfully!")
    setTimeout(() => setShowSuccess(""), 3000)
  }

  const handleBackupData = () => {
    // Simulate backup process
    const data = {
      products: localStorage.getItem("products"),
      sales: localStorage.getItem("sales"),
      settings: {
        store: storeSettings,
        system: systemSettings,
        security: securitySettings,
      },
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `stationery-pos-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowSuccess("Data backup downloaded successfully!")
    setTimeout(() => setShowSuccess(""), 3000)
  }

  const handleRestoreData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (data.products) localStorage.setItem("products", data.products)
            if (data.sales) localStorage.setItem("sales", data.sales)
            if (data.settings) {
              if (data.settings.store) setStoreSettings(data.settings.store)
              if (data.settings.system) setSystemSettings(data.settings.system)
              if (data.settings.security) setSecuritySettings(data.settings.security)
            }
            setShowSuccess("Data restored successfully! Please refresh the page.")
            setTimeout(() => setShowSuccess(""), 5000)
          } catch (error) {
            setShowSuccess("Error restoring data. Please check the file format.")
            setTimeout(() => setShowSuccess(""), 3000)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Configure your POS system preferences</p>
      </div>

      {showSuccess && (
        <Alert>
          <AlertDescription>{showSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Customization - Full Width */}
        <div className="lg:col-span-2">
          <ThemeCustomizationSettings />
        </div>

        {/* Keyboard Shortcuts - Full Width */}
        <div className="lg:col-span-2">
          <KeyboardShortcutsSettings />
        </div>

        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={storeSettings.name}
                onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeAddress">Address</Label>
              <Textarea
                id="storeAddress"
                value={storeSettings.address}
                onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storePhone">Phone</Label>
                <Input
                  id="storePhone"
                  value={storeSettings.phone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={storeSettings.email}
                  onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={storeSettings.taxRate}
                  onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={storeSettings.currency}
                  onValueChange={(value) => setStoreSettings({ ...storeSettings, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptFooter">Receipt Footer</Label>
              <Textarea
                id="receiptFooter"
                value={storeSettings.receiptFooter}
                onChange={(e) => setStoreSettings({ ...storeSettings, receiptFooter: e.target.value })}
                rows={2}
              />
            </div>

            <Button onClick={handleSaveStoreSettings} className="w-full">
              Save Store Settings
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={systemSettings.lowStockThreshold}
                onChange={(e) => setSystemSettings({ ...systemSettings, lowStockThreshold: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={systemSettings.language}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={systemSettings.timezone}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                    <SelectItem value="UTC-6">UTC-6 (CST)</SelectItem>
                    <SelectItem value="UTC-7">UTC-7 (MST)</SelectItem>
                    <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Auto Backup</Label>
                  <p className="text-sm text-gray-500">Automatically backup data daily</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive email alerts</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={systemSettings.emailNotifications}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive SMS alerts</p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={systemSettings.smsNotifications}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, smsNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Use dark theme</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={systemSettings.darkMode}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, darkMode: checked })}
                />
              </div>
            </div>

            <Button onClick={handleSaveSystemSettings} className="w-full">
              Save System Settings
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginAttempts">Max Login Attempts</Label>
              <Input
                id="loginAttempts"
                type="number"
                value={securitySettings.loginAttempts}
                onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: e.target.value })}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requirePasswordChange">Require Password Change</Label>
                  <p className="text-sm text-gray-500">Force password change every 90 days</p>
                </div>
                <Switch
                  id="requirePasswordChange"
                  checked={securitySettings.requirePasswordChange}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, requirePasswordChange: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Enable 2FA for all users</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                />
              </div>
            </div>

            <Button onClick={handleSaveSecuritySettings} className="w-full">
              Save Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Backup & Restore</h4>
              <p className="text-sm text-gray-500">Export your data for backup or import from a previous backup.</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBackupData} variant="outline" className="flex-1 bg-transparent">
                Export Data
              </Button>
              <Button onClick={handleRestoreData} variant="outline" className="flex-1 bg-transparent">
                Import Data
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Danger Zone</h4>
              <p className="text-sm text-gray-500">These actions cannot be undone. Please be careful.</p>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
                  localStorage.clear()
                  setShowSuccess("All data cleared successfully! Please refresh the page.")
                  setTimeout(() => setShowSuccess(""), 5000)
                }
              }}
            >
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
