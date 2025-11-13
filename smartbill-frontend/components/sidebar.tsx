"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Upload, FileSpreadsheet, Settings, Building2, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "לוח בקרה",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "העלאת מסמכים",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "ספקים",
    href: "/suppliers",
    icon: Building2,
  },
  {
    title: "קטגוריות",
    href: "/categories",
    icon: Tag,
  },
  {
    title: "ייצוא",
    href: "/export",
    icon: FileSpreadsheet,
  },
  {
    title: "הגדרות",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar border-l border-sidebar-border h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sidebar-foreground">SmartBill</h1>
        <p className="text-sm text-muted-foreground mt-1">ניהול חשבוניות חכם</p>
      </div>

      <nav className="px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
