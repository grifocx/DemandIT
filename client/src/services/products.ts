/**
 * Product Service - Single Responsibility Principle
 * Handles all product-related API operations and business logic
 */

import { apiRequest } from "@/lib/queryClient"
import { API_ENDPOINTS, buildUrl } from "./api"
import type { Product, InsertProduct } from "@shared/schema"

export interface ExtendedProduct extends Product {
  owner?: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    profileImageUrl?: string | null
  }
  program?: {
    id: string
    name: string
  }
}

export interface CreateProductData {
  name: string
  description?: string
  programId: string
  status?: string
  version?: string
  launchDate?: string
  businessValue?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

export class ProductService {
  // Fetch all products
  static async getProducts(programId?: string): Promise<ExtendedProduct[]> {
    const endpoint = programId 
      ? `${API_ENDPOINTS.PRODUCTS}?programId=${programId}`
      : API_ENDPOINTS.PRODUCTS
    
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }
    return await response.json()
  }

  // Fetch a single product
  static async getProduct(id: string): Promise<ExtendedProduct> {
    const response = await fetch(buildUrl.product(id))
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`)
    }
    return await response.json()
  }

  // Create a new product
  static async createProduct(data: CreateProductData): Promise<Product> {
    const payload = {
      ...data,
      launchDate: data.launchDate ? new Date(data.launchDate) : null,
    }
    
    return await apiRequest("POST", API_ENDPOINTS.PRODUCTS, payload)
  }

  // Update an existing product
  static async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const payload = {
      ...data,
      launchDate: data.launchDate ? new Date(data.launchDate) : null,
    }
    
    return await apiRequest("PATCH", buildUrl.product(id), payload)
  }

  // Delete a product
  static async deleteProduct(id: string): Promise<void> {
    await apiRequest("DELETE", buildUrl.product(id))
  }

  // Validate product data
  static validateProductData(data: CreateProductData): string[] {
    const errors: string[] = []
    
    if (!data.name?.trim()) {
      errors.push("Product name is required")
    }
    
    if (!data.programId?.trim()) {
      errors.push("Program is required")
    }
    
    if (data.launchDate) {
      const date = new Date(data.launchDate)
      if (isNaN(date.getTime())) {
        errors.push("Invalid launch date")
      }
    }
    
    return errors
  }

  // Transform product data for display
  static transformForDisplay(product: ExtendedProduct): ExtendedProduct {
    return {
      ...product,
      status: product.status?.replace('_', ' ') || 'Unknown',
      version: product.version || '1.0.0'
    }
  }

  // Filter products by status
  static filterByStatus(products: ExtendedProduct[], status: string): ExtendedProduct[] {
    return products.filter(product => 
      product.status?.toLowerCase() === status.toLowerCase()
    )
  }

  // Sort products by various criteria
  static sortProducts(products: ExtendedProduct[], sortBy: 'name' | 'status' | 'launchDate' | 'createdAt'): ExtendedProduct[] {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return (a.status || '').localeCompare(b.status || '')
        case 'launchDate':
          const dateA = a.launchDate ? new Date(a.launchDate).getTime() : 0
          const dateB = b.launchDate ? new Date(b.launchDate).getTime() : 0
          return dateB - dateA
        case 'createdAt':
          const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return createdB - createdA
        default:
          return 0
      }
    })
  }
}