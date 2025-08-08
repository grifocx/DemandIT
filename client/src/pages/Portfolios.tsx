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
import { FolderOpen, Plus, Eye, Edit, Trash2 } from "lucide-react"
import type { Portfolio, User } from "@shared/schema"

const portfolioFormSchema = z.object({
  name: z.string().min(1, "Portfolio name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).default("active"),
  budget: z.string().optional(),
})

type PortfolioFormData = z.infer<typeof portfolioFormSchema>

interface ExtendedPortfolio extends Portfolio {
  owner?: User
  programCount?: number
  projectCount?: number
}

export default function Portfolios() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | undefined>()
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

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      budget: "",
    },
  })

  const { data: portfolios = [], isLoading: portfoliosLoading } = useQuery<ExtendedPortfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      const payload = {
        ...data,
        budget: data.budget ? parseInt(data.budget) * 100 : null,
      }
      await apiRequest("POST", "/api/portfolios", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] })
      toast({
        title: "Success",
        description: "Portfolio created successfully",
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
        description: "Failed to create portfolio",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      const payload = {
        ...data,
        budget: data.budget ? parseInt(data.budget) * 100 : null,
      }
      await apiRequest("PUT", `/api/portfolios/${selectedPortfolio!.id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] })
      toast({
        title: "Success",
        description: "Portfolio updated successfully",
      })
      setModalOpen(false)
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
        description: "Failed to update portfolio",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/portfolios/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] })
      toast({
        title: "Success",
        description: "Portfolio deleted successfully",
      })
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
        description: "Failed to delete portfolio",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (selectedPortfolio && modalOpen) {
      form.reset({
        name: selectedPortfolio.name,
        description: selectedPortfolio.description || "",
        status: selectedPortfolio.status as "active" | "on_hold" | "completed" | "cancelled",
        budget: selectedPortfolio.budget ? (selectedPortfolio.budget / 100).toString() : "",
      })
    } else if (!selectedPortfolio && modalOpen) {
      form.reset()
    }
  }, [selectedPortfolio, modalOpen, form])

  const handleCreatePortfolio = () => {
    setSelectedPortfolio(undefined)
    setModalOpen(true)
  }

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setModalOpen(true)
  }

  const handleDeletePortfolio = (portfolio: Portfolio) => {
    if (confirm(`Are you sure you want to delete "${portfolio.name}"?`)) {
      deleteMutation.mutate(portfolio.id)
    }
  }

  const onSubmit = (data: PortfolioFormData) => {
    if (selectedPortfolio) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
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
      header: "Portfolio",
      render: (portfolio: ExtendedPortfolio) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900" data-testid={`text-portfolio-name-${portfolio.id}`}>
              {portfolio.name}
            </div>
            <div className="text-sm text-slate-500">{portfolio.id.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (portfolio: ExtendedPortfolio) => (
        <span className="text-sm text-slate-500" data-testid={`text-description-${portfolio.id}`}>
          {portfolio.description || "No description"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (portfolio: ExtendedPortfolio) => (
        <Badge 
          className={getStatusColor(portfolio.status)}
          data-testid={`badge-status-${portfolio.id}`}
        >
          {portfolio.status === "on_hold" ? "On Hold" : portfolio.status.charAt(0).toUpperCase() + portfolio.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      render: (portfolio: ExtendedPortfolio) => (
        <span className="text-sm text-slate-500" data-testid={`text-budget-${portfolio.id}`}>
          {formatBudget(portfolio.budget)}
        </span>
      ),
    },
    {
      key: "programCount",
      header: "Programs",
      render: (portfolio: ExtendedPortfolio) => (
        <span className="text-sm text-slate-900" data-testid={`text-program-count-${portfolio.id}`}>
          {portfolio.programCount || 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (portfolio: ExtendedPortfolio) => (
        <span className="text-sm text-slate-500" data-testid={`text-created-${portfolio.id}`}>
          {formatDate(portfolio.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (portfolio: ExtendedPortfolio) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            data-testid={`button-view-${portfolio.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditPortfolio(portfolio)}
            className="text-slate-400 hover:text-slate-600"
            data-testid={`button-edit-${portfolio.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeletePortfolio(portfolio)}
            className="text-red-400 hover:text-red-600"
            data-testid={`button-delete-${portfolio.id}`}
          >
            <Trash2 className="h-4 w-4" />
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
                  Portfolios
                </h1>
                <p className="text-slate-600 mt-1">Manage and organize your IT portfolios</p>
              </div>

              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreatePortfolio} data-testid="button-create-portfolio">
                    <Plus className="h-4 w-4 mr-2" />
                    New Portfolio
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle data-testid="text-modal-title">
                      {selectedPortfolio ? "Edit Portfolio" : "Create New Portfolio"}
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
                              <FormLabel>Portfolio Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter portfolio name" 
                                  {...field} 
                                  data-testid="input-portfolio-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Portfolio description..." 
                                rows={3} 
                                {...field} 
                                data-testid="textarea-description"
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
                          disabled={createMutation.isPending || updateMutation.isPending}
                          data-testid="button-submit"
                        >
                          {createMutation.isPending || updateMutation.isPending
                            ? "Saving..."
                            : selectedPortfolio
                            ? "Update Portfolio"
                            : "Create Portfolio"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <DataTable
              data={portfolios}
              columns={columns}
              searchable={true}
              searchPlaceholder="Search portfolios..."
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
