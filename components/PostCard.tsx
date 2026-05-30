'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import ImageModal from './ImageModal'
import { toast } from './Toast'
import PostMenu from './PostMenu'
import ConfirmModal from './ConfirmModal'
import EditPostModal from './EditPostModal'
import Avatar from './Avatar'

type Post = {
  id: string
  content: string
  image_url: string | null
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
  likes: { count: number }[]
  comments: { count: number }[]
}

type Comment = {
  id: string
  content: string
  created_at: string
  profiles: { username: string; avatar_url: string | null }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function PostCard({ post, onUpdate }: { post: Post; onUpdate: () => void }) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [modalImage, setModalImage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [localContent, setLocalContent] = useState(post.content)
  const [localImage, setLocalImage] = useState(post.image_url)
  const supabase = createClient()

  const username = post.profiles?.username || 'usuario'
  const avatar = post.profiles?.avatar_url

  useEffect(() => {
    setLikes(post.likes?.[0]?.count ?? 0)
    loadLikedStatus()
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  const loadLikedStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle()
      setLiked(!!data)
    }
  }

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data as Comment[])
  }

  const toggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (liked) {
      await supabase.from('likes').delete()
        .eq('post_id', post.id).eq('user_id', user.id)
      setLikes(l => l - 1)
      setLiked(false)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
      setLikes(l => l + 1)
      setLiked(true)
      toast('❤️ Like')
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('comments').insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim(),
    })

    setNewComment('')
    loadComments()
    toast('💬 Comentario publicado')
  }

  const toggleComments = () => {
    setShowComments(prev => {
      if (!prev) loadComments()
      return !prev
    })
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta publicación?')) return
    setDeleting(true)
    await supabase.from('posts').delete().eq('id', post.id)
    toast('🗑️ Publicación eliminada')
    onUpdate()
  }

  return (
    <>
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition animate-fade-up">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${post.user_id}`}>
            <Avatar userId={post.user_id} username={username} avatarUrl={avatar} size="md" />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${post.user_id}`} className="font-semibold text-white text-sm hover:underline">
                  @{username}
                </Link>
                <span className="text-gray-500 text-xs">{timeAgo(post.created_at)}</span>
              </div>
              {currentUserId === post.user_id && (
                <PostMenu
                  onEdit={() => setEditing(true)}
                  onDelete={() => setShowDeleteModal(true)}
                />
              )}
            </div>
            {localContent && (
              <p className="text-gray-200 text-sm mt-1 leading-relaxed">{localContent}</p>
            )}
          </div>
        </div>

        {/* Imagen */}
        {localImage && (
          <>
            <img
              src={localImage}
              alt="post"
              onClick={() => setModalImage(localImage)}
              className="rounded-xl w-full max-h-96 object-cover mt-2 cursor-zoom-in hover:opacity-95 transition"
            />
            {modalImage && (
              <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
            )}
          </>
        )}

        {/* Acciones */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
          <button
            onClick={toggleLike}
            className={`text-sm flex items-center gap-1.5 transition ${liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}
          >
            {liked ? '❤️' : '🤍'} {likes}
          </button>
          <button
            onClick={toggleComments}
            className="text-sm flex items-center gap-1.5 text-gray-500 hover:text-indigo-400 transition"
          >
            💬 {showComments ? comments.length : (post.comments?.[0]?.count ?? 0)}
          </button>
        </div>

        {/* Comentarios */}
        {showComments && (
          <div className="mt-4 space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 items-start">
                <Avatar userId={c.id} username={c.profiles?.username || ''} avatarUrl={c.profiles?.avatar_url} size="sm" />
                <div className="bg-gray-800 rounded-xl px-3 py-2 text-sm flex-1">
                  <span className="text-indigo-400 font-medium">@{c.profiles?.username} </span>
                  <span className="text-gray-200">{c.content}</span>
                </div>
              </div>
            ))}

            <div className="flex gap-2 mt-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Escribe un comentario..."
                className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleComment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-full transition"
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal eliminar */}
      {showDeleteModal && (
        <ConfirmModal
          title="Eliminar publicación"
          message="¿Estás seguro? Esta acción no se puede deshacer."
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            setShowDeleteModal(false)
            setDeleting(true)
            await supabase.from('posts').delete().eq('id', post.id)
            toast('🗑️ Publicación eliminada')
            onUpdate()
          }}
        />
      )}
      {/* Modo edición */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <EditPostModal
            post={post}
            onClose={() => setEditing(false)}
            onSaved={(newContent, newImage) => {
              setLocalContent(newContent)
              setLocalImage(newImage)
              setEditing(false)
              toast('✏️ Publicación editada')
              onUpdate()
            }}
          />
        </div>
      )}
    </>
  )
}