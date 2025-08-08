import { Link, useLocation } from "wouter"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import {
  ChartPie,
  FolderOpen,
  Layers,
  Lightbulb,
  ChartScatter,
  BarChart3,
  Clock,
  Users,
  Settings,
  History,
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

export function Sidebar() {
  const [location] = useLocation()
  const { user } = useAuth()

  const userRole = user?.role || "contributor"

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {filteredMenuItems.map((item, index) => {
            if (item.type === "section") {
              return (
                <div key={index} className="pt-4">
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
                <a
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                  )}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
