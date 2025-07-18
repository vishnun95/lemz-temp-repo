
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { useToast } from '@/components/ui/toaster'
import {
  Package,
  ShoppingCart,
  Percent,
  LogOut,
  Menu,
  X,
  Store,
  Bell
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
}

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()

  const user = AuthService.getCurrentUser()

  const handleLogout = () => {
    AuthService.logout()
    addToast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
      type: 'success',
    })
    router.push('/login')
  }

  const navigation = [
    { name: 'Order Listing', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Product Management', href: '/dashboard/products', icon: Package },
    { name: 'Coupon Management', href: '/dashboard/coupons', icon: Percent },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-pink-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Lemz Attire Stories</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.href
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${isActive ? 'bg-pink-50 text-pink-700 border-r-4 border-pink-600' : 'text-gray-700'
                    }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              )
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="flex items-center p-4 border-b">
          <Store className="h-8 w-8 text-pink-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">Lemz Attire Stories</span>
        </div>
        <nav className="mt-8">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.href
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${isActive ? 'bg-pink-50 text-pink-700 border-r-4 border-pink-600' : 'text-gray-700'
                  }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            )
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900 lg:ml-0">
                {navigation.find(item => item.href === currentPage)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
