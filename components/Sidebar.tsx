'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Avatar from './Avatar'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null } | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()
      if (profileData) setProfile(profileData)

      // Cargar contadores inmediatamente
      await Promise.all([
        loadUnread(user.id),
        loadUnreadMessages(user.id),
      ])

      const existing = supabase.getChannels().find(c => c.topic === 'realtime:notifications-count')
      if (existing) await supabase.removeChannel(existing)

      const channel = supabase.channel('notifications-count')
      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          setUnread(prev => prev + 1)
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          loadUnread(user.id)
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        }, () => {
          loadUnreadMessages(user.id)
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        }, () => {
          loadUnreadMessages(user.id)
        })
        .subscribe()

      const onRead = () => loadUnreadMessages(user.id)
      window.addEventListener('messages-read', onRead)

      return () => {
        window.removeEventListener('messages-read', onRead)
        supabase.removeChannel(channel)
      }
    }

    init()
  }, [])

  const loadUnread = async (uid: string) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('read', false)
    setUnread(count ?? 0)
  }

  const loadUnreadMessages = async (uid: string) => {
    // Contar conversaciones distintas con mensajes no leídos (no mensajes individuales)
    const { data } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', uid)
      .eq('read', false)

    if (!data) return setUnreadMessages(0)

    // Conversaciones únicas con mensajes no leídos
    const uniqueSenders = new Set(data.map(m => m.sender_id))
    setUnreadMessages(uniqueSenders.size)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/feed', label: 'Feed', icon: '🏠' },
    { href: '/explore', label: 'Explorar', icon: '🔍' },
    { href: '/messages', label: 'Mensajes', icon: '💬', badge: unreadMessages },
    { href: '/notifications', label: 'Notificaciones', icon: '🔔', badge: unread },
    { href: `/profile/${userId}`, label: 'Mi perfil', icon: '👤' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-950 border-r border-gray-800 flex flex-col p-6">
      <h1 className="text-2xl font-bold text-white mb-10">⚡ Nexus</h1>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === link.href
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span className="flex-1">{link.label}</span>
            {link.badge && link.badge > 0 ? (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                {link.badge > 99 ? '99+' : link.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      {userId && profile && (
        <Link
          href={`/profile/${userId}`}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition mb-1"
        >
          <Avatar userId={userId} username={profile.username} avatarUrl={profile.avatar_url} size="sm" />
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">@{profile.username}</p>
          </div>
        </Link>
      )}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all"
      >
        <span className="text-lg">🚪</span>
        Cerrar sesión
      </button>
    </aside>
  )
}