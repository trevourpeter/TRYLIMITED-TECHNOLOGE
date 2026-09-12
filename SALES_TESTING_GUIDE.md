# 🧪 Sales System Testing Guide

## Quick Test Scenarios

### Test 1: Complete a Basic Sale ✅

**Steps:**
1. Log in to the system
   - Email: `admin@stationery.com`
   - Password: `admin123`

2. Go to POS Interface (Advanced POS)

3. Add products to cart:
   - Click "A4 Paper Ream" (2 units)
   - Click "Blue Ball-Point Pen" (5 units)
   - Click "Exercise Book" (3 units)

4. Review cart totals:
   - Subtotal should show
   - Tax (10%) should calculate
   - Grand total should be displayed

5. Click "Checkout" or press `Ctrl+Enter`

6. Select payment method: **Cash**

7. Enter cash received: `50.00`

8. Click "Complete Sale"

9. **Expected Results:**
   - ✅ Success toast: "Sale Completed"
   - ✅ Receipt number displayed
   - ✅ Cart clears
   - ✅ Checkout dialog closes

---

### Test 2: Verify Sale in Sales Page ✅

**Steps:**
1. Navigate to **Sales** page (sidebar)

2. Check the sales list:
   - ✅ New sale appears at top
   - ✅ Receipt number shows (RCP-...)
   - ✅ Cashier name: "Admin User"
   - ✅ Date/time displayed
   - ✅ Item count correct
   - ✅ Payment method badge: "cash"
   - ✅ Grand total matches

3. Click the **Eye icon** to view details

4. **Expected in Dialog:**
   - ✅ Sale ID displayed
   - ✅ Date and time
   - ✅ Cashier: "Admin User"
   - ✅ Payment: "cash"
   - ✅ All items listed with:
     - Product name
     - Unit price
     - Quantity
     - Item total
   - ✅ Subtotal shown
   - ✅ Tax shown
   - ✅ Grand total shown

---

### Test 3: Multiple Sales & Statistics ✅

**Steps:**
1. Complete 3 different sales:
   - Sale 1: 2 items, Cash payment
   - Sale 2: 5 items, Card payment
   - Sale 3: 1 item, Cash payment

2. Go to Sales page

3. Check statistics cards:
   - ✅ **Total Revenue**: Sum of all grandTotal values
   - ✅ **Total Sales**: Count = 3
   - ✅ **Average Sale**: Revenue ÷ 3
   - ✅ **Items Sold**: Total quantity of all items

4. Test filters:
   - Filter by "Today" - should show all 3
   - Filter by "Cash" - should show 2 sales
   - Filter by "Card" - should show 1 sale
   - Clear filters - should show all

---

### Test 4: Sale Details Accuracy ✅

**Steps:**
1. Complete a sale with:
   - A4 Paper Ream × 2 @ $8.50 = $17.00
   - Blue Pen × 10 @ $1.25 = $12.50
   - Exercise Book × 3 @ $2.00 = $6.00

2. **Expected Calculations:**
   ```
   Subtotal: $35.50
   Tax (10%): $3.55
   Discount: $0.00
   Grand Total: $39.05
   ```

3. View sale in Sales page

4. **Verify All Fields:**
   - ✅ Items show correct product names
   - ✅ Quantities match
   - ✅ Unit prices correct
   - ✅ Item totals accurate
   - ✅ Subtotal = $35.50
   - ✅ Tax = $3.55
   - ✅ Grand total = $39.05

---

### Test 5: Cashier Name Tracking ✅

**Steps:**
1. Complete sale as Admin user
2. Log out
3. Log in as Cashier:
   - Email: `cashier@stationery.com`
   - Password: `cashier123`
4. Complete another sale
5. Go to Sales page (as admin or cashier)

6. **Expected Results:**
   - ✅ First sale shows: "Admin User"
   - ✅ Second sale shows: "Cashier User"
   - ✅ Each sale tracks who made it
   - ✅ Search by cashier name works

---

### Test 6: Payment Methods ✅

**Steps:**
1. Complete sales with different payment methods:
   - Sale 1: Cash ($50 received, $10.50 change)
   - Sale 2: Card (no cash handling)
   - Sale 3: Mobile (no cash handling)

2. Go to Sales page

3. **Verify:**
   - ✅ Each sale has correct payment badge
   - ✅ Filter by payment method works
   - ✅ All payment types display correctly

---

## 🔍 Data Validation Checklist

**For Each Sale, Verify:**
- [ ] Receipt number format: `RCP-[timestamp]`
- [ ] Cashier name matches logged-in user
- [ ] Timestamp is accurate
- [ ] Payment method is recorded
- [ ] All items have product names (not undefined)
- [ ] Item quantities are correct
- [ ] Item prices match product prices
- [ ] Item totals = quantity × price - discount
- [ ] Subtotal = sum of item totals
- [ ] Tax = subtotal × 0.10
- [ ] Grand total = subtotal + tax
- [ ] Sale ID is unique

---

## 🐛 Common Issues to Check

### Issue: "Cashier name is undefined"
**Fix:** User must be logged in before making sale
**Status:** ✅ Fixed - uses `user?.name || "Unknown Cashier"`

### Issue: "Product name not showing"
**Fix:** Cart items now transform `name` → `productName`
**Status:** ✅ Fixed - completeSale transforms items

### Issue: "Grand total missing"
**Fix:** Now calculated and included in sale object
**Status:** ✅ Fixed - `grandTotal: finalTotal`

### Issue: "Item totals wrong"
**Fix:** Now calculated per item: `quantity × price - discount`
**Status:** ✅ Fixed - calculated in saleItems map

---

## 📊 Expected Data Structure

**In Console (for debugging):**
```javascript
// View a sale object
console.log(sales[0])

// Should output:
{
  id: "1729382400000",
  items: [
    {
      id: "1",
      productName: "A4 Paper Ream",  // ✅ Not "name"
      quantity: 2,
      price: 8.5,
      discount: 0,
      total: 17  // ✅ Calculated
    }
  ],
  subtotal: 17,      // ✅ Present
  total: 17,
  tax: 1.7,
  discount: 0,
  grandTotal: 18.7,  // ✅ Present
  paymentMethod: "cash",
  timestamp: Date,
  cashierId: "1",
  cashierName: "Admin User",  // ✅ Present
  receiptNumber: "RCP-1729382400000"  // ✅ Present
}
```

---

## ✅ Success Criteria

**All Tests Pass When:**
- ✅ Sales complete without errors
- ✅ All data fields populate correctly
- ✅ Sales page displays all information
- ✅ Statistics calculate accurately
- ✅ Filters work as expected
- ✅ Sale details dialog shows complete data
- ✅ Cashier names track properly
- ✅ Payment methods record correctly
- ✅ Calculations are accurate
- ✅ No TypeScript errors
- ✅ No console errors

---

## 🎯 Quick Validation Commands

**Browser Console:**
```javascript
// Check if sale structure is correct
JSON.stringify(window.localStorage.getItem('store'), null, 2)

// Or if using React DevTools, inspect:
// StoreContext → state → sales[0]
```

**Expected Fields Present:**
- ✅ `cashierName` (string)
- ✅ `grandTotal` (number)
- ✅ `receiptNumber` (string)
- ✅ `items[].productName` (string)
- ✅ `items[].total` (number)
- ✅ `subtotal` (number)

---

**If all tests pass, the sales system is fully functional!** 🎉
