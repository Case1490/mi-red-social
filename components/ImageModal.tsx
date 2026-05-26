'use client'

import { useEffect } from 'react'

export default function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-gray-800/80 hover:bg-gray-700 rounded-full w-9 h-9 flex items-center justify-center text-lg transition"
      >
        ✕
      </button>
      <img
        src={src}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl"
        alt="imagen"
      />
    </div>
  )
}