'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async () => {
  setLoading(true)
  setError('')

  // 1. Crear el usuario en auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    setError(signUpError.message)
    setLoading(false)
    return
  }

  // 2. Crear el perfil manualmente
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: username || email.split('@')[0],
      })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }
  }

  router.push('/feed')
  router.refresh()
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Crear cuenta</h1>
        <p className="text-gray-400 mb-6">Únete a la comunidad</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="@tunombre"
            />
          </div>
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
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </div>

        <p className="text-gray-400 text-sm text-center mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}