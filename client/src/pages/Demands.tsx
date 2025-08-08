import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { TopNavigation } from "@/components/layout/TopNavigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { apiRequest } from "@/lib/queryClient"
import { isUnauthorizedError } from "@/lib/authUtils"
import { formatDate } from "@/lib/utils"
import { Lightbulb, Plus, Eye, Edit, ArrowRight } from "lucide-react"
import type { Demand, Program, Portfolio, Phase, Status, User } from "@shared/schema"

const demandFormSchema = z.object({
  title: z.string().min(1, "Demand title is required"),
  description: z.string().optional(),
  programId: z.string().min(1, "Program is required"),
  phaseId: z.string().optional(),
  statusId: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  estimatedEffort: z.string().optional(),
  businessValue: z.string().optional(),
})

type DemandFormData = z.infer<typeof demandFormSchema>

interface ExtendedDemand extends Demand {
  owner?: User
  program?: Program
  phase?: Phase
  status?: Status
}

export default function Demands() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedDemand, setSelectedDemand] = useState<Demand | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("")

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

  const form = useForm<DemandFormData>({
    resolver: zodResolver(demandFormSchema),
    defaultValues: {
      title: "",
      description: "",
      programId: "",
      phaseId: "",
      statusId: "",
      priority: "medium",
      estimatedEffort: "",
      businessValue: "",
    },
  })

  const { data: demands = [], isLoading: demandsLoading } = useQuery<ExtendedDemand[]>({
    queryKey: ["/api/demands"],
    enabled: isAuthenticated,
    retry: false,
  })

  const { data: portfolios = [] } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated && modalOpen,
    retry: false,
  })

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ["/api/programs", selectedPortfolio],
    enabled: isAuthenticated && modalOpen && !!selectedPortfolio,
    retry: false,
  })

  const { data: phases = [] } = useQuery<Phase[]>({
    queryKey: ["/api/phases"],
    enabled: isAuthenticated && modalOpen,
    retry: false,
  })

  const { data: statuses = [] } = useQuery<Status[]>({
    queryKey: ["/api/statuses"],
    enabled: isAuthenticated && modalOpen,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: async (data: DemandFormData) => {
      const payload = {
        ...data,
        estimatedEffort: data.estimatedEffort ? parseInt(data.estimatedEffort) : null,
      }
      await apiRequest("POST", "/api/demands", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demands"] })
      toast({
        title: "Success",
        description: "Demand created successfully",
      })
      setModalOpen(false)
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
        description: "Failed to create demand",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (selectedDemand && modalOpen) {
      const program = programs.find(p => p.id === selectedDemand.programId)
      if (program) {
        setSelectedPortfolio(program.portfolioId)
      }

      form.reset({
        title: selectedDemand.title,
        description: selectedDemand.description || "",
        programId: selectedDemand.programId,
        phaseId: selectedDemand.phaseId || "",
        statusId: selectedDemand.statusId || "",
        priority: selectedDemand.priority as "high" | "medium" | "low",
        estimatedEffort: selectedDemand.estimatedEffort ? selectedDemand.estimatedEffort.toString() : "",
        businessValue: selectedDemand.businessValue || "",
      })
    } else if (!selectedDemand && modalOpen) {
      form.reset()
      setSelectedPortfolio("")
    }
  }, [selectedDemand, modalOpen, form, programs])

  const handleCreateDemand = () => {
    setSelectedDemand(undefined)
    setModalOpen(true)
  }

  const handleEditDemand = (demand: Demand) => {
    setSelectedDemand(demand)
    setModalOpen(true)
  }

  const onSubmit = (data: DemandFormData) => {
    createMutation.mutate(data)
  }

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800"
    
    switch (status.toLowerCase()) {
      case "pending":
      case "under review":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
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
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const columns = [
    {
      key: "title",
      header: "Demand",
      render: (demand: ExtendedDemand) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <Lightbulb className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900" data-testid={`text-demand-title-${demand.id}`}>
              {demand.title}
            </div>
            <div className="text-sm text-slate-500">{demand.id.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      key: "program",
      header: "Program",
      render: (demand: ExtendedDemand) => (
        <span className="text-sm text-slate-500" data-testid={`text-program-${demand.id}`}>
          {demand.program?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (demand: ExtendedDemand) => (
        <Badge 
          className={getStatusColor(demand.status?.name)}
          data-testid={`badge-status-${demand.id}`}
        >
          {demand.status?.name || "No Status"}
        </Badge>
      ),
    },
    {
      key: "phase",
      header: "Phase",
      render: (demand: ExtendedDemand) => (
        <span className="text-sm text-slate-500" data-testid={`text-phase-${demand.id}`}>
          {demand.phase?.name || "No Phase"}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (demand: ExtendedDemand) => (
        <Badge 
          className={getPriorityColor(demand.priority)}
          data-testid={`badge-priority-${demand.id}`}
        >
          {demand.priority.charAt(0).toUpperCase() + demand.priority.slice(1)}
        </Badge>
      ),
    },
    {
      key: "estimatedEffort",
      header: "Effort (hrs)",
      render: (demand: ExtendedDemand) => (
        <span className="text-sm text-slate-500" data-testid={`text-effort-${demand.id}`}>
          {demand.estimatedEffort || "N/A"}
        </span>
      ),
    },
    {
      key: "requestedDate",
      header: "Requested",
      render: (demand: ExtendedDemand) => (
        <span className="text-sm text-slate-500" data-testid={`text-requested-${demand.id}`}>
          {demand.requestedDate ? formatDate(demand.requestedDate) : "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (demand: ExtendedDemand) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            data-testid={`button-view-${demand.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditDemand(demand)}
            className="text-slate-400 hover:text-slate-600"
            data-testid={`button-edit-${demand.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            title="Convert to Project"
            data-testid={`button-convert-${demand.id}`}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const demandPhases = phases.filter(p => p.type === "demand")
  const demandStatuses = statuses.filter(s => s.type === "demand")

  const filterOptions = [
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "in_progress", label: "In Progress" },
  ]

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

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      
      <div className="flex h-screen pt-16">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="text-page-title">
                  Demands
                </h1>
                <p className="text-slate-600 mt-1">Manage incoming demands and requests</p>
              </div>

              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreateDemand} data-testid="button-create-demand">
                    <Plus className="h-4 w-4 mr-2" />
                    New Demand
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle data-testid="text-modal-title">
                      {selectedDemand ? "Edit Demand" : "Create New Demand"}
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
                              <FormLabel>Demand Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter demand title" 
                                  {...field} 
                                  data-testid="input-demand-title"
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
                                placeholder="Demand description..." 
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

                      <div className="grid grid-cols-2 gap-4">
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
                                  {demandPhases.filter(phase => phase.id && phase.id.trim() !== "").map((phase) => (
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
                                  {demandStatuses.filter(status => status.id && status.id.trim() !== "").map((status) => (
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="estimatedEffort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Effort (hours)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field} 
                                  data-testid="input-effort"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="businessValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Value</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the business value and benefits..." 
                                rows={3} 
                                {...field} 
                                data-testid="textarea-business-value"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setModalOpen(false)}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                          data-testid="button-submit"
                        >
                          {createMutation.isPending
                            ? "Saving..."
                            : selectedDemand
                            ? "Update Demand"
                            : "Create Demand"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <DataTable
              data={demands}
              columns={columns}
              searchable={true}
              searchPlaceholder="Search demands..."
              filterable={true}
              filterOptions={filterOptions}
              pagination={true}
              pageSize={10}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
