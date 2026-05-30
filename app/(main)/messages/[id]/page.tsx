'use client'

import { useEffect, useState, useRef, use } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

type Message = {
  id: string
  content: string
  sender_id: string
  receiver_id: string
  created_at: string
  read: boolean
}

type Profile = {
  id: string
  username: string
  avatar_url: string | null
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: otherId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<ReturnType<typeof createClient> | null>(null)
  const userIdRef = useRef<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !mounted) return

      userIdRef.current = user.id
      setCurrentUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .single()
      if (profile && mounted) setOtherProfile(profile)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (data && mounted) {
        setMessages(data)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', otherId)
        .eq('receiver_id', user.id)

      // Avisar al sidebar que se leyeron los mensajes
      window.dispatchEvent(new Event('messages-read'))

      // Crear canal con nombre único
      const channelName = `chat-${[user.id, otherId].sort().join('-')}`
      const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`)
      if (existing) supabase.removeChannel(existing)

      const channel = supabase.channel(channelName)
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if (!mounted) return
          const msg = payload.new as Message
          const uid = userIdRef.current
          const isRelevant =
            (msg.sender_id === uid && msg.receiver_id === otherId) ||
            (msg.sender_id === otherId && msg.receiver_id === uid)
          if (isRelevant) {
            setMessages(prev => [...prev, msg])
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
          }
        })
        .subscribe()
    }

    init()

    return () => {
      mounted = false
      const channelName = `chat-${otherId}`
      const existing = supabase.getChannels().find(c => c.topic.includes(otherId))
      if (existing) supabase.removeChannel(existing)
    }
  }, [otherId])

  const sendMessage = async () => {
    if (!input.trim() || !currentUserId) return
    const content = input.trim()
    setInput('')
    await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: otherId,
      content,
    })
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-800">
        <Link href="/messages" className="text-gray-400 hover:text-white transition">←</Link>
        <Avatar userId={otherId} username={otherProfile?.username || ''} avatarUrl={otherProfile?.avatar_url} size="sm" />
        <Link href={`/profile/${otherId}`} className="font-semibold text-white hover:text-indigo-400 transition text-sm">
          @{otherProfile?.username}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMine
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-indigo-300' : 'text-gray-500'}`}>
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 pt-4 mt-4 border-t border-gray-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-5 py-3 rounded-full transition text-sm font-medium"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}