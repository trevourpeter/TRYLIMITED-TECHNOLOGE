"use client"

import { BarChart3, Package, ShoppingCart, Users, Settings, LogOut, Store, DollarSign, Calculator } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useStore } from "@/lib/store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ShortcutsHelpDialog } from "@/components/shortcuts-help-dialog"

const menuItems = [
  {
    title: "Dashboard",
    page: "dashboard",
    icon: BarChart3,
    roles: ["admin", "cashier"],
  },
  {
    title: "POS",
    page: "pos",
    icon: ShoppingCart,
    roles: ["admin", "cashier"],
  },
  {
    title: "Cashup",
    page: "cashup",
    icon: Calculator,
    roles: ["admin", "cashier"],
  },
  {
    title: "Products",
    page: "products",
    icon: Package,
    roles: ["admin"],
  },
  {
    title: "Sales",
    page: "sales",
    icon: Store,
    roles: ["admin"],
  },
  {
    title: "Reports",
    page: "reports",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    title: "Expenses",
    page: "expenses",
    icon: DollarSign,
    roles: ["admin"],
  },
  {
    title: "Users",
    page: "users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Settings",
    page: "settings",
    icon: Settings,
    roles: ["admin"],
  },
]

interface AppSidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
}

export function AppSidebar({ currentPage, setCurrentPage }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const { dispatch } = useStore()

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role || "cashier"))

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Store className="h-6 w-6" />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">Stationery POS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={currentPage === item.page}
                    onClick={() => setCurrentPage(item.page)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 space-y-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <ShortcutsHelpDialog />
          </div>
          <div className="text-sm text-gray-600 group-data-[collapsible=icon]:hidden">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs">{user?.email}</p>
            <p className="text-xs capitalize text-blue-600">{user?.role}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="w-full bg-transparent">
            <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
