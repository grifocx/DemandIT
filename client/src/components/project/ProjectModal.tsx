import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"
import { isUnauthorizedError } from "@/lib/authUtils"
import type { Project, Portfolio, Program, Phase, Status, User } from "@shared/schema"

const projectFormSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  programId: z.string().min(1, "Program is required"),
  phaseId: z.string().optional(),
  statusId: z.string().optional(),
  projectManagerId: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectFormSchema>

interface ProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  onSuccess?: () => void
}

export function ProjectModal({ open, onOpenChange, project, onSuccess }: ProjectModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("")

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      programId: "",
      phaseId: "",
      statusId: "",
      projectManagerId: "",
      priority: "medium",
      startDate: "",
      endDate: "",
      budget: "",
    },
  })

  // Queries
  const { data: portfolios = [] } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: open,
  })

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs", selectedPortfolio],
    enabled: open && !!selectedPortfolio,
  })

  const { data: phases = [] } = useQuery<Phase[]>({
    queryKey: ["/api/phases"],
    enabled: open,
  })

  const { data: statuses = [] } = useQuery<Status[]>({
    queryKey: ["/api/statuses"],
    enabled: open,
  })

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users/search?q="],
    enabled: open,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const payload = {
        ...data,
        budget: data.budget ? parseInt(data.budget) * 100 : null, // Convert to cents
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      }
      await apiRequest("POST", "/api/projects", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] })
      toast({
        title: "Success",
        description: "Project created successfully",
      })
      onSuccess?.()
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const payload = {
        ...data,
        budget: data.budget ? parseInt(data.budget) * 100 : null,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      }
      await apiRequest("PUT", `/api/projects/${project!.id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] })
      toast({
        title: "Success",
        description: "Project updated successfully",
      })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      })
    },
  })

  // Effect to populate form when editing
  useEffect(() => {
    if (project && open) {
      const program = programs.find(p => p.id === project.programId)
      if (program) {
        setSelectedPortfolio(program.portfolioId)
      }

      form.reset({
        title: project.title,
        description: project.description || "",
        programId: project.programId,
        phaseId: project.phaseId || "",
        statusId: project.statusId || "",
        projectManagerId: project.projectManagerId || "",
        priority: project.priority as "high" | "medium" | "low",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
        budget: project.budget ? (project.budget / 100).toString() : "",
      })
    } else if (!project && open) {
      form.reset()
      setSelectedPortfolio("")
    }
  }, [project, open, form, programs])

  const onSubmit = (data: ProjectFormData) => {
    if (project) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const projectPhases = phases.filter(p => p.type === "project")
  const projectStatuses = statuses.filter(s => s.type === "project")
  const projectManagers = users.filter(u => 
    u.role === "project_manager" || u.role === "admin"
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {project ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter project title" 
                        {...field} 
                        data-testid="input-project-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Project description..." 
                      rows={3} 
                      {...field} 
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Portfolio
                </label>
                <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                  <SelectTrigger data-testid="select-portfolio">
                    <SelectValue placeholder="Select Portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="programId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-program">
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs.filter(program => program.id && program.id.trim() !== "").map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="phaseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phase</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-phase">
                          <SelectValue placeholder="Select Phase" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectPhases.filter(phase => phase.id && phase.id.trim() !== "").map((phase) => (
                          <SelectItem key={phase.id} value={phase.id}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectStatuses.filter(status => status.id && status.id.trim() !== "").map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectManagerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Manager</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-project-manager">
                          <SelectValue placeholder="Assign PM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectManagers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        data-testid="input-budget"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : project
                  ? "Update Project"
                  : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
