'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from './Toast'

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!content.trim() && !image) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let image_url = null

    if (image) {
      const ext = image.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('posts').upload(path, image)
      if (!error) {
        const { data } = supabase.storage.from('posts').getPublicUrl(path)
        image_url = data.publicUrl
      }
    }

    await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim(),
      image_url,
    })

    setContent('')
    setImage(null)
    setPreview(null)
    setLoading(false)

    toast('🚀 Publicación creada')
    onPostCreated()
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué está pasando?"
        rows={3}
        className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm"
      />

      {preview && (
        <div className="relative mt-3">
          <img src={preview} alt="preview" className="rounded-xl max-h-64 object-cover w-full" />
          <button
            onClick={() => { setImage(null); setPreview(null) }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black"
          >✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
        <button
          onClick={() => fileRef.current?.click()}
          className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2 transition"
        >
          🖼️ Imagen
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

        <button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && !image)}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-full transition"
        >
          {loading ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}