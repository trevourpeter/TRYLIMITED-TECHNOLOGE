"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Eye, Download, Calendar, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"

export function SalesPage() {
  const { sales } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState("all")
  const [selectedSale, setSelectedSale] = useState<any>(null)

  // Filter sales based on search and filters
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesPeriod = true
    if (selectedPeriod !== "all") {
      const now = new Date()
      const saleDate = new Date(sale.timestamp)

      switch (selectedPeriod) {
        case "today":
          matchesPeriod = saleDate.toDateString() === now.toDateString()
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesPeriod = saleDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesPeriod = saleDate >= monthAgo
          break
      }
    }

    const matchesPayment = selectedPayment === "all" || sale.paymentMethod === selectedPayment

    return matchesSearch && matchesPeriod && matchesPayment
  })

  // Calculate statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.grandTotal, 0)
  const totalSales = filteredSales.length
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0
  const totalItems = filteredSales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-gray-600">View and analyze your sales data</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Sales
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {totalSales} sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">{totalItems} items sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageSale.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Total quantity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPayment} onValueChange={setSelectedPayment}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {filteredSales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedPeriod !== "all" || selectedPayment !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Sales will appear here once you start making transactions."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">Sale #{sale.id.slice(-8)}</p>
                          <p className="text-sm text-gray-500">
                            {sale.items.length} items • {sale.cashierName}
                          </p>
                          <p className="text-xs text-gray-400">{new Date(sale.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">${sale.total.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {sale.paymentMethod}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Tax: ${sale.tax.toFixed(2)}
                          </Badge>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedSale(sale)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Sale Details - #{sale.id.slice(-8)}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p>
                                  <strong>Date:</strong> {new Date(sale.timestamp).toLocaleString()}
                                </p>
                                <p>
                                  <strong>Cashier:</strong> {sale.cashierName}
                                </p>
                                <p>
                                  <strong>Payment:</strong> {sale.paymentMethod}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Items:</strong> {sale.items.length}
                                </p>
                                <p>
                                  <strong>Subtotal:</strong> ${sale.total.toFixed(2)}
                                </p>
                                <p>
                                  <strong>Tax:</strong> ${sale.tax.toFixed(2)}
                                </p>
                                <p>
                                  <strong>Total:</strong> ${sale.grandTotal.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Items Purchased:</h4>
                              <div className="space-y-2">
                                {sale.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium">{item.productName}</p>
                                      <p className="text-sm text-gray-500">
                                        ${item.price.toFixed(2)} × {item.quantity}
                                      </p>
                                    </div>
                                    <p className="font-bold">${item.total.toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
