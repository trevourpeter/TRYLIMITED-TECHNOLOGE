"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Calendar,
  Download,
  AlertTriangle,
  BarChart3,
  PieChart,
} from "lucide-react"

export function ReportsDashboard() {
  const {
    getBestSellingProducts,
    getSlowMovingStock,
    getDailySalesSummary,
    getProfitLoss,
    products,
    sales,
    customers,
    expenses,
  } = useStore()

  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  // Calculate reports
  const bestSelling = getBestSellingProducts(Number.parseInt(selectedPeriod))
  const slowMoving = getSlowMovingStock(Number.parseInt(selectedPeriod))
  const dailySummary = getDailySalesSummary(new Date(selectedDate))

  const profitLossStart = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const profitLossEnd = endDate ? new Date(endDate) : new Date()
  const profitLoss = getProfitLoss(profitLossStart, profitLossEnd)

  // Calculate additional metrics
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.isActive).length
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockLevel).length
  const outOfStockProducts = products.filter((p) => p.stock === 0).length

  const totalCustomers = customers.length
  const frequentCustomers = customers.filter((c) => c.isFrequent).length

  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.grandTotal, 0)
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const exportReport = (reportType: string) => {
    let data: any = {}
    let filename = ""

    switch (reportType) {
      case "best-selling":
        data = bestSelling
        filename = `best-selling-products-${selectedPeriod}days.json`
        break
      case "slow-moving":
        data = slowMoving
        filename = `slow-moving-stock-${selectedPeriod}days.json`
        break
      case "daily-summary":
        data = dailySummary
        filename = `daily-summary-${selectedDate}.json`
        break
      case "profit-loss":
        data = profitLoss
        filename = `profit-loss-${profitLossStart.toISOString().split("T")[0]}-to-${profitLossEnd.toISOString().split("T")[0]}.json`
        break
      default:
        return
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and reporting</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Avg: ${averageSaleValue.toFixed(2)} per sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts} low stock, {outOfStockProducts} out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">{frequentCustomers} frequent customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue - totalExpenses).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="best-selling" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="best-selling">Best Selling</TabsTrigger>
          <TabsTrigger value="slow-moving">Slow Moving</TabsTrigger>
          <TabsTrigger value="daily-summary">Daily Summary</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
        </TabsList>

        <TabsContent value="best-selling" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Best Selling Products
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => exportReport("best-selling")}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {bestSelling.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sales data</h3>
                    <p className="mt-1 text-sm text-gray-500">No sales found for the selected period.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bestSelling.map((item, index) => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">{item.product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{item.totalSold} sold</p>
                          <p className="text-sm text-green-600">${item.revenue.toFixed(2)} revenue</p>
                          <Badge variant="outline" className="text-xs">
                            ${item.product.price.toFixed(2)} each
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slow-moving" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Slow Moving Stock
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="60">Last 60 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="180">Last 6 months</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => exportReport("slow-moving")}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {slowMoving.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">All products moving well</h3>
                    <p className="mt-1 text-sm text-gray-500">No slow-moving stock found for the selected period.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slowMoving.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category}</p>
                          {product.lastRestocked && (
                            <p className="text-xs text-gray-400">
                              Last restocked: {product.lastRestocked.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{product.stock} in stock</p>
                          <p className="text-sm text-gray-600">${product.price.toFixed(2)} each</p>
                          <Badge variant="destructive" className="text-xs">
                            ${(product.stock * product.price).toFixed(2)} tied up
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-summary" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Sales Summary
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                  <Button size="sm" onClick={() => exportReport("daily-summary")}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold">{dailySummary.totalSales}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold">${dailySummary.totalRevenue.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Profit</p>
                        <p className="text-2xl font-bold">${dailySummary.totalProfit.toFixed(2)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Daily Performance Insights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Average Sale Value:</span>
                    <span className="font-medium">
                      $
                      {dailySummary.totalSales > 0
                        ? (dailySummary.totalRevenue / dailySummary.totalSales).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Margin:</span>
                    <span className="font-medium">
                      {dailySummary.totalRevenue > 0
                        ? ((dailySummary.totalProfit / dailySummary.totalRevenue) * 100).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Profit & Loss Statement
                </CardTitle>
                <Button size="sm" onClick={() => exportReport("profit-loss")}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-900">${profitLoss.revenue.toFixed(2)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Total Expenses</p>
                          <p className="text-2xl font-bold text-red-900">${profitLoss.expenses.toFixed(2)}</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`${profitLoss.profit >= 0 ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm font-medium ${profitLoss.profit >= 0 ? "text-blue-800" : "text-red-800"}`}
                          >
                            Net {profitLoss.profit >= 0 ? "Profit" : "Loss"}
                          </p>
                          <p
                            className={`text-2xl font-bold ${profitLoss.profit >= 0 ? "text-blue-900" : "text-red-900"}`}
                          >
                            ${Math.abs(profitLoss.profit).toFixed(2)}
                          </p>
                        </div>
                        {profitLoss.profit >= 0 ? (
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        ) : (
                          <TrendingDown className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Financial Ratios</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Profit Margin:</span>
                      <span className="font-medium">
                        {profitLoss.revenue > 0 ? ((profitLoss.profit / profitLoss.revenue) * 100).toFixed(1) : "0"}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expense Ratio:</span>
                      <span className="font-medium">
                        {profitLoss.revenue > 0 ? ((profitLoss.expenses / profitLoss.revenue) * 100).toFixed(1) : "0"}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Period Summary</h4>
                  <p className="text-sm text-gray-600">
                    From {profitLossStart.toLocaleDateString()} to {profitLossEnd.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {profitLoss.profit >= 0
                      ? `Your business generated a profit of $${profitLoss.profit.toFixed(2)} during this period.`
                      : `Your business had a loss of $${Math.abs(profitLoss.profit).toFixed(2)} during this period.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
