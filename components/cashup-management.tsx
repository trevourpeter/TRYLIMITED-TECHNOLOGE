"use client"

import { useState, useCallback } from "react"
import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Calculator,
  DollarSign,
  CreditCard,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { useModalKeyboardManager } from "@/lib/keyboard-manager"

export function CashupManagement() {
  const { sales, currentCashup, cashups, dispatch } = useStore()
  const { user } = useAuth()
  const { toast } = useToast()
  const [actualCash, setActualCash] = useState("")
  const [notes, setNotes] = useState("")
  const [showStartCashup, setShowStartCashup] = useState(false)
  const [showCompleteCashup, setShowCompleteCashup] = useState(false)

  // Disable global shortcuts when modals are open
  useModalKeyboardManager(showCompleteCashup)

  // Calculate today's sales
  const today = new Date().toDateString()
  const todaySales = sales.filter((sale) => sale.timestamp.toDateString() === today)

  const cashSales = todaySales.filter((sale) => sale.paymentMethod === "cash")
  const cardSales = todaySales.filter((sale) => sale.paymentMethod === "card")
  const mobileSales = todaySales.filter((sale) => sale.paymentMethod === "mobile")

  const totalCashSales = cashSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalCardSales = cardSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalMobileSales = mobileSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalSales = totalCashSales + totalCardSales + totalMobileSales

  const startCashup = () => {
    const cashup = {
      id: Date.now().toString(),
      cashierId: user?.id || "current-user",
      cashierName: user?.name || "Current User",
      date: today,
      startTime: new Date().toLocaleTimeString(),
      expectedCash: totalCashSales,
      status: "pending" as const,
      sales: todaySales,
      totalSales,
      cardSales: totalCardSales,
      mobileMoneySales: totalMobileSales,
    }

    dispatch({ type: "START_CASHUP", payload: cashup })
    setShowStartCashup(false)
    toast({
      title: "Cashup Started",
      description: "End-of-day cashup process initiated",
    })
  }

  const completeCashup = () => {
    const actualAmount = Number.parseFloat(actualCash)
    if (isNaN(actualAmount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid cash amount",
        variant: "destructive",
      })
      return
    }

    dispatch({
      type: "COMPLETE_CASHUP",
      payload: { actualCash: actualAmount, notes },
    })

    setShowCompleteCashup(false)
    setActualCash("")
    setNotes("")

    toast({
      title: "Cashup Completed",
      description: "Cash reconciliation completed successfully",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getDifferenceBadge = (difference: number) => {
    if (difference > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          +${difference.toFixed(2)} Over
        </Badge>
      )
    } else if (difference < 0) {
      return (
        <Badge variant="destructive">
          <TrendingDown className="h-3 w-3 mr-1" />${Math.abs(difference).toFixed(2)} Short
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <CheckCircle className="h-3 w-3 mr-1" />
        Exact Match
      </Badge>
    )
  }

  const handleActualCashChange = useCallback((value: string) => {
    setActualCash(value)
  }, [])

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cashup Management</h1>
          <p className="text-gray-600">End-of-day cash reconciliation</p>
        </div>
        {!currentCashup && (
          <Button onClick={() => setShowStartCashup(true)} className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Start Cashup
          </Button>
        )}
      </div>

      {/* Current Cashup */}
      {currentCashup && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Active Cashup Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${currentCashup.expectedCash.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Expected Cash</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentCashup.sales.length}</div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">${currentCashup.totalSales.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
            </div>
            <Button onClick={() => setShowCompleteCashup(true)} className="w-full">
              Complete Cashup
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Today's Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${totalCashSales.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Cash Sales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">${totalCardSales.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Card Sales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Smartphone className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">${totalMobileSales.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Mobile Money</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-gray-600" />
              <div>
                <div className="text-2xl font-bold">{todaySales.length}</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cashup History */}
      <Card>
        <CardHeader>
          <CardTitle>Cashup History</CardTitle>
        </CardHeader>
        <CardContent>
          {cashups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No cashup records found</div>
          ) : (
            <div className="space-y-4">
              {cashups.map((cashup) => (
                <div key={cashup.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold">{cashup.cashierName}</div>
                      <div className="text-sm text-gray-600">
                        {cashup.date} • {cashup.startTime} - {cashup.endTime}
                      </div>
                    </div>
                    {getStatusBadge(cashup.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Expected</div>
                      <div className="font-semibold">${cashup.expectedCash.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Actual</div>
                      <div className="font-semibold">${cashup.actualCash?.toFixed(2) || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Difference</div>
                      <div>{cashup.difference !== undefined && getDifferenceBadge(cashup.difference)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                      <div className="font-semibold">${cashup.totalSales.toFixed(2)}</div>
                    </div>
                  </div>

                  {cashup.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Notes:</div>
                      <div className="text-sm">{cashup.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Cashup Dialog */}
      <Dialog open={showStartCashup} onOpenChange={setShowStartCashup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start End-of-Day Cashup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Today's Cash Sales Summary</div>
              <div className="text-3xl font-bold text-green-600">${totalCashSales.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Expected cash in drawer</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{cashSales.length}</div>
                <div className="text-sm text-gray-600">Cash Transactions</div>
              </div>
              <div>
                <div className="text-lg font-semibold">${totalSales.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowStartCashup(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={startCashup} className="flex-1">
                Start Cashup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Cashup Dialog */}
      <Dialog open={showCompleteCashup} onOpenChange={setShowCompleteCashup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Cashup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Expected Cash</div>
              <div className="text-2xl font-bold text-green-600">${currentCashup?.expectedCash.toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Actual Cash Count</label>
              <Input
                key="actual-cash"
                type="number"
                step="0.01"
                value={actualCash}
                onChange={(e) => handleActualCashChange(e.target.value)}
                placeholder="0.00"
              />
              {actualCash && currentCashup && (
                <div className="mt-2">
                  {getDifferenceBadge(Number.parseFloat(actualCash) - currentCashup.expectedCash)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Textarea
                key="cashup-notes"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Any discrepancies or notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCompleteCashup(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={completeCashup} className="flex-1" disabled={!actualCash}>
                Complete Cashup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
