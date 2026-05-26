'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Conversation = {
  profile: {
    id: string
    username: string
    avatar_url: string | null
  }
  lastMessage: string
  unread: number
  created_at: string
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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    // Traer todos los mensajes donde participas
    const { data: msgs } = await supabase
      .from('messages')
      .select('*, sender:sender_id(id, username, avatar_url), receiver:receiver_id(id, username, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!msgs) return setLoading(false)

    // Agrupar por conversación (el otro usuario)
    const map = new Map<string, Conversation>()
    for (const msg of msgs) {
      const other = msg.sender_id === user.id ? msg.receiver : msg.sender
      if (!other || map.has(other.id)) continue
      const unread = msgs.filter(m =>
        m.sender_id === other.id && m.receiver_id === user.id && !m.read
      ).length
      map.set(other.id, {
        profile: other,
        lastMessage: msg.content,
        unread,
        created_at: msg.created_at,
      })
    }

    setConversations(Array.from(map.values()))
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Mensajes</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-5 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-700 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-4xl mb-3">💬</p>
          <p>No tienes mensajes todavía</p>
          <p className="text-sm mt-1">Ve a un perfil y empieza una conversación</p>
        </div>
      ) : (
        conversations.map(conv => (
          <Link
            key={conv.profile.id}
            href={`/messages/${conv.profile.id}`}
            className="bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 flex items-center gap-4 transition group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
              {conv.profile.avatar_url
                ? <img src={conv.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                : conv.profile.username[0].toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">@{conv.profile.username}</p>
                <span className="text-gray-500 text-xs">{timeAgo(conv.created_at)}</span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{conv.lastMessage}</p>
            </div>
            {conv.unread > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                {conv.unread}
              </span>
            )}
          </Link>
        ))
      )}
    </div>
  )
}