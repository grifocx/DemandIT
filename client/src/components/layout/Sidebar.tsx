import { Link, useLocation } from "wouter"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  ChartPie,
  FolderOpen,
  Layers,
  Lightbulb,
  ChartScatter,
  Package,
  BarChart3,
  Clock,
  Users,
  Settings,
  History,
  Menu,
  X,
} from "lucide-react"

const menuItems = [
  {
    label: "Dashboard",
    icon: ChartPie,
    href: "/",
    roles: ["admin", "portfolio_manager", "program_manager", "project_manager", "contributor"],
  },
  {
    label: "Portfolio Management",
    type: "section",
    roles: ["admin", "portfolio_manager", "program_manager", "project_manager", "contributor"],
  },
  {
    label: "Portfolios",
    icon: FolderOpen,
    href: "/portfolios",
    roles: ["admin", "portfolio_manager", "program_manager", "project_manager", "contributor"],
  },
  {
    label: "Programs",
    icon: Layers,
    href: "/programs",
    roles: ["admin", "portfolio_manager", "program_manager", "project_manager", "contributor"],
  },
  {
    label: "Demands",
    icon: Lightbulb,
    href: "/demands",
    roles: ["admin", "portfolio_manager", "program_manager", "project_manager", "contributor"],
  },
  {
    label: "Projects",
    icon: ChartScatter,
    href: "/projects",
    roles: ["admin", "portfolio_manager", "program_manager", "project_manager", "contributor"],
  },
  {
    label: "Products",
    icon: Package,
    href: "/products",
    roles: ["admin", "portfolio_manager", "program_manager", "project_manager", "contributor"],
  },
  {
    label: "Reports & Analytics",
    type: "section",
    roles: ["admin", "portfolio_manager", "program_manager"],
  },
  {
    label: "Portfolio Health",
    icon: BarChart3,
    href: "/reports/portfolio-health",
    roles: ["admin", "portfolio_manager", "program_manager"],
  },
  {
    label: "Project Status",
    icon: Clock,
    href: "/reports/project-status",
    roles: ["admin", "portfolio_manager", "program_manager"],
  },
  {
    label: "Administration",
    type: "section",
    roles: ["admin"],
  },
  {
    label: "Users & Roles",
    icon: Users,
    href: "/admin/users",
    roles: ["admin"],
  },
  {
    label: "Workflow Config",
    icon: Settings,
    href: "/admin/workflow",
    roles: ["admin"],
  },
  {
    label: "Audit Log",
    icon: History,
    href: "/admin/audit",
    roles: ["admin"],
  },
]

// Mobile Sidebar Trigger (Hamburger Menu)
export function MobileSidebarTrigger({ className }: { className?: string }) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  
  if (!isMobile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("text-white hover:bg-slate-800 p-2", className)}
          data-testid="button-mobile-menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-white">
        <MobileSidebar onClose={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

// Mobile Sidebar Content
function MobileSidebar({ onClose }: { onClose: () => void }) {
  const [location] = useLocation()
  const { user } = useAuth()

  const userRole = user?.role || "contributor"
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-xl font-bold text-slate-900">
            Demand-IT
          </SheetTitle>
        </div>
        <div className="text-sm text-slate-600">
          Welcome, {user?.firstName} {user?.lastName}
        </div>
      </SheetHeader>
      
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item, index) => {
            if (item.type === "section") {
              return (
                <div key={index} className="pt-4 first:pt-0">
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </h3>
                </div>
              )
            }

            const Icon = item.icon!
            const isActive = location === item.href

            return (
              <Link key={index} href={item.href!}>
                <div
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                  )}
                  onClick={onClose}
                  data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

// Desktop Sidebar
export function Sidebar() {
  const [location] = useLocation()
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const userRole = user?.role || "contributor"
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  )

  // Don't render desktop sidebar on mobile
  if (isMobile) return null

  return (
    <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <nav className="space-y-2">
          {filteredMenuItems.map((item, index) => {
            if (item.type === "section") {
              return (
                <div key={index} className="pt-4 first:pt-0">
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </h3>
                </div>
              )
            }

            const Icon = item.icon!
            const isActive = location === item.href

            return (
              <Link key={index} href={item.href!}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                  )}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
