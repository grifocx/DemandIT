/**
 * Styling utilities - Separation of Concerns
 * All styling logic separated from components
 */

export const getStatusColor = (status?: string): string => {
  if (!status) return "bg-gray-100 text-gray-800"
  
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800"
    case "in_development":
    case "in development":
      return "bg-blue-100 text-blue-800"
    case "deprecated":
      return "bg-yellow-100 text-yellow-800"
    case "sunset":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getPhaseColor = (phase?: string): string => {
  if (!phase) return "bg-gray-100 text-gray-800"
  
  switch (phase.toLowerCase()) {
    case "planning":
      return "bg-blue-100 text-blue-800"
    case "development":
    case "in_progress":
      return "bg-orange-100 text-orange-800"
    case "testing":
      return "bg-purple-100 text-purple-800"
    case "deployment":
    case "completed":
      return "bg-green-100 text-green-800"
    case "on_hold":
    case "paused":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getPriorityColor = (priority?: string): string => {
  if (!priority) return "bg-gray-100 text-gray-800"
  
  switch (priority.toLowerCase()) {
    case "high":
    case "critical":
      return "bg-red-100 text-red-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const formatCurrency = (amount?: number | null): string => {
  if (!amount) return "$0"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount / 100) // Convert from cents
}

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + "..."
}