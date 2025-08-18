import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProductModal } from "./ProductModal"
import { useToast } from "@/hooks/use-toast"
import { isUnauthorizedError } from "@/lib/authUtils"
import { formatDate } from "@/lib/utils"
import { Eye, Edit, Package, Calendar, User } from "lucide-react"
import type { Product, User as UserType, Program } from "@shared/schema"

interface ExtendedProduct extends Product {
  owner?: UserType
  program?: Program
}

export function ProductTable() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: products = [], isLoading } = useQuery<ExtendedProduct[]>({
    queryKey: ["/api/products"],
    retry: false,
  })

  const getStatusColor = (status?: string) => {
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

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not set"
    const dateObject = typeof date === 'string' ? new Date(date) : date
    return dateObject.toLocaleDateString("en-US", {
      month: "short", 
      day: "numeric",
      year: "numeric",
    })
  }

  const getUserInitials = (user?: UserType) => {
    if (!user) return "?"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleCreateProduct = () => {
    setSelectedProduct(undefined)
    setModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleViewProduct = (product: Product) => {
    // Navigate to product detail page
    // This would be implemented with wouter navigation
    console.log("View product:", product.id)
  }

  const columns = [
    {
      key: "name",
      header: "Product",
      render: (product: ExtendedProduct) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <Package className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </div>
            <div className="text-sm text-slate-500">v{product.version || '1.0.0'}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (product: ExtendedProduct) => (
        <div className="max-w-xs">
          <div className="text-sm text-slate-900 truncate" data-testid={`text-description-${product.id}`}>
            {product.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      key: "program",
      header: "Program",
      render: (product: ExtendedProduct) => (
        <div className="text-sm text-slate-900" data-testid={`text-program-${product.id}`}>
          {product.program?.name || "Unknown Program"}
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (product: ExtendedProduct) => (
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={product.owner?.profileImageUrl || ""} />
            <AvatarFallback className="text-xs">
              {getUserInitials(product.owner)}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm text-slate-900" data-testid={`text-owner-${product.id}`}>
            {product.owner ? `${product.owner.firstName} ${product.owner.lastName}` : "Unassigned"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product: ExtendedProduct) => (
        <Badge className={getStatusColor(product.status)} data-testid={`badge-status-${product.id}`}>
          {product.status?.replace('_', ' ') || "Unknown"}
        </Badge>
      ),
    },
    {
      key: "launchDate",
      header: "Launch Date",
      render: (product: ExtendedProduct) => (
        <div className="flex items-center text-sm text-slate-900">
          <Calendar className="h-4 w-4 mr-1 text-slate-400" />
          <span data-testid={`text-launch-date-${product.id}`}>
            {formatDate(product.launchDate)}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (product: ExtendedProduct) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewProduct(product)}
            data-testid={`button-view-${product.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditProduct(product)}
            data-testid={`button-edit-${product.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
            <p className="text-slate-600 mt-2">
              Manage your product portfolio and deliverables.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-slate-500">Loading products...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-slate-600 mt-2">
            Manage your product portfolio and deliverables.
          </p>
        </div>
        <Button onClick={handleCreateProduct} data-testid="button-create-product">
          <Package className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder="Search products..."
      />

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}