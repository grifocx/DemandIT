/**
 * ProductTable - Refactored following Single Responsibility Principle
 * Focused solely on rendering the product table UI
 */

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { ProductModal } from "./ProductModal"
import { createProductTableColumns } from "./ProductTableColumns"
import { useProducts } from "@/hooks/useProducts"
import { Package } from "lucide-react"
import type { Product } from "@shared/schema"

export function ProductTable() {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>()
  const [modalOpen, setModalOpen] = useState(false)

  // Use custom hook for data management (SRP)
  const { products, isLoading } = useProducts()

  // Event handlers (focused responsibility)
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

  // Table columns configuration (extracted to separate component)
  const columns = createProductTableColumns({
    onView: handleViewProduct,
    onEdit: handleEditProduct,
  })

  // Loading state
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

  // Main render
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