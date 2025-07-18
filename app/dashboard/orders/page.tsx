
"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { MockDatabase } from '@/lib/mock-db'
import { Order, OrderStatus } from '@/lib/types'
import { useToast } from '@/components/ui/toaster'
import { Modal } from '@/components/ui/modal'
import { Eye, Edit, Calendar, User, Package, DollarSign, Upload, Truck } from 'lucide-react'

const ORDER_STATUSES: OrderStatus[] = [
  'Payment Received',
  'Packing Under Progress',
  'Packing Completed',
  'Shipped',
  'Delivered'
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPackingModal, setShowPackingModal] = useState(false)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [courierDetails, setCourierDetails] = useState({ company: '', tracking: '' })
  const { addToast } = useToast()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await MockDatabase.getOrders()
      setOrders(data)
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load orders',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      // Handle status-specific actions
      if (newStatus === 'Packing Under Progress') {
        addToast({
          title: 'Quality Inspection',
          description: 'Your item is under quality inspection. We will pack it soon.',
          type: 'success'
        })
      } else if (newStatus === 'Packing Completed') {
        setSelectedOrder(order)
        setShowPackingModal(true)
        return
      } else if (newStatus === 'Shipped') {
        setSelectedOrder(order)
        setShowShippingModal(true)
        return
      } else if (newStatus === 'Delivered') {
        addToast({
          title: 'Item Delivered',
          description: 'Your item has been delivered. You can share your feedback at https://feedback.example.com. If you want to return the item, make sure you took an opening video. Please refer to our return guide: https://returns.example.com/guide',
          type: 'success'
        })
      }

      await MockDatabase.updateOrderStatus(orderId, newStatus)
      await loadOrders()
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update order status',
        type: 'error'
      })
    }
  }

  const handlePackingComplete = async () => {
    if (!selectedOrder) return

    // Simulate image upload
    const imageUrls = Array.from({ length: 3 }, (_, i) => 
      `https://images.unsplash.com/photo-1741171161117-449692a1a948?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D 9)}?w=400&h=400&fit=crop`
    )
    setUploadedImages(imageUrls)

    await MockDatabase.updateOrderStatus(selectedOrder.id, 'Packing Completed')
    await loadOrders()
    
    addToast({
      title: 'Packing Completed',
      description: 'Product images uploaded successfully. Package is ready for shipping.',
      type: 'success'
    })
    
    setShowPackingModal(false)
    setSelectedOrder(null)
  }

  const handleShippingComplete = async () => {
    if (!selectedOrder || !courierDetails.company || !courierDetails.tracking) return

    await MockDatabase.updateOrderStatus(selectedOrder.id, 'Shipped')
    await loadOrders()
    
    const trackingLink = `https://tracking.${courierDetails.company.toLowerCase()}.com/${courierDetails.tracking}`
    
    addToast({
      title: 'Order Shipped',
      description: `Your order has been shipped via ${courierDetails.company}. Track your package: ${trackingLink}`,
      type: 'success'
    })
    
    setShowShippingModal(false)
    setSelectedOrder(null)
    setCourierDetails({ company: '', tracking: '' })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'Payment Received': 'bg-blue-100 text-blue-800',
      'Packing Under Progress': 'bg-yellow-100 text-yellow-800',
      'Packing Completed': 'bg-purple-100 text-purple-800',
      'Shipped': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPage="/dashboard/orders">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="/dashboard/orders">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              <span>{orders.length} Total Orders</span>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{order.customerName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          {ORDER_STATUSES.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ₹{order.totalAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Packing Modal */}
          <Modal
            isOpen={showPackingModal}
            onClose={() => setShowPackingModal(false)}
            title="Upload Packing Images"
            className="max-w-lg"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please upload 3 images: sealed parcel, product inside, and product tag
              </p>
              
              <div className="space-y-3">
                {['Sealed Parcel', 'Product Inside', 'Product Tag'].map((label, index) => (
                  <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">{label}</div>
                      <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                        Choose File
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowPackingModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePackingComplete}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Complete Packing
                </button>
              </div>
            </div>
          </Modal>

          {/* Shipping Modal */}
          <Modal
            isOpen={showShippingModal}
            onClose={() => setShowShippingModal(false)}
            title="Add Shipping Details"
            className="max-w-lg"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courier Company
                </label>
                <select
                  value={courierDetails.company}
                  onChange={(e) => setCourierDetails(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Courier</option>
                  <option value="FedEx">FedEx</option>
                  <option value="DHL">DHL</option>
                  <option value="BlueShipment">Blue Shipment</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="DTDC">DTDC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Truck className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={courierDetails.tracking}
                    onChange={(e) => setCourierDetails(prev => ({ ...prev, tracking: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tracking number"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShippingComplete}
                  disabled={!courierDetails.company || !courierDetails.tracking}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ship Order
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
