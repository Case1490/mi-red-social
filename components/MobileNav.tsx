'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function MobileNav() {
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setUnread(notifCount ?? 0)

      const { data: msgs } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('read', false)
      setUnreadMessages(new Set(msgs?.map(m => m.sender_id)).size)
    }
    init()
  }, [])

  const links = [
    { href: '/feed', icon: '🏠' },
    { href: '/explore', icon: '🔍' },
    { href: '/messages', icon: '💬', badge: unreadMessages },
    { href: '/notifications', icon: '🔔', badge: unread },
    { href: `/profile/${userId}`, icon: '👤' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-40">
      <div className="flex items-center justify-around px-2 py-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition ${
              pathname === link.href
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            {link.badge && link.badge > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                {link.badge > 9 ? '9+' : link.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  )
}