'use client'

type Props = {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}