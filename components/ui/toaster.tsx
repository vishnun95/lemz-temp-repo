
"use client"

import * as React from "react"
import { Toast } from "./toast"

export interface ToastData {
  id: string
  title?: string
  description?: string
  type?: 'default' | 'success' | 'error' | 'warning'
  duration?: number
}

interface ToasterContextType {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToasterContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error('useToast must be used within a ToasterProvider')
  }
  return context
}
