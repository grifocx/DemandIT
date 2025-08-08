import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectModal } from "./ProjectModal"
import { useToast } from "@/hooks/use-toast"
import { isUnauthorizedError } from "@/lib/authUtils"
import { Eye, Edit, ChartScatter, Calendar, DollarSign } from "lucide-react"
import type { Project, User, Phase, Status, Program } from "@shared/schema"

interface ExtendedProject extends Project {
  owner?: User
  projectManager?: User
  phase?: Phase
  status?: Status
  program?: Program
}

export function ProjectTable() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState<Project | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: projects = [], isLoading } = useQuery<ExtendedProject[]>({
    queryKey: ["/api/projects"],
    retry: false,
  })

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
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
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

  const formatBudget = (budget: number | null) => {
    if (!budget) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget / 100)
  }

  const getUserInitials = (user?: User) => {
    if (!user) return "?"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleCreateProject = () => {
    setSelectedProject(undefined)
    setModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setModalOpen(true)
  }

  const handleViewProject = (project: Project) => {
    // Navigate to project detail page
    // This would be implemented with wouter navigation
    console.log("View project:", project.id)
  }

  const columns = [
    {
      key: "title",
      header: "Project",
      render: (project: ExtendedProject) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <ChartScatter className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900" data-testid={`text-project-title-${project.id}`}>
              {project.title}
            </div>
            <div className="text-sm text-slate-500">{project.id.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      key: "program",
      header: "Program",
      render: (project: ExtendedProject) => (
        <span className="text-sm text-slate-500" data-testid={`text-program-${project.id}`}>
          {project.program?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (project: ExtendedProject) => (
        <Badge 
          className={getStatusColor(project.status?.name)}
          data-testid={`badge-status-${project.id}`}
        >
          {project.status?.name || "No Status"}
        </Badge>
      ),
    },
    {
      key: "phase",
      header: "Phase",
      render: (project: ExtendedProject) => (
        <span className="text-sm text-slate-500" data-testid={`text-phase-${project.id}`}>
          {project.phase?.name || "No Phase"}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (project: ExtendedProject) => (
        <Badge 
          className={getPriorityColor(project.priority)}
          data-testid={`badge-priority-${project.id}`}
        >
          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
        </Badge>
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
          <span className="text-sm text-slate-900" data-testid={`text-pm-${project.id}`}>
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
              className="bg-blue-600 rounded-full h-2 transition-all duration-300" 
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <span className="text-sm text-slate-600 w-10" data-testid={`text-progress-${project.id}`}>
            {project.progress || 0}%
          </span>
        </div>
      ),
    },
    {
      key: "endDate",
      header: "Due Date",
      render: (project: ExtendedProject) => {
        const isOverdue = project.endDate && new Date(project.endDate) < new Date()
        return (
          <span 
            className={`text-sm ${isOverdue ? "text-red-600" : "text-slate-500"}`}
            data-testid={`text-due-date-${project.id}`}
          >
            {formatDate(project.endDate)}
          </span>
        )
      },
    },
    {
      key: "budget",
      header: "Budget",
      render: (project: ExtendedProject) => (
        <span className="text-sm text-slate-500" data-testid={`text-budget-${project.id}`}>
          {formatBudget(project.budget)}
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
            onClick={() => handleViewProject(project)}
            className="text-blue-600 hover:text-blue-700"
            data-testid={`button-view-${project.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditProject(project)}
            className="text-slate-400 hover:text-slate-600"
            data-testid={`button-edit-${project.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const filterOptions = [
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "at_risk", label: "At Risk" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500">Loading projects...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">
            Projects
          </h1>
          <p className="text-slate-600 mt-1">Manage and track all projects</p>
        </div>
        <Button 
          onClick={handleCreateProject}
          data-testid="button-create-project"
        >
          <ChartScatter className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <DataTable
        data={projects}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search projects..."
        filterable={true}
        filterOptions={filterOptions}
        pagination={true}
        pageSize={10}
      />

      <ProjectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        project={selectedProject}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/projects"] })
        }}
      />
    </div>
  )
}
