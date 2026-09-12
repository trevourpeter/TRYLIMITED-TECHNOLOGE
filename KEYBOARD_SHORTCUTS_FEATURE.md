# Keyboard Shortcuts Customization Feature

## Overview
A comprehensive keyboard shortcuts management system has been added to the Stationery POS application. This feature allows each user account to customize their own keyboard shortcuts for various actions throughout the system.

## Features Implemented

### 1. **Shortcuts Manager** (`lib/shortcuts-manager.tsx`)
- Context provider for managing keyboard shortcuts
- Per-user shortcuts storage (saved in localStorage by user ID)
- Default shortcuts provided for common actions
- Functions to update, reset, and check shortcuts
- Shortcut formatting for display

### 2. **Keyboard Shortcuts Settings UI** (`components/keyboard-shortcuts-settings.tsx`)
- Full settings panel in the Settings page
- Organized by categories: General, Point of Sale, Products, Sales, Navigation
- Interactive shortcut recording (press any key combination)
- Conflict detection (prevents duplicate shortcuts)
- Visual feedback with badges showing current shortcuts
- Reset individual or all shortcuts to defaults

### 3. **Integration with Existing Components**
- Updated `advanced-pos-interface.tsx` to use custom shortcuts
- Updated `products-page.tsx` to support ADD_PRODUCT shortcut
- Shortcuts work seamlessly with existing keyboard manager

## Default Shortcuts

### General
- **Focus Search**: `Ctrl + F` - Focus the search/filter input
- **Quick Sale**: `Ctrl + Shift + S` - Open POS interface for quick sale

### Point of Sale
- **Open Barcode Scanner**: `Ctrl + B` - Open the barcode scanner dialog
- **Complete Sale**: `Ctrl + Enter` - Open checkout dialog to complete the sale
- **Clear Cart**: `Ctrl + Delete` - Clear all items from the cart
- **Cash Up**: `Ctrl + Shift + U` - Open cash up management

### Products
- **Add New Product**: `Ctrl + N` - Open dialog to add a new product

### Navigation
- **View Reports**: `Ctrl + Shift + R` - Navigate to reports page

## User-Specific Customization

Each user account maintains their own set of shortcuts:
- Admin can set `Ctrl + Shift + S` for sales
- Cashier can set `Space + S` for sales
- Shortcuts are stored separately per user ID
- Changes persist across sessions

## How to Use

1. **Navigate to Settings**
   - Click on "Settings" in the sidebar

2. **Find Keyboard Shortcuts Section**
   - The shortcuts panel is at the top of the settings page

3. **Edit a Shortcut**
   - Click the "Edit" button next to any shortcut
   - Click "Start Recording" in the dialog
   - Press your desired key combination
   - Click "Save Shortcut"

4. **Reset Shortcuts**
   - Click "Reset All" to restore all shortcuts to defaults
   - Or edit individual shortcuts as needed

## Technical Details

### File Structure
```
lib/
  shortcuts-manager.tsx       - Core shortcuts management logic
  keyboard-manager.tsx        - Global shortcuts enable/disable
  auth-context.tsx           - User authentication (shortcuts keyed by user ID)

components/
  keyboard-shortcuts-settings.tsx  - Settings UI component
  settings-page.tsx               - Main settings page (integrated)
  advanced-pos-interface.tsx      - POS with shortcut support
  products-page.tsx              - Products page with shortcut support
```

### Data Storage
- Shortcuts are stored in localStorage as `shortcuts_{userId}`
- JSON format for easy serialization
- Automatic loading on user login
- Automatic saving on changes

### Shortcut Actions
The system supports these action types:
- `FOCUS_SEARCH` - Focus search input
- `OPEN_BARCODE_SCANNER` - Open barcode scanner
- `COMPLETE_SALE` - Complete current sale
- `CLEAR_CART` - Clear shopping cart
- `ADD_PRODUCT` - Add new product
- `QUICK_SALE` - Open POS interface
- `VIEW_REPORTS` - View reports
- `CASH_UP` - Open cash up management

### Extending the System

To add new shortcuts:

1. Add the action to `DEFAULT_SHORTCUTS` in `shortcuts-manager.tsx`
2. Update the component to check for the shortcut:
```typescript
if (checkShortcut(e, "YOUR_ACTION")) {
  e.preventDefault()
  // Your action logic
}
```

## Benefits

1. **Personalization** - Each user can work with their preferred shortcuts
2. **Efficiency** - Quick access to frequently used features
3. **Accessibility** - Support for users with different workflow preferences
4. **Flexibility** - Easy to add new shortcuts as needed
5. **Safety** - Conflict detection prevents duplicate shortcuts
6. **User-Friendly** - Visual interface for recording shortcuts

## Example Use Cases

### Cashier User
- Set `Space + S` for completing sales (easy one-handed operation)
- Set `Space + B` for barcode scanner
- Set `Space + C` for clearing cart

### Admin User  
- Keep default `Ctrl + Shift + S` for sales
- Add `Ctrl + R` for quick reports access
- Customize product management shortcuts

### Power User
- Create shortcuts for all frequent actions
- Use consistent modifier patterns
- Memorize shortcuts for maximum efficiency
