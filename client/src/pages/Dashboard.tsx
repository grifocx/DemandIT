import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { TopNavigation } from "@/components/layout/TopNavigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { MetricsCard } from "@/components/dashboard/MetricsCard"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { PortfolioCard } from "@/components/portfolio/PortfolioCard"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import {
  ChartScatter,
  Lightbulb,
  DollarSign,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
} from "lucide-react"
import type { Portfolio, Project, User, Phase, Status } from "@shared/schema"

interface DashboardMetrics {
  activeProjects: number
  pendingDemands: number
  budgetUtilized: number
  atRiskProjects: number
}

interface ExtendedProject extends Project {
  projectManager?: User
  phase?: Phase
  status?: Status
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      })
      setTimeout(() => {
        window.location.href = "/api/login"
      }, 500)
      return
    }
  }, [isAuthenticated, isLoading, toast])

  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: isAuthenticated,
    retry: false,
  })

  const { data: portfolios = [] } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
    retry: false,
  })

  const { data: projects = [] } = useQuery<ExtendedProject[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800"
    
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "on hold":
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
      case "at risk":
      case "at_risk":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getUserInitials = (user?: User) => {
    if (!user) return "?"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  // Active projects for table (limit to 5 most recent)
  const activeProjects = projects.slice(0, 5)

  const projectColumns = [
    {
      key: "title",
      header: "Project",
      render: (project: ExtendedProject) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <ChartScatter className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{project.title}</div>
            <div className="text-sm text-slate-500">{project.id.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (project: ExtendedProject) => (
        <Badge className={getStatusColor(project.status?.name)}>
          {project.status?.name || "No Status"}
        </Badge>
      ),
    },
    {
      key: "phase",
      header: "Phase",
      render: (project: ExtendedProject) => (
        <span className="text-sm text-slate-500">
          {project.phase?.name || "No Phase"}
        </span>
      ),
    },
    {
      key: "projectManager",
      header: "PM",
      render: (project: ExtendedProject) => (
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={project.projectManager?.profileImageUrl || ""} />
            <AvatarFallback className="text-xs bg-slate-200">
              {getUserInitials(project.projectManager)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-slate-900">
            {project.projectManager 
              ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
              : "Unassigned"
            }
          </span>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (project: ExtendedProject) => (
        <div className="flex items-center">
          <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2 w-16">
            <div 
              className="bg-blue-600 rounded-full h-2" 
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <span className="text-sm text-slate-600">{project.progress || 0}%</span>
        </div>
      ),
    },
    {
      key: "endDate",
      header: "Due Date",
      render: (project: ExtendedProject) => (
        <span className="text-sm text-slate-500">
          {formatDate(project.endDate)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (project: ExtendedProject) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      
      <div className="flex h-screen pt-16">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900" data-testid="text-dashboard-title">
                Portfolio Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Overview of all portfolios, programs, and projects</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <MetricsCard
                title="Active Projects"
                value={metrics?.activeProjects || 0}
                icon={ChartScatter}
                iconColor="bg-blue-50 text-blue-600"
                trend={{
                  value: "+12%",
                  direction: "up",
                  label: "from last month",
                }}
                testId="metric-active-projects"
              />

              <MetricsCard
                title="Pending Demands"
                value={metrics?.pendingDemands || 0}
                icon={Lightbulb}
                iconColor="bg-amber-50 text-amber-600"
                trend={{
                  value: "-5%",
                  direction: "down",
                  label: "from last month",
                }}
                testId="metric-pending-demands"
              />

              <MetricsCard
                title="Budget Utilized"
                value={`${metrics?.budgetUtilized || 0}%`}
                icon={DollarSign}
                iconColor="bg-green-50 text-green-600"
                trend={{
                  value: "On track",
                  direction: "neutral",
                  label: "for Q4 goals",
                }}
                testId="metric-budget-utilized"
              />

              <MetricsCard
                title="At Risk Projects"
                value={metrics?.atRiskProjects || 0}
                icon={AlertTriangle}
                iconColor="bg-red-50 text-red-600"
                trend={{
                  value: "Requires attention",
                  direction: "neutral",
                  label: "",
                }}
                testId="metric-at-risk-projects"
              />
            </div>

            {/* Portfolio Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Portfolio Health */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Portfolio Health Overview</h3>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" className="bg-blue-50 text-blue-600">
                      All Portfolios
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {portfolios.length === 0 ? (
                    <div className="text-center py-8 text-slate-500" data-testid="text-no-portfolios">
                      No portfolios available
                    </div>
                  ) : (
                    portfolios.slice(0, 3).map((portfolio) => (
                      <PortfolioCard
                        key={portfolio.id}
                        portfolio={{
                          ...portfolio,
                          programCount: 0, // These would come from actual queries
                          projectCount: 0,
                          progress: Math.floor(Math.random() * 100), // Mock progress
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <ActivityFeed />
            </div>

            {/* Active Projects Table */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Active Projects</h3>
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-project">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </div>
              
              <DataTable
                data={activeProjects}
                columns={projectColumns}
                searchable={false}
                filterable={false}
                pagination={false}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
