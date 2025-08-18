/**
 * Products Hook - Single Responsibility Principle
 * Manages product data state and operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { isUnauthorizedError } from "@/lib/authUtils"
import { ProductService, type ExtendedProduct, type CreateProductData } from "@/services/products"
import type { Product } from "@shared/schema"
import { createQueryKey, getErrorMessage } from "@/services/api"

interface UseProductsOptions {
  programId?: string
  enabled?: boolean
}

interface UseProductsReturn {
  products: ExtendedProduct[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  createProduct: (data: CreateProductData) => Promise<Product>
  updateProduct: (id: string, data: Partial<CreateProductData>) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export function useProducts({ programId, enabled = true }: UseProductsOptions = {}): UseProductsReturn {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for products
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ExtendedProduct[]>({
    queryKey: createQueryKey.products(programId),
    queryFn: () => ProductService.getProducts(programId),
    enabled,
    retry: false,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateProductData) => ProductService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey.products() })
      toast({
        title: "Success",
        description: "Product created successfully",
      })
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login"
        return
      }
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductData> }) =>
      ProductService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey.products() })
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login"
        return
      }
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey.products() })
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login"
        return
      }
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  return {
    products,
    isLoading,
    isError,
    error,
    refetch,
    createProduct: createMutation.mutateAsync,
    updateProduct: async (id: string, data: Partial<CreateProductData>) => {
      return await updateMutation.mutateAsync({ id, data })
    },
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

// Hook for a single product
interface UseProductOptions {
  id: string
  enabled?: boolean
}

interface UseProductReturn {
  product: ExtendedProduct | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useProduct({ id, enabled = true }: UseProductOptions): UseProductReturn {
  const {
    data: product = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ExtendedProduct>({
    queryKey: createQueryKey.product(id),
    queryFn: () => ProductService.getProduct(id),
    enabled: enabled && !!id,
    retry: false,
  })

  return {
    product,
    isLoading,
    isError,
    error,
    refetch,
  }
}