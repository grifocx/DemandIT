import { LucideIcon } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  trend?: {
    value: string
    direction: "up" | "down" | "neutral"
    label: string
  }
  testId?: string
}

export function MetricsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  trend,
  testId,
}: MetricsCardProps) {
  const getTrendColor = () => {
    if (!trend) return ""
    switch (trend.direction) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-slate-500"
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p 
            className="text-2xl font-bold text-slate-900" 
            data-testid={testId || `metric-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {value}
          </p>
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={getTrendColor()}>{trend.value}</span>
          <span className="text-slate-500 ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
