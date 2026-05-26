'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (!error) {
      setDone(true)
      setTimeout(() => router.push('/feed'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Nueva contraseña</h1>
        <p className="text-gray-400 mb-6">Elige una contraseña segura</p>

        {done ? (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-4 rounded-lg text-sm text-center">
            ✓ Contraseña actualizada, redirigiendo...
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button
              onClick={handleReset}
              disabled={loading || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}