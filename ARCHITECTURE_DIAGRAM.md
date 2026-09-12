# Keyboard Shortcuts System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN                               │
│                    (admin or cashier)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APP LAYOUT (Root)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AuthProvider (provides user context)                     │  │
│  │    └─ ShortcutsProvider (loads user shortcuts)            │  │
│  │         └─ KeyboardManagerProvider (global enable/disable)│  │
│  │              └─ App Content                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SHORTCUTS PROVIDER                              │
│  • Loads shortcuts from localStorage: shortcuts_{userId}        │
│  • Provides context to all components                           │
│  • Functions: updateShortcut, resetShortcuts, checkShortcut     │
└─────────────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌────────┐      ┌─────────┐     ┌──────────┐
    │SETTINGS│      │   POS   │     │ PRODUCTS │
    │  PAGE  │      │  PAGE   │     │   PAGE   │
    └────────┘      └─────────┘     └──────────┘
         │                │                │
         │                │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  KEYBOARD SHORTCUTS USAGE                        │
│                                                                  │
│  Component listens for keydown events:                          │
│                                                                  │
│  useEffect(() => {                                               │
│    const handleKeyDown = (e: KeyboardEvent) => {                │
│      if (checkShortcut(e, "COMPLETE_SALE")) {                   │
│        // Execute action                                         │
│      }                                                           │
│    }                                                             │
│    window.addEventListener("keydown", handleKeyDown)            │
│  }, [checkShortcut])                                             │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│               USER FLOW: CUSTOMIZING A SHORTCUT                  │
└─────────────────────────────────────────────────────────────────┘

   1. User clicks "Settings" in sidebar
                    │
                    ▼
   2. Sees "Keyboard Shortcuts" section (top of page)
                    │
                    ▼
   3. Clicks tab (General, POS, Products, Sales, Navigation)
                    │
                    ▼
   4. Finds desired shortcut, clicks "Edit" button
                    │
                    ▼
   5. Dialog opens showing current shortcut
                    │
                    ▼
   6. Clicks "Start Recording"
                    │
                    ▼
   7. Presses desired key combination (e.g., Space + S)
                    │
                    ▼
   8. System checks for conflicts
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ✅ No Conflict      ❌ Conflict Found
         │                     │
         │                     ▼
         │              Shows error message
         │              "Already used by..."
         │                     │
         ▼                     ▼
   9. Clicks "Save"      User tries again
         │                     │
         ▼                     │
  10. Saved to:                │
      localStorage             │
      shortcuts_{userId}       │
         │                     │
         ▼                     │
  11. Context updated    ◄─────┘
      immediately
         │
         ▼
  12. Shortcut works!
      (no refresh needed)


┌─────────────────────────────────────────────────────────────────┐
│                    DATA STRUCTURE                                │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ localStorage Key: shortcuts_1 (for admin user)             │
├────────────────────────────────────────────────────────────┤
│ [                                                          │
│   {                                                        │
│     id: "focus-search",                                    │
│     name: "Focus Search",                                  │
│     description: "Focus the search/filter input",          │
│     key: "f",                                              │
│     modifiers: { ctrl: true },                             │
│     action: "FOCUS_SEARCH",                                │
│     category: "general"                                    │
│   },                                                       │
│   {                                                        │
│     id: "complete-sale",                                   │
│     name: "Complete Sale",                                 │
│     key: " ",  // Space                                    │
│     modifiers: { ctrl: false },                            │
│     action: "COMPLETE_SALE",                               │
│     category: "pos"                                        │
│   }                                                        │
│ ]                                                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ localStorage Key: shortcuts_2 (for cashier user)           │
├────────────────────────────────────────────────────────────┤
│ [                                                          │
│   {                                                        │
│     id: "complete-sale",                                   │
│     name: "Complete Sale",                                 │
│     key: "s",                                              │
│     modifiers: { ctrl: true, shift: true },                │
│     action: "COMPLETE_SALE",                               │
│     category: "pos"                                        │
│   }                                                        │
│ ]                                                          │
└────────────────────────────────────────────────────────────┘

              Different users = Different shortcuts!


┌─────────────────────────────────────────────────────────────────┐
│              COMPONENT RELATIONSHIPS                             │
└─────────────────────────────────────────────────────────────────┘

app/layout.tsx
    │
    └─ ShortcutsProvider ──────┐
                               │
                               ├─ Settings Page
                               │   └─ KeyboardShortcutsSettings
                               │        └─ Edit Dialog
                               │
                               ├─ App Sidebar
                               │   └─ ShortcutsHelpDialog
                               │
                               ├─ POS Interface
                               │   └─ useShortcuts().checkShortcut()
                               │
                               └─ Products Page
                                   └─ useShortcuts().checkShortcut()


┌─────────────────────────────────────────────────────────────────┐
│                  SHORTCUT CHECK LOGIC                            │
└─────────────────────────────────────────────────────────────────┘

User Presses: Space + S
        │
        ▼
KeyboardEvent captured
        │
        ▼
Check: Is user typing in input? ─── YES ──► IGNORE
        │
        NO
        ▼
Check: Are shortcuts enabled? ──── NO ───► IGNORE
        │
        YES
        ▼
Call: checkShortcut(event, "COMPLETE_SALE")
        │
        ▼
Find shortcut config for "COMPLETE_SALE"
        │
        ▼
Compare:
  - event.key === shortcut.key? ✓
  - event.ctrlKey === shortcut.modifiers.ctrl? ✓
  - event.altKey === shortcut.modifiers.alt? ✓
  - event.shiftKey === shortcut.modifiers.shift? ✓
        │
        ▼
    MATCH! ✅
        │
        ▼
Execute action:
  - Prevent default
  - Open checkout
  - Complete sale


┌─────────────────────────────────────────────────────────────────┐
│                    FEATURES SUMMARY                              │
└─────────────────────────────────────────────────────────────────┘

✨ PER-USER CUSTOMIZATION
   Each user ID has separate shortcuts in localStorage

🎨 VISUAL INTERFACE
   Click "Edit" → Press keys → Save
   No typing, no config files

⚠️ CONFLICT DETECTION
   System warns if shortcut already exists

🔄 INSTANT UPDATES
   Changes apply immediately, no refresh

📖 QUICK REFERENCE
   Help dialog accessible from sidebar

🎯 CATEGORY ORGANIZATION
   General | POS | Products | Sales | Navigation

🔒 SMART DETECTION
   Doesn't trigger while typing in inputs

♻️ EASY RESET
   One button restores all defaults

💾 PERSISTENT
   Shortcuts saved across sessions

🚀 ZERO DEPENDENCIES
   Uses native browser APIs
