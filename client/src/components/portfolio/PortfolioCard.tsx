import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FolderOpen, ChevronRight } from "lucide-react"
import type { Portfolio } from "@shared/schema"

interface PortfolioCardProps {
  portfolio: Portfolio & {
    programCount?: number
    projectCount?: number
    progress?: number
  }
  onView?: (portfolio: Portfolio) => void
}

export function PortfolioCard({ portfolio, onView }: PortfolioCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "on_hold":
        return "On Hold"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const formatBudget = (budget: number | null) => {
    if (!budget) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget / 100)
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900" data-testid={`text-portfolio-name-${portfolio.id}`}>
              {portfolio.name}
            </h4>
            <p className="text-sm text-slate-600" data-testid={`text-portfolio-description-${portfolio.id}`}>
              {portfolio.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            className={getStatusColor(portfolio.status)}
            data-testid={`badge-portfolio-status-${portfolio.id}`}
          >
            {getStatusLabel(portfolio.status)}
          </Badge>
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(portfolio)}
              className="text-slate-400 hover:text-slate-600"
              data-testid={`button-view-portfolio-${portfolio.id}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-600">Programs</p>
          <p className="font-semibold text-slate-900" data-testid={`text-program-count-${portfolio.id}`}>
            {portfolio.programCount || 0}
          </p>
        </div>
        <div>
          <p className="text-slate-600">Projects</p>
          <p className="font-semibold text-slate-900" data-testid={`text-project-count-${portfolio.id}`}>
            {portfolio.projectCount || 0}
          </p>
        </div>
        <div>
          <p className="text-slate-600">Budget</p>
          <p className="font-semibold text-slate-900" data-testid={`text-budget-${portfolio.id}`}>
            {formatBudget(portfolio.budget)}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      {portfolio.progress !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span data-testid={`text-progress-${portfolio.id}`}>{portfolio.progress}%</span>
          </div>
          <Progress value={portfolio.progress} className="h-2" />
        </div>
      )}
    </div>
  )
}
