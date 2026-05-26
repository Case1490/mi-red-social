'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

type Post = {
  id: string
  content: string
  image_url: string | null
  user_id: string
}

type Props = {
  post: Post
  onClose: () => void
  onSaved: (newContent: string, newImage: string | null) => void
}

export default function EditPostModal({ post, onClose, onSaved }: Props) {
  const [content, setContent] = useState(post.content || '')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(post.image_url)
  const [removeImage, setRemoveImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setRemoveImage(false)
  }

  const handleRemoveImage = () => {
    setImage(null)
    setPreview(null)
    setRemoveImage(true)
  }

  const handleSave = async () => {
    setLoading(true)

    let image_url = post.image_url

    if (removeImage) {
      image_url = null
    } else if (image) {
      const ext = image.name.split('.').pop()
      const path = `posts/${post.user_id}_${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('posts')
        .upload(path, image, { contentType: image.type })
      if (!error) {
        const { data } = supabase.storage.from('posts').getPublicUrl(path)
        image_url = data.publicUrl
      }
    }

    await supabase
      .from('posts')
      .update({ content: content.trim(), image_url })
      .eq('id', post.id)

    setLoading(false)
    onSaved(content.trim(), image_url ?? null)
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
      <h3 className="text-white font-bold text-lg mb-4">Editar publicación</h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none mb-4"
        placeholder="¿Qué está pasando?"
      />

      {/* Imagen actual o preview */}
      {preview && (
        <div className="relative mb-4">
          <img
            src={preview}
            alt="preview"
            className="rounded-xl w-full max-h-56 object-cover"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2 transition"
        >
          🖼️ {preview ? 'Cambiar imagen' : 'Agregar imagen'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-xl transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={loading || (!content.trim() && !preview)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}