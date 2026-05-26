'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EditProfilePage() {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setUsername(data.username || '')
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setCurrentAvatar(data.avatar_url || null)
      }
    }
    load()
  }, [])

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let avatar_url = currentAvatar

    if (avatar) {
      const ext = avatar.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      await supabase.storage.from('posts').upload(path, avatar, { upsert: true, contentType: avatar.type })
      const { data } = supabase.storage.from('posts').getPublicUrl(path)
      avatar_url = data.publicUrl + '?t=' + Date.now()
    }

    await supabase.from('profiles').update({
      username,
      full_name: fullName,
      bio,
      avatar_url,
    }).eq('id', user.id)

    setSaved(true)
    setLoading(false)
    setTimeout(() => {
      router.push(`/profile/${user.id}`)
    }, 1000)
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Editar perfil</h1>

      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden cursor-pointer hover:opacity-80 transition flex-shrink-0"
          >
            {preview || currentAvatar
              ? <img src={preview || currentAvatar!} className="w-full h-full object-cover" alt="avatar" />
              : username[0]?.toUpperCase()
            }
          </div>
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition"
            >
              Cambiar foto
            </button>
            <p className="text-gray-500 text-xs mt-1">JPG, PNG o GIF</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>

        {/* Campos */}
        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="@tunombre"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Nombre completo</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              placeholder="Cuéntanos algo sobre ti..."
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || saved}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
        >
          {saved ? '✓ Guardado' : loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}