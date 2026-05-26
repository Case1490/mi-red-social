'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

type Notification = {
  id: string
  type: 'like' | 'comment' | 'follow' | 'message'
  read: boolean
  created_at: string
  post_id: string | null
  actor: {
    id: string
    username: string
    avatar_url: string | null
  }
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

const notifText = (type: string) => {
  switch (type) {
    case 'like': return 'le dio like a tu post'
    case 'comment': return 'comentó tu post'
    case 'follow': return 'empezó a seguirte'
    case 'message': return 'te envió un mensaje'
    default: return 'interactuó contigo'
  }
}

const notifIcon = (type: string) => {
  switch (type) {
    case 'like': return '❤️'
    case 'comment': return '💬'
    case 'follow': return '👤'
    case 'message': return '✉️'
    default: return '🔔'
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(id, username, avatar_url)')
      .eq('user_id', user.id)
      .neq('type', 'message')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setNotifications(data as Notification[])

    // Marcar todas como leídas
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-white mb-6">Notificaciones</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-5 animate-pulse flex gap-4">
              <div className="w-10 h-10 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-4xl mb-3">🔔</p>
          <p>No tienes notificaciones todavía</p>
        </div>
      ) : (
        notifications.map(notif => (
          <Link
            key={notif.id}
            href={
              notif.type === 'follow' ? `/profile/${notif.actor.id}` :
              notif.type === 'message' ? `/messages/${notif.actor.id}` :
              `/feed`
            }
            className={`flex items-center gap-4 p-4 rounded-2xl border transition ${
              !notif.read
                ? 'bg-indigo-950/40 border-indigo-500/30 hover:border-indigo-500/60'
                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
                {notif.actor?.avatar_url
                  ? <img src={notif.actor.avatar_url} className="w-full h-full object-cover" alt="" />
                  : notif.actor?.username[0].toUpperCase()
                }
              </div>
              <span className="absolute -bottom-1 -right-1 text-sm">
                {notifIcon(notif.type)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200">
                <span className="font-semibold text-white">@{notif.actor?.username}</span>
                {' '}{notifText(notif.type)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{timeAgo(notif.created_at)}</p>
            </div>
            {!notif.read && (
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
            )}
          </Link>
        ))
      )}
    </div>
  )
}