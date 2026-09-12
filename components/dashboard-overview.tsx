"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle } from "lucide-react"

export function DashboardOverview() {
  const { products, sales } = useStore()

  /* ----------   Calculations   ---------- */

  // Today's sales / revenue
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySales = sales.filter((s) => s.timestamp >= today)
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)

  // This week's sales / revenue
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekSales = sales.filter((s) => s.timestamp >= weekStart)
  const weekRevenue = weekSales.reduce((sum, s) => sum + s.total, 0)

  // Low-stock check (≤ 10 units)
  const lowStockProducts = products.filter((p) => p.stock <= 10)

  // Recent 5 sales
  const recentSales = sales.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* ----------  Stats Cards  ---------- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today */}
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{todaySales.length} sales today</p>
          </CardContent>
        </Card>

        {/* Week */}
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week&apos;s Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${weekRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{weekSales.length} sales this week</p>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">{lowStockProducts.length} low stock</p>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-muted-foreground">All-time sales</p>
          </CardContent>
        </Card>
      </div>

      {/* ----------  Lists  ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {recentSales.length === 0 ? (
                <p className="py-8 text-center text-gray-500">No sales yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between rounded border p-3">
                      <div>
                        <p className="font-medium">Sale #{sale.id.slice(-6)}</p>
                        <p className="text-sm text-gray-500">{sale.items.length} items</p>
                        <p className="text-xs text-gray-400">{sale.timestamp.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${sale.total.toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs">
                          {sale.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {lowStockProducts.length === 0 ? (
                <p className="py-8 text-center text-gray-500">All products well stocked</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between rounded border p-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={product.stock === 0 ? "destructive" : "secondary"} className="text-xs">
                          {product.stock} left
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
