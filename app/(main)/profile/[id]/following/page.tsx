'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export default function FollowingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [following, setFollowing] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('follows')
        .select('following:following_id(id, username, full_name, avatar_url)')
        .eq('follower_id', id)

      if (data) setFollowing(data.map((d: any) => d.following))
      setLoading(false)
    }
    load()
  }, [id])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/profile/${id}`} className="text-gray-400 hover:text-white transition">←</Link>
        <h1 className="text-xl font-bold text-white">Siguiendo</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-5 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : following.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-4xl mb-3">👤</p>
          <p>Este usuario no sigue a nadie todavía</p>
        </div>
      ) : (
        following.map(profile => (
          <Link
            key={profile.id}
            href={`/profile/${profile.id}`}
            className="bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 flex items-center gap-4 transition group"
          >
            <Avatar userId={profile.id} username={profile.username} avatarUrl={profile.avatar_url} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm group-hover:text-indigo-400 transition">
                @{profile.username}
              </p>
              {profile.full_name && (
                <p className="text-gray-400 text-xs mt-0.5">{profile.full_name}</p>
              )}
            </div>
            <span className="text-gray-600 group-hover:text-indigo-400 transition">→</span>
          </Link>
        ))
      )}
    </div>
  )
}