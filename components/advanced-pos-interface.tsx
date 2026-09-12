"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Smartphone,
  DollarSign,
  Scan,
  Package,
  AlertTriangle,
  Moon,
  Sun,
  Printer,
  FileText,
  Percent,
} from "lucide-react"
import { useKeyboardManager } from "@/lib/keyboard-manager"
import { useShortcuts } from "@/lib/shortcuts-manager"

export function AdvancedPOSInterface() {
  const { products, cart, darkMode, dispatch } = useStore()
  const { user } = useAuth()
  const { toast } = useToast()
  const { areShortcutsEnabled } = useKeyboardManager()
  const { checkShortcut } = useShortcuts()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [manualDiscount, setManualDiscount] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if global shortcuts are disabled or user is typing in an input field
      if (!areShortcutsEnabled) {
        return
      }

      const activeElement = document.activeElement
      const isTypingInInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      )
      
      if (isTypingInInput) {
        return
      }

      // Check for custom shortcuts
      if (checkShortcut(e, "FOCUS_SEARCH")) {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (checkShortcut(e, "OPEN_BARCODE_SCANNER")) {
        e.preventDefault()
        setShowBarcodeScanner(true)
      } else if (checkShortcut(e, "COMPLETE_SALE")) {
        e.preventDefault()
        if (cart.length > 0) {
          setShowCheckout(true)
        }
      } else if (checkShortcut(e, "CLEAR_CART")) {
        e.preventDefault()
        if (cart.length > 0) {
          clearCart()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cart.length, areShortcutsEnabled, checkShortcut])

  const categories = ["All", ...new Set(products.map((p) => p.category))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode?.includes(searchTerm)
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const cartTotal = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity
    const discount = item.discount || 0
    return sum + (itemTotal - discount)
  }, 0)

  const tax = cartTotal * 0.1
  const finalTotal = cartTotal + tax

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      })
      return
    }

    dispatch({ type: "ADD_TO_CART", payload: product })
    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: id })
      toast({
        title: "Item Removed",
        description: "Item removed from cart",
      })
    } else {
      dispatch({ type: "UPDATE_CART_QUANTITY", payload: { id, quantity } })
    }
  }

  const applyDiscount = (id: string) => {
    const discount = Number.parseFloat(manualDiscount) || 0
    dispatch({ type: "APPLY_DISCOUNT", payload: { id, discount } })
    setManualDiscount("")
    toast({
      title: "Discount Applied",
      description: `$${discount.toFixed(2)} discount applied`,
    })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
    toast({
      title: "Cart Cleared",
      description: "All items removed from cart",
    })
  }

  const completeSale = () => {
    if (paymentMethod === "cash") {
      const received = Number.parseFloat(cashReceived)
      if (received < finalTotal) {
        toast({
          title: "Insufficient Payment",
          description: "Cash received is less than total amount",
          variant: "destructive",
        })
        return
      }
    }

    // Calculate subtotal (before tax)
    const subtotal = cartTotal

    // Transform cart items to sale items with proper structure
    const saleItems = cart.map((item) => ({
      id: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      total: item.quantity * item.price - (item.discount || 0),
    }))

    const sale = {
      id: Date.now().toString(),
      items: saleItems,
      subtotal: subtotal,
      total: cartTotal,
      tax: tax,
      discount: 0,
      grandTotal: finalTotal,
      paymentMethod,
      timestamp: new Date(),
      cashierId: user?.id || "unknown",
      cashierName: user?.name || "Unknown Cashier",
      receiptNumber: `RCP-${Date.now()}`,
    }

    dispatch({ type: "COMPLETE_SALE", payload: sale })
    setShowCheckout(false)
    setCashReceived("")

    toast({
      title: "Sale Completed",
      description: `Receipt #${sale.receiptNumber} generated`,
    })
  }

  const getStockBadge = (stock: number, threshold = 10) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (stock <= threshold) {
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          Low Stock ({stock})
        </Badge>
      )
    }
    return <Badge variant="outline">In Stock ({stock})</Badge>
  }

  const toggleDarkMode = () => {
    dispatch({ type: "TOGGLE_DARK_MODE" })
    document.documentElement.classList.toggle("dark")
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleCashReceivedChange = useCallback((value: string) => {
    setCashReceived(value)
  }, [])

  const handleManualDiscountChange = useCallback((value: string) => {
    setManualDiscount(value)
  }, [])

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 text-center">
        <p className="font-semibold">🎒 Back to School Sale - 20% off School Bundles! 📚</p>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Products Section */}
        <div className="flex-1 p-4 overflow-hidden">
          {/* Header Controls */}
          <div className="flex gap-4 mb-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={searchInputRef}
                key="pos-search"
                placeholder="Search products or scan barcode (Ctrl+F)"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowBarcodeScanner(true)} className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scan (Ctrl+B)
            </Button>
            <Button variant="outline" onClick={toggleDarkMode} size="icon">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
            <TabsList className="grid w-full grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-[calc(100vh-200px)]">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  product.stock === 0 ? "opacity-50" : ""
                } ${product.isBundle ? "border-purple-200 bg-purple-50" : ""}`}
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    {product.isBundle ? (
                      <Package className="h-8 w-8 text-purple-600" />
                    ) : (
                      <div className="text-2xl">📦</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</span>
                    {product.isBundle && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Bundle
                      </Badge>
                    )}
                  </div>
                  {getStockBadge(product.stock, product.lowStockThreshold)}
                  {product.stock <= (product.lowStockThreshold || 10) && product.stock > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Low Stock Alert</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 border-l bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </h2>
            {cart.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: "REMOVE_FROM_CART", payload: item.id })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${(item.price * item.quantity - (item.discount || 0)).toFixed(2)}
                      </div>
                      {item.discount && (
                        <div className="text-xs text-green-600">-${item.discount.toFixed(2)} discount</div>
                      )}
                    </div>
                  </div>

                  {/* Manual Discount */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      key="manual-discount"
                      placeholder="Discount $"
                      value={manualDiscount}
                      onChange={(e) => handleManualDiscountChange(e.target.value)}
                      className="text-xs"
                    />
                    <Button variant="outline" size="sm" onClick={() => applyDiscount(item.id)}>
                      <Percent className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full" disabled={cart.length === 0} onClick={() => setShowCheckout(true)}>
              Checkout (Ctrl+Enter)
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={cart.length === 0}>
                <FileText className="h-4 w-4 mr-2" />
                Quote
              </Button>
              <Button variant="outline" disabled={cart.length === 0}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Barcode Scanner</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <div className="w-64 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Scan className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Position barcode within the scanner area</p>
            <Input
              placeholder="Or enter barcode manually"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const product = products.find((p) => p.barcode === e.currentTarget.value)
                  if (product) {
                    addToCart(product)
                    setShowBarcodeScanner(false)
                  }
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">${finalTotal.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile Money
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "cash" && (
              <div>
                <label className="block text-sm font-medium mb-2">Cash Received</label>
                <Input
                  key="cash-received"
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => handleCashReceivedChange(e.target.value)}
                  placeholder="0.00"
                />
                {cashReceived && Number.parseFloat(cashReceived) >= finalTotal && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <div className="text-sm font-medium text-green-800">
                      Change: ${(Number.parseFloat(cashReceived) - finalTotal).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={completeSale}
              disabled={paymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < finalTotal)}
            >
              Complete Sale
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
