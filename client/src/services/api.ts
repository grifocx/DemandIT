/**
 * API Service Layer - Separation of Concerns
 * Centralized API endpoint definitions and utilities
 */

// API Endpoints - Single source of truth
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    USER: '/api/auth/user',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
  },
  
  // Core Entities
  PORTFOLIOS: '/api/portfolios',
  PROGRAMS: '/api/programs',
  DEMANDS: '/api/demands',
  PROJECTS: '/api/projects',
  PRODUCTS: '/api/products',
  
  // Relationships
  PROJECT_PRODUCTS: '/api/project-products',
  
  // Lookup Data
  PHASES: '/api/phases',
  STATUSES: '/api/statuses',
  USERS: '/api/users',
  
  // Analytics & Reporting
  DASHBOARD: {
    METRICS: '/api/dashboard/metrics',
  },
  
  // Admin
  AUDIT: '/api/audit',
  SEED: '/api/admin/seed',
} as const

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

// Query Key Factories - For consistent caching
export const createQueryKey = {
  portfolios: () => [API_ENDPOINTS.PORTFOLIOS] as const,
  portfolio: (id: string) => [API_ENDPOINTS.PORTFOLIOS, id] as const,
  
  programs: (portfolioId?: string) => 
    portfolioId 
      ? [API_ENDPOINTS.PROGRAMS, portfolioId] as const
      : [API_ENDPOINTS.PROGRAMS] as const,
  program: (id: string) => [API_ENDPOINTS.PROGRAMS, id] as const,
  
  demands: (programId?: string) => 
    programId 
      ? [API_ENDPOINTS.DEMANDS, programId] as const
      : [API_ENDPOINTS.DEMANDS] as const,
  demand: (id: string) => [API_ENDPOINTS.DEMANDS, id] as const,
  
  projects: (programId?: string) => 
    programId 
      ? [API_ENDPOINTS.PROJECTS, programId] as const
      : [API_ENDPOINTS.PROJECTS] as const,
  project: (id: string) => [API_ENDPOINTS.PROJECTS, id] as const,
  
  products: (programId?: string) => 
    programId 
      ? [API_ENDPOINTS.PRODUCTS, programId] as const
      : [API_ENDPOINTS.PRODUCTS] as const,
  product: (id: string) => [API_ENDPOINTS.PRODUCTS, id] as const,
  
  projectProducts: (projectId?: string, productId?: string) => {
    if (projectId && productId) {
      return [API_ENDPOINTS.PROJECT_PRODUCTS, 'project', projectId, 'product', productId] as const
    }
    if (projectId) {
      return [API_ENDPOINTS.PROJECT_PRODUCTS, 'project', projectId] as const
    }
    if (productId) {
      return [API_ENDPOINTS.PROJECT_PRODUCTS, 'product', productId] as const
    }
    return [API_ENDPOINTS.PROJECT_PRODUCTS] as const
  },
  
  phases: (type?: string) => 
    type 
      ? [API_ENDPOINTS.PHASES, type] as const
      : [API_ENDPOINTS.PHASES] as const,
  
  statuses: (type?: string) => 
    type 
      ? [API_ENDPOINTS.STATUSES, type] as const
      : [API_ENDPOINTS.STATUSES] as const,
  
  users: () => [API_ENDPOINTS.USERS] as const,
  user: (id: string) => [API_ENDPOINTS.USERS, id] as const,
  currentUser: () => [API_ENDPOINTS.AUTH.USER] as const,
  
  audit: () => [API_ENDPOINTS.AUDIT] as const,
  dashboardMetrics: () => [API_ENDPOINTS.DASHBOARD.METRICS] as const,
}

// URL builders for dynamic endpoints
export const buildUrl = {
  portfolio: (id: string) => `${API_ENDPOINTS.PORTFOLIOS}/${id}`,
  program: (id: string) => `${API_ENDPOINTS.PROGRAMS}/${id}`,
  demand: (id: string) => `${API_ENDPOINTS.DEMANDS}/${id}`,
  project: (id: string) => `${API_ENDPOINTS.PROJECTS}/${id}`,
  product: (id: string) => `${API_ENDPOINTS.PRODUCTS}/${id}`,
  projectProduct: (id: string) => `${API_ENDPOINTS.PROJECT_PRODUCTS}/${id}`,
  phase: (id: string) => `${API_ENDPOINTS.PHASES}/${id}`,
  status: (id: string) => `${API_ENDPOINTS.STATUSES}/${id}`,
  user: (id: string) => `${API_ENDPOINTS.USERS}/${id}`,
}

// Common API utilities
export const isApiError = (error: unknown): error is ApiError => {
  return error !== null && 
    typeof error === 'object' && 
    'message' in error && 
    'status' in error &&
    typeof (error as ApiError).message === 'string' && 
    typeof (error as ApiError).status === 'number'
}

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}