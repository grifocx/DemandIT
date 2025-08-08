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
import { Layers, Plus, Eye, Edit, Trash2 } from "lucide-react"
import type { Program, Portfolio, User } from "@shared/schema"

const programFormSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  portfolioId: z.string().min(1, "Portfolio is required"),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).default("active"),
  budget: z.string().optional(),
})

type ProgramFormData = z.infer<typeof programFormSchema>

interface ExtendedProgram extends Program {
  owner?: User
  portfolio?: Portfolio
  projectCount?: number
  demandCount?: number
}

export default function Programs() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

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

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: "",
      description: "",
      portfolioId: "",
      status: "active",
      budget: "",
    },
  })

  const { data: programs = [], isLoading: programsLoading } = useQuery<ExtendedProgram[]>({
    queryKey: ["/api/programs"],
    enabled: isAuthenticated,
    retry: false,
  })

  const { data: portfolios = [] } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated && modalOpen,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: async (data: ProgramFormData) => {
      const payload = {
        ...data,
        budget: data.budget ? parseInt(data.budget) * 100 : null,
      }
      await apiRequest("POST", "/api/programs", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] })
      toast({
        title: "Success",
        description: "Program created successfully",
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
        description: "Failed to create program",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (selectedProgram && modalOpen) {
      form.reset({
        name: selectedProgram.name,
        description: selectedProgram.description || "",
        portfolioId: selectedProgram.portfolioId,
        status: selectedProgram.status as "active" | "on_hold" | "completed" | "cancelled",
        budget: selectedProgram.budget ? (selectedProgram.budget / 100).toString() : "",
      })
    } else if (!selectedProgram && modalOpen) {
      form.reset()
    }
  }, [selectedProgram, modalOpen, form])

  const handleCreateProgram = () => {
    setSelectedProgram(undefined)
    setModalOpen(true)
  }

  const handleEditProgram = (program: Program) => {
    setSelectedProgram(program)
    setModalOpen(true)
  }

  const onSubmit = (data: ProgramFormData) => {
    createMutation.mutate(data)
  }

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

  const formatBudget = (budget: number | null) => {
    if (!budget) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget / 100)
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
      key: "name",
      header: "Program",
      render: (program: ExtendedProgram) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <Layers className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900" data-testid={`text-program-name-${program.id}`}>
              {program.name}
            </div>
            <div className="text-sm text-slate-500">{program.id.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      key: "portfolio",
      header: "Portfolio",
      render: (program: ExtendedProgram) => (
        <span className="text-sm text-slate-500" data-testid={`text-portfolio-${program.id}`}>
          {program.portfolio?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (program: ExtendedProgram) => (
        <span className="text-sm text-slate-500" data-testid={`text-description-${program.id}`}>
          {program.description || "No description"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (program: ExtendedProgram) => (
        <Badge 
          className={getStatusColor(program.status)}
          data-testid={`badge-status-${program.id}`}
        >
          {program.status === "on_hold" ? "On Hold" : program.status.charAt(0).toUpperCase() + program.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      render: (program: ExtendedProgram) => (
        <span className="text-sm text-slate-500" data-testid={`text-budget-${program.id}`}>
          {formatBudget(program.budget)}
        </span>
      ),
    },
    {
      key: "projectCount",
      header: "Projects",
      render: (program: ExtendedProgram) => (
        <span className="text-sm text-slate-900" data-testid={`text-project-count-${program.id}`}>
          {program.projectCount || 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (program: ExtendedProgram) => (
        <span className="text-sm text-slate-500" data-testid={`text-created-${program.id}`}>
          {program.createdAt ? formatDate(program.createdAt) : "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (program: ExtendedProgram) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            data-testid={`button-view-${program.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditProgram(program)}
            className="text-slate-400 hover:text-slate-600"
            data-testid={`button-edit-${program.id}`}
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
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
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
                  Programs
                </h1>
                <p className="text-slate-600 mt-1">Manage programs within your portfolios</p>
              </div>

              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreateProgram} data-testid="button-create-program">
                    <Plus className="h-4 w-4 mr-2" />
                    New Program
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle data-testid="text-modal-title">
                      {selectedProgram ? "Edit Program" : "Create New Program"}
                    </DialogTitle>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Program Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter program name" 
                                  {...field} 
                                  data-testid="input-program-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="portfolioId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Portfolio</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-portfolio">
                                    <SelectValue placeholder="Select Portfolio" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {portfolios.map((portfolio) => (
                                    <SelectItem key={portfolio.id} value={portfolio.id}>
                                      {portfolio.name}
                                    </SelectItem>
                                  ))}
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
                                placeholder="Program description..." 
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
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-status">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="on_hold">On Hold</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
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
                            : selectedProgram
                            ? "Update Program"
                            : "Create Program"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <DataTable
              data={programs}
              columns={columns}
              searchable={true}
              searchPlaceholder="Search programs..."
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
