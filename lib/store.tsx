"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import { v4 as uuid } from "uuid"

/* ------------------------------------------------------------------ */
/*  ➜  DATA MODELS                                                    */
/* ------------------------------------------------------------------ */
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  barcode?: string
  category: string
  isBundle?: boolean
  lowStockThreshold?: number
}

export interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  discount?: number
}

export interface SaleItem {
  id: string
  productName: string
  quantity: number
  price: number
  discount?: number
  total: number
}

export interface Sale {
  id: string
  items: SaleItem[]
  subtotal: number
  total: number
  tax: number
  discount: number
  grandTotal: number
  timestamp: Date
  paymentMethod: "cash" | "card" | "mobile"
  cashierId: string
  cashierName: string
  receiptNumber: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  totalPurchases: number
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: "transport" | "supplies" | "utilities" | "salary" | "rent" | "other"
  paymentMethod: "cash" | "card" | "bank_transfer"
  date: Date
  receipt?: string
  notes?: string
  approvedBy?: string
}

export interface Cashup {
  id: string
  cashierId: string
  cashierName: string
  date: string
  startTime: string
  endTime?: string
  expectedCash: number
  actualCash?: number
  difference?: number
  totalSales: number
  cardSales: number
  mobileMoneySales: number
  sales: Sale[]
  notes?: string
  status: "pending" | "completed" | "approved"
}

/* ------------------------------------------------------------------ */
/*  ➜  STORE STATE + ACTIONS                                          */
/* ------------------------------------------------------------------ */
interface StoreState {
  products: Product[]
  cart: CartItem[]
  sales: Sale[]
  expenses: Expense[]
  cashups: Cashup[]
  currentCashup: Cashup | null
  sidebarCollapsed: boolean
  customers: Customer[]
  darkMode: boolean
}

/* prettier-ignore */
type StoreAction =
  | { type: "ADD_PRODUCT"; payload: Omit<Product, "id"> }
  | { type: "UPDATE_PRODUCT"; payload: { id: string; updates: Partial<Product> } }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "ADD_TO_CART"; payload: Product }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "APPLY_DISCOUNT"; payload: { id: string; discount: number } }
  | { type: "CLEAR_CART" }
  | { type: "COMPLETE_SALE"; payload: any }
  | { type: "ADD_SALE"; payload: Sale }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "UPDATE_EXPENSE"; payload: { id: string; updates: Partial<Expense> } }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "START_CASHUP"; payload: Cashup }
  | { type: "COMPLETE_CASHUP"; payload: { actualCash: number; notes?: string } }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "SET_SIDEBAR_COLLAPSED"; payload: boolean }
  | { type: "ADD_CUSTOMER"; payload: Customer }
  | { type: "UPDATE_CUSTOMER"; payload: { id: string; updates: Partial<Customer> } }

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "A4 Paper Ream",
    description: "500 sheets, 70 gsm white paper",
    price: 8.5,
    stock: 20,
    imageUrl: "/placeholder.svg?height=120&width=120",
    category: "Paper",
    barcode: "123456789012",
  },
  {
    id: "2",
    name: "Blue Ball-Point Pen",
    description: "0.7 mm tip, smooth writing experience",
    price: 1.25,
    stock: 200,
    imageUrl: "/placeholder.svg?height=120&width=120",
    category: "Pens",
    barcode: "987654321098",
  },
  {
    id: "3",
    name: "Exercise Book",
    description: "80 pages, ruled, A4 size",
    price: 2.0,
    stock: 150,
    imageUrl: "/placeholder.svg?height=120&width=120",
    category: "Notebooks",
    barcode: "456789123456",
  },
]

const initialState: StoreState = {
  products: sampleProducts,
  cart: [],
  sales: [],
  expenses: [],
  cashups: [],
  currentCashup: null,
  sidebarCollapsed: false,
  customers: [],
  darkMode: false,
}

/* ------------------------------------------------------------------ */
/*  ➜  REDUCER                                                        */
/* ------------------------------------------------------------------ */
function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    /* ---------- Products ---------- */
    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, { ...action.payload, id: uuid() }] }

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload.updates } : p)),
      }

    case "DELETE_PRODUCT":
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) }

    /* ---------- Cart ---------- */
    case "ADD_TO_CART": {
      const product = action.payload
      const existingItem = state.cart.find((item) => item.id === product.id)

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
        }
      } else {
        return {
          ...state,
          cart: [
            ...state.cart,
            {
              id: product.id,
              name: product.name,
              quantity: 1,
              price: product.price,
              discount: 0,
            },
          ],
        }
      }
    }

    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((item) => item.id !== action.payload) }

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }

    case "APPLY_DISCOUNT":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id ? { ...item, discount: action.payload.discount } : item,
        ),
      }

    case "CLEAR_CART":
      return { ...state, cart: [] }

    case "COMPLETE_SALE": {
      const sale = action.payload
      return {
        ...state,
        cart: [],
        sales: [sale, ...state.sales],
      }
    }

    /* ---------- Customers ---------- */
    case "ADD_CUSTOMER":
      return { ...state, customers: [...state.customers, action.payload] }

    case "UPDATE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload.updates } : c)),
      }

    /* ---------- Sales ---------- */
    case "ADD_SALE":
      return { ...state, sales: [...state.sales, action.payload] }

    /* ---------- Expenses ---------- */
    case "ADD_EXPENSE":
      return { ...state, expenses: [...state.expenses, action.payload] }

    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.payload.id ? { ...e, ...action.payload.updates } : e)),
      }

    case "DELETE_EXPENSE":
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) }

    /* ---------- Cash-up ---------- */
    case "START_CASHUP":
      return { ...state, currentCashup: action.payload }

    case "COMPLETE_CASHUP":
      if (!state.currentCashup) return state
      const diff = action.payload.actualCash - state.currentCashup.expectedCash
      return {
        ...state,
        currentCashup: null,
        cashups: [
          {
            ...state.currentCashup,
            ...action.payload,
            difference: diff,
            endTime: new Date().toLocaleTimeString(),
            status: "completed",
          },
          ...state.cashups,
        ],
      }

    /* ---------- UI State ---------- */
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }

    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode }

    case "SET_SIDEBAR_COLLAPSED":
      return { ...state, sidebarCollapsed: action.payload }

    /* ---------- Default ---------- */
    default:
      return state
  }
}

