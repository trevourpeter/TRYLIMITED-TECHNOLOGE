"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ProductsPage } from "@/components/products-page"
import { SalesPage } from "@/components/sales-page"
import { UsersPage } from "@/components/users-page"
import { SettingsPage } from "@/components/settings-page"
import { StoreProvider, useStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AdvancedPOSInterface } from "@/components/advanced-pos-interface"
import { ReportsDashboard } from "@/components/reports-dashboard"
import { ExpenseTracker } from "@/components/expense-tracker"
import { CashupManagement } from "@/components/cashup-management"
import { Toaster } from "@/components/ui/toaster"

function AppContent() {
  const { user, isLoading } = useAuth()
  const { sidebarCollapsed, dispatch } = useStore()
  const [currentPage, setCurrentPage] = useState("dashboard")

  /* ---------- Persist sidebar state ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) dispatch({ type: "SET_SIDEBAR_COLLAPSED", payload: JSON.parse(saved) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  /* ---------- Auth loading ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginForm />

  /* ---------- Helpers ---------- */
  const getTitle = () => {
    const map: Record<string, string> = {
      dashboard: "Dashboard",
      pos: "Point of Sale",
      products: "Products",
      sales: "Sales",
      users: "Users",
      settings: "Settings",
      reports: "Reports",
      expenses: "Expenses",
      cashup: "Cash-up",
    }
    return map[currentPage] ?? "Dashboard"
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardOverview />
      case "pos":
        return <AdvancedPOSInterface />
      case "products":
        return <ProductsPage />
      case "sales":
        return <SalesPage />
      case "users":
        return <UsersPage />
      case "settings":
        return <SettingsPage />
      case "reports":
        return <ReportsDashboard />
      case "expenses":
        return <ExpenseTracker />
      case "cashup":
        return <CashupManagement />
      default:
        return <DashboardOverview />
    }
  }

  /* ---------- UI ---------- */
  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <AppSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#" onClick={() => setCurrentPage("dashboard")}>
                  Stationery POS
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{getTitle()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{renderPage()}</div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </div>
  )
}
