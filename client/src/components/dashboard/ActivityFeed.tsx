import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  ChartScatter,
  Lightbulb,
  AlertTriangle,
  User,
  Clock,
} from "lucide-react"
import type { AuditLog } from "@shared/schema"

interface Activity {
  id: string
  type: "project" | "demand" | "user" | "alert"
  description: string
  timestamp: string
  icon: typeof ChartScatter
  iconColor: string
}

export function ActivityFeed() {
  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit"],
    retry: false,
  })

  // Transform audit logs into activities
  const activities: Activity[] = auditLogs.slice(0, 10).map((log) => {
    let icon = ChartScatter
    let iconColor = "bg-blue-100 text-blue-600"
    let description = `${log.changeType} ${log.entityType}`

    switch (log.entityType) {
      case "project":
        icon = ChartScatter
        iconColor = "bg-blue-100 text-blue-600"
        if (log.changeType === "created") {
          description = `New project "${log.details?.project?.title || 'Unknown'}" created`
        } else if (log.changeType === "status_changed") {
          description = `Project status updated`
        }
        break
      case "demand":
        icon = Lightbulb
        iconColor = "bg-green-100 text-green-600"
        if (log.changeType === "created") {
          description = `New demand "${log.details?.demand?.title || 'Unknown'}" submitted`
        }
        break
      case "portfolio":
        icon = User
        iconColor = "bg-purple-100 text-purple-600"
        break
      default:
        icon = Clock
        iconColor = "bg-gray-100 text-gray-600"
    }

    return {
      id: log.id,
      type: log.entityType as Activity["type"],
      description,
      timestamp: log.timestamp,
      icon,
      iconColor,
    }
  })

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return "Just now"
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900" data-testid="text-activity-title">
          Recent Activity
        </h3>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500" data-testid="text-no-activity">
            No recent activity
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm text-slate-900" 
                    data-testid={`text-activity-description-${activity.id}`}
                  >
                    {activity.description}
                  </p>
                  <p 
                    className="text-xs text-slate-500" 
                    data-testid={`text-activity-timestamp-${activity.id}`}
                  >
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
