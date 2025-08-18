/**
 * ProductTableActions - Single Responsibility Principle
 * Handles only action buttons for product table rows
 */

import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import type { Product } from "@shared/schema"

interface ProductTableActionsProps {
  product: Product
  onView: (product: Product) => void
  onEdit: (product: Product) => void
}

export function ProductTableActions({ product, onView, onEdit }: ProductTableActionsProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onView(product)}
        data-testid={`button-view-${product.id}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(product)}
        data-testid={`button-edit-${product.id}`}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  )
}