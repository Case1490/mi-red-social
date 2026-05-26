'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  onEdit: () => void
  onDelete: () => void
}

export default function PostMenu({ onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="text-gray-500 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 w-40 overflow-hidden">
          <button
            onClick={() => { onEdit(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 transition"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition"
          >
            🗑️ Eliminar
          </button>
        </div>
      )}
    </div>
  )
}