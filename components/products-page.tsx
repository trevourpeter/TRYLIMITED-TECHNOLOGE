"use client"

import type React from "react"
import { useState, memo, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Package } from "lucide-react"

import { useStore, type Product } from "@/lib/store"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useModalKeyboardManager, useKeyboardManager } from "@/lib/keyboard-manager"
import { useShortcuts } from "@/lib/shortcuts-manager"

/* --------  Static Category List (for filter) -------- */
const categories = ["Paper", "Pens", "Pencils", "Erasers", "Rulers", "Notebooks", "Markers", "Office Supplies"]

/* -------------------------------------------------------------------------- */
/*                                 Form component                             */
/* -------------------------------------------------------------------------- */
type ProductFormProps = {
  initial: {
    name: string
    category: string
    price: string
    stock: string
    barcode: string
    description: string
  }
  onSave(values: Omit<Product, "id" | "imageUrl">): void
  onCancel(): void
  isEdit?: boolean
}

const ProductForm = memo(function ProductForm({ initial, onSave, onCancel, isEdit = false }: ProductFormProps) {
  const [values, setValues] = useState(initial)

  const handleField = (field: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSelect = (value: string) => setValues((prev) => ({ ...prev, category: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: values.name,
      category: values.category,
      price: Number(values.price),
      stock: Number(values.stock),
      barcode: values.barcode,
      description: values.description,
    })
  }

  const idSuffix = isEdit ? "edit" : "add"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* name + category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor={`product-name-${idSuffix}`}>Product Name</label>
          <Input
            id={`product-name-${idSuffix}`}
            value={values.name}
            onChange={handleField("name")}
            required
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`product-category-${idSuffix}`}>Category</label>
          <Select value={values.category} onValueChange={handleSelect}>
            <SelectTrigger id={`product-category-${idSuffix}`}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* price + stock */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor={`product-price-${idSuffix}`}>Price ($)</label>
          <Input
            id={`product-price-${idSuffix}`}
            type="number"
            step="0.01"
            value={values.price}
            onChange={handleField("price")}
            required
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`product-stock-${idSuffix}`}>Stock Qty</label>
          <Input
            id={`product-stock-${idSuffix}`}
            type="number"
            value={values.stock}
            onChange={handleField("stock")}
            required
            autoComplete="off"
          />
        </div>
      </div>

      {/* barcode */}
      <div className="space-y-2">
        <label htmlFor={`product-barcode-${idSuffix}`}>Barcode</label>
        <Input
          id={`product-barcode-${idSuffix}`}
          value={values.barcode}
          onChange={handleField("barcode")}
          autoComplete="off"
        />
      </div>

      {/* description */}
      <div className="space-y-2">
        <label htmlFor={`product-description-${idSuffix}`}>Description</label>
        <Textarea
          id={`product-description-${idSuffix}`}
          rows={3}
          value={values.description}
          onChange={handleField("description")}
        />
      </div>

      {/* actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {isEdit ? "Update Product" : "Add Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
})

/* -------------------------------------------------------------------------- */
/*                                Main page                                   */
/* -------------------------------------------------------------------------- */
export function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const { areShortcutsEnabled } = useKeyboardManager()
  const { checkShortcut } = useShortcuts()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "low-stock">("all")
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [flash, setFlash] = useState("")

  // Disable global shortcuts when modals are open
  useModalKeyboardManager(addOpen || editOpen)

  // Keyboard shortcuts for adding products
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!areShortcutsEnabled) return

      const activeElement = document.activeElement
      const isTypingInInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      )
      
      if (isTypingInInput) return

      if (checkShortcut(e, "ADD_PRODUCT")) {
        e.preventDefault()
        setAddOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [areShortcutsEnabled, checkShortcut])

  /* ---------------------------------------------------------------------- */
  /*                               helpers                                  */
  /* ---------------------------------------------------------------------- */
  const resetFlash = () => setTimeout(() => setFlash(""), 3000)

  const handleAdd = (data: Omit<Product, "id" | "imageUrl">) => {
    addProduct({ ...data, imageUrl: "/placeholder.svg?height=120&width=120" })
    setFlash("Product added successfully!")
    setAddOpen(false)
    resetFlash()
  }

  const handleUpdate = (data: Omit<Product, "id" | "imageUrl">) => {
    if (!editing) return
    updateProduct(editing.id, data)
    setFlash("Product updated successfully!")
    setEditing(null)
    setEditOpen(false)
    resetFlash()
  }

  const confirmDelete = () => {
    if (!deleting) return
    deleteProduct(deleting.id)
    setFlash("Product deleted successfully!")
    setDeleting(null)
    resetFlash()
  }

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "all" || p.category === filter
    return matchesSearch && matchesFilter
  })

  /* ---------------------------------------------------------------------- */
  /*                               render                                   */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your stationery inventory</p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              initial={{
                name: "",
                category: "",
                price: "",
                stock: "",
                barcode: "",
                description: "",
              }}
              onSave={handleAdd}
              onCancel={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Flash message */}
      {flash && (
        <Alert>
          <AlertDescription>{flash}</AlertDescription>
        </Alert>
      )}

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <Badge variant="secondary">{p.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${p.price.toFixed(2)}</span>
                <span className={`text-sm ${p.stock <= 10 ? "text-red-500" : "text-muted-foreground"}`}>
                  Stock: {p.stock}
                </span>
              </div>

              {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
              {p.barcode && <p className="text-xs text-muted-foreground">Barcode: {p.barcode}</p>}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setEditing(p)
                    setEditOpen(true)
                  }}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => setDeleting(p)}>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm || filter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first product."}
          </p>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen && !!editing} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProductForm
              isEdit
              initial={{
                name: editing.name,
                category: editing.category,
                price: editing.price.toString(),
                stock: editing.stock.toString(),
                barcode: editing.barcode || "",
                description: editing.description || "",
              }}
              onSave={handleUpdate}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently remove "{deleting?.name}" from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
