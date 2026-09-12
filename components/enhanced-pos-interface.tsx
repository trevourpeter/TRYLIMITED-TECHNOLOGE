"use client"

import { useState } from "react"
import { useStore, type Product, type SaleItem, type Customer } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Phone, Gift, Receipt, Calculator } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function EnhancedPOSInterface() {
  const { products, customers, addSale, addCustomer, getCustomerByPhone, getActivePromotions } = useStore()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<SaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerPhone, setCustomerPhone] = useState("")
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [notes, setNotes] = useState("")

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  })

  const activePromotions = getActivePromotions()

  const filteredProducts = products.filter(
    (product) =>
      product.isActive &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm))),
  )

  // Calculate applicable promotions for cart
  const calculatePromotions = () => {
    let totalDiscount = 0
    const appliedPromotions: string[] = []

    activePromotions.forEach((promotion) => {
      cart.forEach((item) => {
        if (promotion.applicableProducts.includes(item.productId) || promotion.applicableProducts.includes("all")) {
          if (promotion.type === "bulk_discount" && item.quantity >= (promotion.minQuantity || 1)) {
            const discount = (promotion.value / 100) * item.total
            totalDiscount += discount
            appliedPromotions.push(`${promotion.name} on ${item.productName}`)
          } else if (promotion.type === "percentage") {
            const discount = (promotion.value / 100) * item.total
            totalDiscount += discount
            appliedPromotions.push(`${promotion.name} on ${item.productName}`)
          } else if (promotion.type === "fixed_amount") {
            totalDiscount += Math.min(promotion.value, item.total)
            appliedPromotions.push(`${promotion.name} on ${item.productName}`)
          }
        }
      })
    })

    return { totalDiscount, appliedPromotions }
  }

  const addToCart = (product: Product, unitType: "single" | "pack" | "box" | "ream" = "single") => {
    if (product.stock <= 0) return

    let price = product.price
    let maxQuantity = product.stock

    // Adjust price and max quantity based on unit type
    if (unitType === "pack" && product.packSize) {
      price = product.price * product.packSize * 0.95 // 5% pack discount
      maxQuantity = Math.floor(product.stock / product.packSize)
    }

    const existingItem = cart.find((item) => item.productId === product.id && item.unitType === unitType)

    if (existingItem) {
      if (existingItem.quantity < maxQuantity) {
        setCart((prev) =>
          prev.map((item) =>
            item.productId === product.id && item.unitType === unitType
              ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
              : item,
          ),
        )
      }
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitType,
          price,
          total: price,
          batchNumber: product.batchNumber,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, unitType: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, unitType)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (!product) return

    let maxQuantity = product.stock
    if (unitType === "pack" && product.packSize) {
      maxQuantity = Math.floor(product.stock / product.packSize)
    }

    if (newQuantity > maxQuantity) return

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.unitType === unitType
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item,
      ),
    )
  }

  const removeFromCart = (productId: string, unitType: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.unitType === unitType)))
  }

  const handleCustomerSearch = () => {
    if (customerPhone) {
      const customer = getCustomerByPhone(customerPhone)
      if (customer) {
        setSelectedCustomer(customer)
      } else {
        setShowCustomerDialog(true)
        setNewCustomer({ ...newCustomer, phone: customerPhone })
      }
    }
  }

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      addCustomer({
        ...newCustomer,
        totalPurchases: 0,
        loyaltyPoints: 0,
        isFrequent: false,
      })
      const customer = getCustomerByPhone(newCustomer.phone)
      setSelectedCustomer(customer || null)
      setShowCustomerDialog(false)
      setNewCustomer({ name: "", phone: "", email: "", address: "" })
    }
  }

  const { totalDiscount, appliedPromotions } = calculatePromotions()
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const discountedSubtotal = subtotal - totalDiscount
  const tax = discountedSubtotal * 0.1 // 10% tax
  const grandTotal = discountedSubtotal + tax
  const change =
    paymentMethod === "cash" && cashReceived ? Math.max(0, Number.parseFloat(cashReceived) - grandTotal) : 0

  const processSale = () => {
    if (cart.length === 0 || !user) return
    if (paymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < grandTotal)) return

    const saleData = {
      items: cart,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      subtotal: discountedSubtotal,
      discount: totalDiscount,
      tax,
      grandTotal,
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? Number.parseFloat(cashReceived) : grandTotal,
      change,
      cashierId: user.id,
      cashierName: user.name,
      notes,
    }

    addSale(saleData)
    setLastSale({ ...saleData, appliedPromotions })

    // Reset form
    setCart([])
    setSelectedCustomer(null)
    setCustomerPhone("")
    setCashReceived("")
    setNotes("")
    setShowSuccess(true)
    setShowReceiptDialog(true)

    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products or scan barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Active Promotions Banner */}
        {activePromotions.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Active Promotions:</span>
              </div>
              <div className="mt-1 text-xs text-green-700">
                {activePromotions.map((promo) => promo.name).join(", ")}
              </div>
            </CardContent>
          </Card>
        )}

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  product.stock <= 0 ? "opacity-50" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                        <span
                          className={`text-sm ${product.stock <= product.minStockLevel ? "text-red-500" : "text-gray-500"}`}
                        >
                          Stock: {product.stock}
                        </span>
                      </div>

                      {product.packSize && (
                        <div className="text-xs text-gray-500">
                          Pack of {product.packSize} • ${(product.price * product.packSize * 0.95).toFixed(2)}
                        </div>
                      )}

                      {product.batchNumber && <div className="text-xs text-gray-500">Batch: {product.batchNumber}</div>}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => addToCart(product, "single")}
                        disabled={product.stock <= 0}
                        className="flex-1"
                      >
                        Add Single
                      </Button>
                      {product.packSize && product.stock >= product.packSize && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToCart(product, "pack")}
                          className="flex-1"
                        >
                          Add Pack
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        {/* Customer Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCustomer ? (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                    {selectedCustomer.isFrequent && (
                      <Badge variant="default" className="text-xs mt-1">
                        Frequent Customer
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(null)}>
                    Clear
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Loyalty Points: {selectedCustomer.loyaltyPoints} • Total Purchases: $
                  {selectedCustomer.totalPurchases.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Customer phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleCustomerSearch}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.productId}-${item.unitType}-${index}`}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500">
                            ${item.price.toFixed(2)} each • {item.unitType}
                            {item.batchNumber && ` • Batch: ${item.batchNumber}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.unitType, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.unitType, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.productId, item.unitType)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-${totalDiscount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-green-600">
                        {appliedPromotions.map((promo, index) => (
                          <div key={index}>• {promo}</div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Method:</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("cash")}
                      className="flex-1"
                    >
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("card")}
                      className="flex-1"
                    >
                      Card
                    </Button>
                    <Button
                      variant={paymentMethod === "mobile" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("mobile")}
                      className="flex-1"
                    >
                      Mobile
                    </Button>
                  </div>
                </div>

                {paymentMethod === "cash" && (
                  <div className="space-y-2">
                    <Label htmlFor="cashReceived">Cash Received:</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                    />
                    {cashReceived && Number.parseFloat(cashReceived) >= grandTotal && (
                      <div className="text-sm text-green-600">Change: ${change.toFixed(2)}</div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional):</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes..."
                    rows={2}
                  />
                </div>

                <Button
                  onClick={processSale}
                  className="w-full"
                  size="lg"
                  disabled={
                    paymentMethod === "cash" ? !cashReceived || Number.parseFloat(cashReceived) < grandTotal : false
                  }
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Complete Sale
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {showSuccess && (
          <Alert>
            <AlertDescription>Sale completed successfully!</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name *</Label>
              <Input
                id="customerName"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone *</Label>
              <Input
                id="customerPhone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCustomer} className="flex-1">
                Add Customer
              </Button>
              <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt
            </DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4 font-mono text-sm">
              <div className="text-center border-b pb-2">
                <h3 className="font-bold">STATIONERY STORE</h3>
                <p className="text-xs">123 Main Street, City</p>
                <p className="text-xs">Phone: (555) 123-4567</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span>{lastSale.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{lastSale.cashierName}</span>
                </div>
                {lastSale.customerName && (
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{lastSale.customerName}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-2">
                {lastSale.items.map((item: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="truncate">{item.productName}</span>
                      <span>${item.total.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-600 ml-2">
                      {item.quantity} × ${item.price.toFixed(2)} ({item.unitType})
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(lastSale.subtotal + lastSale.discount).toFixed(2)}</span>
                </div>
                {lastSale.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${lastSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${lastSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${lastSale.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span>{lastSale.paymentMethod.toUpperCase()}</span>
                </div>
                {lastSale.paymentMethod === "cash" && (
                  <>
                    <div className="flex justify-between">
                      <span>Cash Received:</span>
                      <span>${lastSale.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change:</span>
                      <span>${lastSale.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {lastSale.appliedPromotions.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-xs font-bold">Applied Promotions:</p>
                  {lastSale.appliedPromotions.map((promo: string, index: number) => (
                    <p key={index} className="text-xs text-green-600">
                      • {promo}
                    </p>
                  ))}
                </div>
              )}

              <div className="text-center border-t pt-2 text-xs">
                <p>Thank you for your business!</p>
                <p>Visit us again soon!</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={() => window.print()} className="flex-1">
              Print Receipt
            </Button>
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
