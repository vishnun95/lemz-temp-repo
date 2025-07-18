
"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { MockDatabase } from '@/lib/mock-db'
import { Coupon, CouponUsage } from '@/lib/types'
import { useToast } from '@/components/ui/toaster'
import { Modal } from '@/components/ui/modal'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Percent, 
  Calendar, 
  Users, 
  DollarSign, 
  ToggleLeft, 
  ToggleRight,
  BarChart3,
  TrendingUp
} from 'lucide-react'

const couponSchema = yup.object({
  code: yup.string().required('Coupon code is required').min(3, 'Code must be at least 3 characters'),
  discountType: yup.string().required('Discount type is required'),
  discountValue: yup.number().min(0, 'Discount value must be positive').required('Discount value is required'),
  startDate: yup.string().required('Start date is required'),
  expiryDate: yup.string().required('Expiry date is required'),
  minOrderValue: yup.number().min(0, 'Minimum order value must be non-negative'),
  maxUsageCount: yup.number().min(1, 'Max usage count must be at least 1').required('Max usage count is required'),
})

type CouponFormData = yup.InferType<typeof couponSchema>

const DISCOUNT_TYPES = [
  { value: 'flat', label: 'Flat Amount (₹)' },
  { value: 'percentage', label: 'Percentage (%)' },
]

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUsageModal, setShowUsageModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CouponFormData>({
    resolver: yupResolver(couponSchema),
  })

  const discountType = watch('discountType')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [couponsData, usagesData] = await Promise.all([
        MockDatabase.getCoupons(),
        MockDatabase.getCouponUsages()
      ])
      setCoupons(couponsData)
      setCouponUsages(usagesData)
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to load coupon data',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCoupon = () => {
    reset()
    setEditingCoupon(null)
    setShowAddModal(true)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setValue('code', coupon.code)
    setValue('discountType', coupon.discountType)
    setValue('discountValue', coupon.discountValue)
    setValue('startDate', new Date(coupon.startDate).toISOString().split('T')[0])
    setValue('expiryDate', new Date(coupon.expiryDate).toISOString().split('T')[0])
    setValue('minOrderValue', coupon.minOrderValue || 0)
    setValue('maxUsageCount', coupon.maxUsageCount)
    setEditingCoupon(coupon)
    setShowAddModal(true)
  }

  const onSubmit = async (data: CouponFormData) => {
    setSubmitting(true)
    try {
      const couponData = {
        ...data,
        startDate: new Date(data.startDate),
        expiryDate: new Date(data.expiryDate),
        currentUsage: editingCoupon?.currentUsage || 0,
        isActive: editingCoupon?.isActive ?? true,
      }

      if (editingCoupon) {
        await MockDatabase.updateCoupon(editingCoupon.id, couponData)
        addToast({
          title: 'Success',
          description: 'Coupon updated successfully',
          type: 'success'
        })
      } else {
        await MockDatabase.createCoupon(couponData)
        addToast({
          title: 'Success',
          description: 'Coupon created successfully',
          type: 'success'
        })
      }

      await loadData()
      setShowAddModal(false)
      reset()
      setEditingCoupon(null)
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to save coupon',
        type: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await MockDatabase.updateCoupon(coupon.id, { isActive: !coupon.isActive })
      addToast({
        title: 'Success',
        description: `Coupon ${!coupon.isActive ? 'activated' : 'deactivated'} successfully`,
        type: 'success'
      })
      await loadData()
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update coupon status',
        type: 'error'
      })
    }
  }

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) return

    try {
      await MockDatabase.deleteCoupon(coupon.id)
      addToast({
        title: 'Success',
        description: 'Coupon deleted successfully',
        type: 'success'
      })
      await loadData()
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to delete coupon',
        type: 'error'
      })
    }
  }

  const handleViewUsage = (couponCode: string) => {
    setSelectedCouponCode(couponCode)
    setShowUsageModal(true)
  }

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.isActive) return 'bg-gray-100 text-gray-800'
    if (new Date() > new Date(coupon.expiryDate)) return 'bg-red-100 text-red-800'
    if (coupon.currentUsage >= coupon.maxUsageCount) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive) return 'Inactive'
    if (new Date() > new Date(coupon.expiryDate)) return 'Expired'
    if (coupon.currentUsage >= coupon.maxUsageCount) return 'Fully Used'
    return 'Active'
  }

  const filteredUsages = couponUsages.filter(usage => usage.couponCode === selectedCouponCode)

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPage="/dashboard/coupons">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="/dashboard/coupons">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
            <button
              onClick={handleAddCoupon}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </button>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 text-purple-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                            {coupon.minOrderValue && (
                              <div className="text-xs text-gray-500">
                                Min: ₹{coupon.minOrderValue}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.discountType === 'flat' 
                            ? `₹${coupon.discountValue}` 
                            : `${coupon.discountValue}%`
                          }
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {coupon.discountType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">
                            {coupon.currentUsage} / {coupon.maxUsageCount}
                          </div>
                          <button
                            onClick={() => handleViewUsage(coupon.code)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(coupon.currentUsage / coupon.maxUsageCount) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <div>
                            <div>{new Date(coupon.startDate).toLocaleDateString()}</div>
                            <div>to {new Date(coupon.expiryDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon)}`}>
                          {getStatusText(coupon)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCoupon(coupon)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className={`${coupon.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {coupon.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add/Edit Coupon Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            className="max-w-lg"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  {...register('code')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., WELCOME10"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  {...register('discountType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Discount Type</option>
                  {DISCOUNT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.discountType && (
                  <p className="mt-1 text-sm text-red-600">{errors.discountType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value * {discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  {...register('discountValue')}
                  type="number"
                  min="0"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  max={discountType === 'percentage' ? '100' : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
                {errors.discountValue && (
                  <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    {...register('expiryDate')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Value (₹)
                  </label>
                  <input
                    {...register('minOrderValue')}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Usage Count *
                  </label>
                  <input
                    {...register('maxUsageCount')}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="100"
                  />
                  {errors.maxUsageCount && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxUsageCount.message}</p>
                  )}
                </div>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </Modal>

          {/* Usage Report Modal */}
          <Modal
            isOpen={showUsageModal}
            onClose={() => setShowUsageModal(false)}
            title={`Usage Report: ${selectedCouponCode}`}
            className="max-w-2xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">
                    Total Usage: {filteredUsages.length} times
                  </span>
                </div>
                <div className="text-sm text-purple-600">
                  Total Saved: ₹{filteredUsages.reduce((sum, usage) => sum + (usage.orderAmount * 0.1), 0).toLocaleString()}
                </div>
              </div>

              {filteredUsages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Customer
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Order Amount
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Used Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsages.map((usage) => (
                        <tr key={usage.id}>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{usage.customerName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-900">₹{usage.orderAmount.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-sm text-gray-500">
                              {new Date(usage.usedAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No usage data found for this coupon.</p>
                </div>
              )}
            </div>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
