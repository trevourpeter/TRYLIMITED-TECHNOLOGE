"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useStore, type Expense } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Edit, Trash2, DollarSign, Receipt } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
const expenseCategories = [
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "supplies", label: "Supplies", icon: "📦" },
  { value: "utilities", label: "Utilities", icon: "⚡" },
  { value: "salary", label: "Salary", icon: "👥" },
  { value: "rent", label: "Rent", icon: "🏢" },
  { value: "other", label: "Other", icon: "📝" },
]

export function ExpenseTracker() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useStore()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showSuccess, setShowSuccess] = useState("")

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other" as Expense["category"],
    paymentMethod: "cash" as Expense["paymentMethod"],
    date: new Date().toISOString().split("T")[0],
    receipt: "",
    notes: "",
  })

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory

    let matchesPeriod = true
    if (selectedPeriod !== "all") {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - Number.parseInt(selectedPeriod))
      matchesPeriod = expense.date >= cutoffDate
    }

    return matchesSearch && matchesCategory && matchesPeriod
  })

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const categoryTotals = expenseCategories.map((category) => ({
    ...category,
    total: filteredExpenses
      .filter((expense) => expense.category === category.value)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }))

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      category: "other",
      paymentMethod: "cash",
      date: new Date().toISOString().split("T")[0],
      receipt: "",
      notes: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const expenseData = {
      description: formData.description,
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      date: new Date(formData.date),
      receipt: formData.receipt,
      notes: formData.notes,
      approvedBy: user?.id || "",
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData)
      setShowSuccess("Expense updated successfully!")
      setEditingExpense(null)
    } else {
      addExpense(expenseData)
      setShowSuccess("Expense added successfully!")
      setIsAddDialogOpen(false)
    }

    resetForm()
    setTimeout(() => setShowSuccess(""), 3000)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      date: expense.date.toISOString().split("T")[0],
      receipt: expense.receipt || "",
      notes: expense.notes || "",
    })
  }

  const handleDelete = (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(expenseId)
      setShowSuccess("Expense deleted successfully!")
      setTimeout(() => setShowSuccess(""), 3000)
    }
  }

  const ExpenseForm = () => {
    // Add useCallback for input handlers
    const handleInputChange = useCallback((field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }, [])

    // Custom input handler to prevent focus issues
    const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      // Stop ALL keyboard events from bubbling up to prevent focus loss
      e.stopPropagation()
    }, [])

    // Also handle keyup events to be extra safe
    const handleInputKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation()
    }, [])

    // Separate handler for textarea elements
    const handleTextareaKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation()
    }, [])

    const handleTextareaKeyUp = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation()
    }, [])

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expense-description">Description</Label>
          <Input
            id="expense-description"
            key="expense-description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            onKeyDown={handleInputKeyDown}
            onKeyUp={handleInputKeyUp}
            placeholder="e.g., Taxi fare for delivery"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expense-amount">Amount ($)</Label>
            <Input
              id="expense-amount"
              key="expense-amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              onKeyDown={handleInputKeyDown}
              onKeyUp={handleInputKeyUp}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>
            <Input
              id="expense-date"
              key="expense-date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              onKeyDown={handleInputKeyDown}
              onKeyUp={handleInputKeyUp}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expense-category">Category</Label>
            <Select
              key="expense-category"
              value={formData.category}
              onValueChange={(value: Expense["category"]) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-payment">Payment Method</Label>
            <Select
              key="expense-payment"
              value={formData.paymentMethod}
              onValueChange={(value: Expense["paymentMethod"]) => handleInputChange("paymentMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-receipt">Receipt Number (Optional)</Label>
          <Input
            id="expense-receipt"
            key="expense-receipt"
            value={formData.receipt}
            onChange={(e) => handleInputChange("receipt", e.target.value)}
            onKeyDown={handleInputKeyDown}
            onKeyUp={handleInputKeyUp}
            placeholder="Receipt or reference number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expense-notes">Notes (Optional)</Label>
          <Textarea
            id="expense-notes"
            key="expense-notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            onKeyUp={handleTextareaKeyUp}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {editingExpense ? "Update Expense" : "Add Expense"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm()
              setEditingExpense(null)
              setIsAddDialogOpen(false)
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Tracker</h1>
          <p className="text-gray-600">Track and manage business expenses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm />
          </DialogContent>
        </Dialog>
      </div>

      {showSuccess && (
        <Alert>
          <AlertDescription>{showSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} transactions</p>
          </CardContent>
        </Card>

        {categoryTotals.slice(0, 3).map((category) => (
          <Card key={category.value}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
              <span className="text-lg">{category.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${category.total.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {totalExpenses > 0 ? ((category.total / totalExpenses) * 100).toFixed(1) : "0"}% of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {expenseCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.icon} {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCategory !== "all" || selectedPeriod !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Start by adding your first expense."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {expenseCategories.find((cat) => cat.value === expense.category)?.icon || "📝"}
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-500">
                            {expenseCategories.find((cat) => cat.value === expense.category)?.label} •{" "}
                            {expense.paymentMethod}
                          </p>
                          <p className="text-xs text-gray-400">
                            {expense.date.toLocaleDateString()}
                            {expense.receipt && ` • Receipt: ${expense.receipt}`}
                          </p>
                          {expense.notes && <p className="text-xs text-gray-600 mt-1">{expense.notes}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs">
                          {expense.paymentMethod}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}
