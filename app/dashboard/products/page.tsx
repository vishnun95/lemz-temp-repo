
"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { MockDatabase } from '@/lib/mock-db'
import { Product, ProductType } from '@/lib/types'
import { useToast } from '@/components/ui/toaster'
import { Modal } from '@/components/ui/modal'
import { Plus, Edit, Trash2, Package, AlertTriangle, Image as ImageIcon, DollarSign, Hash } from 'lucide-react'

const productSchema = yup.object({
  productCode: yup.string().required('Product code is required'),
  name: yup.string().required('Product name is required'),
  type: yup.string().required('Product type is required'),
  stockQuantity: yup.number().min(0, 'Stock quantity must be non-negative').required('Stock quantity is required'),
  price: yup.number().min(0, 'Price must be non-negative').required('Price is required'),
  description: yup.string(),
})

type ProductFormData = yup.InferType<typeof productSchema>

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'saree', label: 'Saree' },
  { value: 'churidhar', label: 'Churidhar' },
  { value: 'jewellery', label: 'Jewellery' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await MockDatabase.getProducts()
      setProducts(data)
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load products',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    reset()
    setEditingProduct(null)
    setShowAddModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setValue('productCode', product.productCode)
    setValue('name', product.name)
    setValue('type', product.type)
    setValue('stockQuantity', product.stockQuantity)
    setValue('price', product.price)
    setValue('description', product.description || '')
    setEditingProduct(product)
    setShowAddModal(true)
  }

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true)
    try {
      let productImages = ['https://i.pinimg.com/originals/39/5f/28/395f282620d0ff419d635e19b3e3443f.jpg', 'https://static.vecteezy.com/system/resources/previews/059/121/913/non_2x/impressive-rustic-dark-green-fabric-texture-close-up-detail-cutout-png.png']
      
      if (data.type === 'saree') {
        productImages = ['https://i.pinimg.com/originals/cc/8b/20/cc8b20d84b8821a66058126b412dcf12.jpg', 'https://i.pinimg.com/originals/29/ff/31/29ff31db439c1d113055e2bb710a8065.jpg']
      } else if (data.type === 'churidhar') {
        productImages = ['https://cdn.shopify.com/s/files/1/0075/9670/3834/products/cotton-maternity-kurti-with-churidar-dupatta-blue-5.jpg?v=1661868729', 'https://i.pinimg.com/originals/f5/43/56/f54356b1cad6a39e7006ede5aae878b1.jpg']
      } else if (data.type === 'jewellery') {
        productImages = ['https://i.pinimg.com/736x/a4/35/51/a43551bfa83302931d1a88e3bd9aa433.jpg', 'https://i.pinimg.com/originals/39/39/42/3939427486596c7dce842eb0f2e12afe.jpg']
      }

      const productData = {
        ...data,
        images: JSON.stringify(productImages)
      }

      if (editingProduct) {
        await MockDatabase.updateProduct(editingProduct.id, productData)
        addToast({
          title: 'Success',
          description: 'Product updated successfully',
          type: 'success'
        })
      } else {
        await MockDatabase.createProduct(productData)
        addToast({
          title: 'Success',
          description: 'Product added successfully',
          type: 'success'
        })
      }

      await loadProducts()
      setShowAddModal(false)
      reset()
      setEditingProduct(null)
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to save product',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return

    try {
      await MockDatabase.deleteProduct(product.id)
      addToast({
        title: 'Success',
        description: 'Product deleted successfully',
        type: 'success'
      })
      await loadProducts()
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to delete product',
        type: 'error'
      })
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { 
        status: 'Out of Stock', 
        color: 'bg-red-100 text-red-800',
        message: 'Sorry, this product is out of stock due to high demand.'
      }
    } else if (quantity <= 5) {
      return { 
        status: 'Low Stock', 
        color: 'bg-yellow-100 text-yellow-800',
        message: 'Limited stock available'
      }
    }
    return { 
      status: 'In Stock', 
      color: 'bg-green-100 text-green-800',
      message: 'Available'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPage="/dashboard/products">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="/dashboard/products">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <button
              onClick={handleAddProduct}
              className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stockQuantity)
              const images = JSON.parse(product.images || '[]')
              
              return (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Hash className="h-4 w-4 mr-2" />
                        {product.productCode}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        {PRODUCT_TYPES.find(t => t.value === product.type)?.label}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ₹{product.price.toLocaleString()}
                      </div>
                    </div>

                    {product.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">Stock: </span>
                        <span className={`font-medium ${product.stockQuantity === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stockQuantity} units
                        </span>
                      </div>
                      {product.stockQuantity === 0 && (
                        <div className="flex items-center text-red-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span className="text-xs">High Demand</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add/Edit Product Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title={editingProduct ? 'Edit Product' : 'Add New Product'}
            className="max-w-lg"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Code *
                </label>
                <input
                  {...register('productCode')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., SAR001"
                />
                {errors.productCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.productCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., Silk Saree - Red"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select Type</option>
                  {PRODUCT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    {...register('stockQuantity')}
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="0"
                  />
                  {errors.stockQuantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.stockQuantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    {...register('price')}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Product description..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
