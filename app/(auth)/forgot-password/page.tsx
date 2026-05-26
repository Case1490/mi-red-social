'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">¿Olvidaste tu contraseña?</h1>
        <p className="text-gray-400 mb-6">Te enviamos un enlace para restablecerla</p>

        {sent ? (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-4 rounded-lg text-sm text-center">
            ✓ Revisa tu correo, te enviamos el enlace
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tu@email.com"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
        )}

        <p className="text-gray-400 text-sm text-center mt-6">
          <Link href="/login" className="text-indigo-400 hover:underline">← Volver al login</Link>
        </p>
      </div>
    </div>
  )
}