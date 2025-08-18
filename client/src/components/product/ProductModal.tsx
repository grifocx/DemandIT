/**
 * ProductModal - Refactored following Single Responsibility Principle
 * Focused solely on product creation/editing UI
 */

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { useProducts } from "@/hooks/useProducts"
import { createQueryKey } from "@/services/api"
import { formatDateInput } from "@/utils/date"
import type { Product, Portfolio, Program } from "@shared/schema"

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
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("")
  const { createProduct, updateProduct, isCreating, isUpdating } = useProducts()

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

  // Queries - using new API service layer
  const { data: portfolios = [] } = useQuery<Portfolio[]>({
    queryKey: createQueryKey.portfolios(),
    enabled: open,
  })

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: createQueryKey.programs(selectedPortfolio),
    enabled: open && !!selectedPortfolio,
  })

  // Handle form submission using service layer
  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        await updateProduct(product.id, data)
      } else {
        await createProduct(data)
      }
      
      onSuccess?.()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handling is done in the hook
      console.error("Form submission error:", error)
    }
  }

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        programId: product.programId,
        status: product.status as any,
        version: product.version || "1.0.0",
        launchDate: formatDateInput(product.launchDate),
        businessValue: product.businessValue || "",
      })
    } else {
      form.reset({
        name: "",
        description: "",
        programId: "",
        status: "in_development",
        version: "1.0.0",
        launchDate: "",
        businessValue: "",
      })
    }
  }, [product, form])

  // Find the portfolio that contains the selected program
  useEffect(() => {
    if (product?.programId && portfolios.length > 0) {
      // We need to fetch programs for each portfolio to find the right one
      // For now, set the first portfolio as default
      if (portfolios.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolios[0].id)
      }
    }
  }, [product, portfolios, selectedPortfolio])

  const isSubmitting = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create New Product"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter product name" 
                        {...field} 
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
                        placeholder="1.0.0" 
                        {...field}
                        data-testid="input-product-version"
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
                      placeholder="Describe the product..." 
                      className="resize-none" 
                      {...field}
                      data-testid="textarea-product-description"
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
                        <SelectTrigger data-testid="select-product-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in_development">In Development</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                        <SelectItem value="sunset">Sunset</SelectItem>
                      </SelectContent>
                    </Select>
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
                        type="date" 
                        {...field}
                        data-testid="input-product-launch-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio & Program</FormLabel>
                  <div className="space-y-2">
                    <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
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

                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedPortfolio}>
                      <FormControl>
                        <SelectTrigger data-testid="select-program">
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Value</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the business value and impact..." 
                      className="resize-none" 
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
                {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}