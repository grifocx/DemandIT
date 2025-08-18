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
import type { Product, Portfolio, Program, User } from "@shared/schema"

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  programId: z.string().min(1, "Program is required"),
  status: z.enum(["in_development", "active", "deprecated", "sunset"]).default("in_development"),
  version: z.string().default("1.0.0"),
  launchDate: z.string().optional(),
  businessValue: z.string().optional(),
})

type ProductFormData = z.infer<typeof productFormSchema>

interface ProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSuccess?: () => void
}

export function ProductModal({ open, onOpenChange, product, onSuccess }: ProductModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("")

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      programId: "",
      status: "in_development",
      version: "1.0.0",
      launchDate: "",
      businessValue: "",
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

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        ...data,
        launchDate: data.launchDate ? new Date(data.launchDate).toISOString() : null,
      }
      await apiRequest("POST", "/api/products", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] })
      toast({
        title: "Success",
        description: "Product created successfully",
      })
      onSuccess?.()
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login"
        return
      }
      
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!product?.id) throw new Error("No product ID")
      const payload = {
        ...data,
        launchDate: data.launchDate ? new Date(data.launchDate).toISOString() : null,
      }
      await apiRequest("PUT", `/api/products/${product.id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] })
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login"
        return
      }
      
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Load product data when editing
  useEffect(() => {
    if (product && open) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        programId: product.programId || "",
        status: product.status as any || "in_development",
        version: product.version || "1.0.0",
        launchDate: product.launchDate ? new Date(product.launchDate).toISOString().split('T')[0] : "",
        businessValue: product.businessValue || "",
      })

      // Find the portfolio for the selected program
      if (product.programId && programs.length > 0) {
        const selectedProgram = programs.find(p => p.id === product.programId)
        if (selectedProgram) {
          setSelectedPortfolio(selectedProgram.portfolioId)
        }
      }
    } else if (!product && open) {
      form.reset({
        name: "",
        description: "",
        programId: "",
        status: "in_development",
        version: "1.0.0",
        launchDate: "",
        businessValue: "",
      })
      setSelectedPortfolio("")
    }
  }, [product, open, form, programs])

  const onSubmit = (data: ProductFormData) => {
    if (product) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="product-modal">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create New Product"}
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
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter product name" 
                        data-testid="input-product-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="1.0.0" 
                        data-testid="input-version"
                      />
                    </FormControl>
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
                      {...field} 
                      placeholder="Enter product description" 
                      rows={3}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Portfolio</label>
                  <Select
                    value={selectedPortfolio}
                    onValueChange={setSelectedPortfolio}
                  >
                    <SelectTrigger data-testid="select-portfolio">
                      <SelectValue placeholder="Select portfolio first" />
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
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-program">
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {programs.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_development">In Development</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="deprecated">Deprecated</SelectItem>
                            <SelectItem value="sunset">Sunset</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="launchDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Launch Date</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          data-testid="input-launch-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="businessValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Value</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe the business value and impact"
                      rows={3}
                      data-testid="textarea-business-value"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
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
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? "Saving..." : (product ? "Update" : "Create")} Product
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}