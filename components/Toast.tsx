'use client'

import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

type ToastData = {
  id: number
  message: string
  type: ToastType
}

let addToastFn: ((message: string, type?: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'success') {
  addToastFn?.(message, type)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    addToastFn = (message, type = 'success') => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }
    return () => { addToastFn = null }
  }, [])

  const icons = { success: '✓', error: '✕', info: 'ℹ' }
  const colors = {
    success: 'bg-gray-900 border-green-500/50 text-green-400',
    error: 'bg-gray-900 border-red-500/50 text-red-400',
    info: 'bg-gray-900 border-indigo-500/50 text-indigo-400',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium animate-slide-in ${colors[t.type]}`}
        >
          <span className="text-base">{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}