
"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: 'default' | 'success' | 'error' | 'warning'
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, title, description, type = 'default', duration = 5000, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const typeStyles = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200'
  }

  return (
    <div className={cn(
      "relative flex w-full max-w-md rounded-lg border p-4 shadow-lg",
      typeStyles[type]
    )}>
      <div className="flex-1">
        {title && (
          <div className="text-sm font-medium text-gray-900">{title}</div>
        )}
        {description && (
          <div className="mt-1 text-sm text-gray-600">{description}</div>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
