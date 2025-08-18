/**
 * Date utilities - Separation of Concerns
 * All date formatting logic centralized here
 */

export const formatDate = (date: string | Date | null): string => {
  if (!date) return "Not set"
  const dateObject = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObject.getTime())) return "Invalid date"
  
  return dateObject.toLocaleDateString("en-US", {
    month: "short", 
    day: "numeric",
    year: "numeric",
  })
}

export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return "Not set"
  const dateObject = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObject.getTime())) return "Invalid date"
  
  return dateObject.toLocaleDateString("en-US", {
    month: "short", 
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export const formatRelativeDate = (date: string | Date | null): string => {
  if (!date) return "Not set"
  const dateObject = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObject.getTime())) return "Invalid date"
  
  const now = new Date()
  const diffInMs = now.getTime() - dateObject.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  
  return `${Math.floor(diffInDays / 365)} years ago`
}

export const isDateInFuture = (date: string | Date | null): boolean => {
  if (!date) return false
  const dateObject = typeof date === 'string' ? new Date(date) : date
  return dateObject.getTime() > new Date().getTime()
}

export const formatDateInput = (date: string | Date | null): string => {
  if (!date) return ""
  const dateObject = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObject.getTime())) return ""
  
  return dateObject.toISOString().split('T')[0]
}