/* ------------------------------------------------------------------ */
/*  ➜  CONTEXT + PROVIDER                                             */
/* ------------------------------------------------------------------ */
const StoreContext = createContext<
  | (StoreState & {
      dispatch: React.Dispatch<StoreAction>
      toggleSidebar: () => void
      addProduct: (p: Omit<Product, "id">) => void
      updateProduct: (id: string, updates: Partial<Product>) => void
      deleteProduct: (id: string) => void
      addExpense: (e: Omit<Expense, "id">) => void
      updateExpense: (id: string, updates: Partial<Expense>) => void
      deleteExpense: (id: string) => void
      addCustomer: (c: Omit<Customer, "id" | "totalPurchases">) => void
      updateCustomer: (id: string, u: Partial<Customer>) => void
      getBestSellingProducts: (days?: number) => { product: Product; totalSold: number; revenue: number }[]
      getSlowMovingStock: (days?: number) => Product[]
      getDailySalesSummary: (date?: Date) => { totalSales: number; totalRevenue: number; totalProfit: number }
      getProfitLoss: (start: Date, end: Date) => { revenue: number; expenses: number; profit: number }
    })
  | null
>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const toggleSidebar = () => dispatch({ type: "TOGGLE_SIDEBAR" })

  // Product management functions
  const addProduct = (product: Omit<Product, "id">) => {
    dispatch({ type: "ADD_PRODUCT", payload: product })
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    dispatch({ type: "UPDATE_PRODUCT", payload: { id, updates } })
  }

  const deleteProduct = (id: string) => {
    dispatch({ type: "DELETE_PRODUCT", payload: id })
  }

  // Expense management functions
  const addExpense = (expense: Omit<Expense, "id">) => {
    dispatch({ type: "ADD_EXPENSE", payload: { ...expense, id: uuid() } })
  }

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    dispatch({ type: "UPDATE_EXPENSE", payload: { id, updates } })
  }

  const deleteExpense = (id: string) => {
    dispatch({ type: "DELETE_EXPENSE", payload: id })
  }

  // Customer management functions
  const addCustomer = (c: Omit<Customer, "id" | "totalPurchases">) =>
    dispatch({
      type: "ADD_CUSTOMER",
      payload: { ...c, id: uuid(), totalPurchases: 0 },
    })

  const updateCustomer = (id: string, updates: Partial<Customer>) =>
    dispatch({ type: "UPDATE_CUSTOMER", payload: { id, updates } })

  /* ---------- REPORT HELPERS ---------- */
  function getBestSellingProducts(days = 30) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const tally = new Map<string, { totalSold: number; revenue: number }>()
    state.sales
      .filter((s) => s.timestamp >= cutoff)
      .forEach((sale) =>
        sale.items.forEach((item) => {
          const stats = tally.get(item.id) ?? { totalSold: 0, revenue: 0 }
          tally.set(item.id, {
            totalSold: stats.totalSold + item.quantity,
            revenue: stats.revenue + item.quantity * item.price,
          })
        }),
      )

    return Array.from(tally)
      .map(([id, stats]) => ({
        product: state.products.find((p) => p.id === id)!,
        ...stats,
      }))
      .filter((item) => item.product)
      .sort((a, b) => b.totalSold - a.totalSold)
  }

  function getSlowMovingStock(days = 60) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const soldIds = new Set(state.sales.filter((s) => s.timestamp >= cutoff).flatMap((s) => s.items.map((i) => i.id)))

    return state.products.filter((p) => !soldIds.has(p.id) && p.stock > 0)
  }

  function getDailySalesSummary(date = new Date()) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const todaySales = state.sales.filter((s) => s.timestamp >= start && s.timestamp <= end)
    const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)

    return {
      totalSales: todaySales.length,
      totalRevenue,
      totalProfit: totalRevenue * 0.2, // crude margin for demo
    }
  }

  function getProfitLoss(start: Date, end: Date) {
    const periodSales = state.sales.filter((s) => s.timestamp >= start && s.timestamp <= end)
    const revenue = periodSales.reduce((sum, s) => sum + s.total, 0)
    const expensesTotal = state.expenses
      .filter((e) => e.date >= start && e.date <= end)
      .reduce((sum, e) => sum + e.amount, 0)

    return {
      revenue,
      expenses: expensesTotal,
      profit: revenue - expensesTotal,
    }
  }

  return (
    <StoreContext.Provider
      value={{
        ...state,
        dispatch,
        toggleSidebar,
        addProduct,
        updateProduct,
        deleteProduct,
        addExpense,
        updateExpense,
        deleteExpense,
        addCustomer,
        updateCustomer,
        /* report helpers */
        getBestSellingProducts,
        getSlowMovingStock,
        getDailySalesSummary,
        getProfitLoss,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  ➜  HOOK                                                           */
/* ------------------------------------------------------------------ */
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within a StoreProvider")
  return ctx
}
