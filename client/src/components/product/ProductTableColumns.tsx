/**
 * ProductTableColumns - Single Responsibility Principle
 * Defines table column configuration for products
 */

import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/UserAvatar"
import { ProductTableActions } from "./ProductTableActions"
import { getStatusColor } from "@/utils/styling"
import { formatDate } from "@/utils/date"
import { Package, Calendar } from "lucide-react"
import type { ExtendedProduct } from "@/services/products"
import type { Product } from "@shared/schema"

interface ColumnHandlers {
  onView: (product: Product) => void
  onEdit: (product: Product) => void
}

export function createProductTableColumns({ onView, onEdit }: ColumnHandlers) {
  return [
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
        <UserAvatar 
          user={product.owner as any} 
          showName 
          size="sm"
          data-testid={`avatar-owner-${product.id}`}
        />
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
        <ProductTableActions
          product={product}
          onView={onView}
          onEdit={onEdit}
        />
      ),
    },
  ]
}