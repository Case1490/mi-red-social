'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username })

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
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-2xl">⚡</span>
          <span className="text-white font-bold text-xl">Nexus</span>
        </div>
        <Link
          href="/login"
          className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
        >
          Iniciar sesión
        </Link>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-10 gap-10">

        {/* Texto izquierda */}
        {/* Texto */}
        <div className="w-full flex-1 max-w-xl text-center lg:text-left">
          
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Conecta con el{' '}
            <span className="text-indigo-400">mundo</span>{' '}
            que te importa
          </h1>
          <p className="text-gray-400 text-base lg:text-lg leading-relaxed mb-8">
            Publica, comenta, sigue a personas interesantes y chatea en tiempo real.
          </p>
          <div className="flex flex-col gap-3 items-center lg:items-start">
            {[
              { icon: '📝', text: 'Publica fotos y textos' },
              { icon: '💬', text: 'Mensajes directos en tiempo real' },
              { icon: '🔔', text: 'Notificaciones instantáneas' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-gray-300 text-sm">
                <span>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Formulario derecha */}
        <div className="w-full lg:max-w-md lg:shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Crear cuenta gratis</h2>
            <p className="text-gray-400 text-sm mb-6">Únete a la comunidad hoy</p>

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
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="@tunombre"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition text-sm"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
              </button>
            </div>

            <p className="text-gray-500 text-xs text-center mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-indigo-400 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}