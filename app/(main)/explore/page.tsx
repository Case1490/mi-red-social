'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import Avatar from '@/components/Avatar'

type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

type Post = {
  id: string
  content: string
  image_url: string | null
  created_at: string
  user_id: string
  profiles: { username: string; avatar_url: string | null }
  likes: { count: number }[]
  comments: { count: number }[]
}

export default function ExplorePage() {
  const [tab, setTab] = useState<'users' | 'posts'>('users')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
    loadProfiles('')
    loadPosts('')
  }, [])

  const loadProfiles = async (search: string) => {
    setLoading(true)
    let q = supabase.from('profiles').select('*').limit(20)
    if (search.trim()) q = q.ilike('username', `%${search}%`)
    const { data } = await q
    if (data) setProfiles(data)
    setLoading(false)
  }

  const loadPosts = async (search: string) => {
    setLoading(true)
    let q = supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(count), comments(count)')
      .order('created_at', { ascending: false })
      .limit(30)
    if (search.trim()) q = q.ilike('content', `%${search}%`)
    const { data } = await q
    if (data) setPosts(data as Post[])
    setLoading(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (tab === 'users') loadProfiles(val)
    else loadPosts(val)
  }

  const handleTabChange = (t: 'users' | 'posts') => {
    setTab(t)
    setQuery('')
    if (t === 'users') loadProfiles('')
    else loadPosts('')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Explorar</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => handleTabChange('users')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          👤 Usuarios
        </button>
        <button
          onClick={() => handleTabChange('posts')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'posts'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📝 Posts
        </button>
      </div>

      {/* Buscador */}
      <input
        value={query}
        onChange={handleSearch}
        placeholder={tab === 'users' ? '🔍 Buscar usuarios...' : '🔍 Buscar posts...'}
        className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />

      {/* Resultados */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-5 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'users' ? (
        profiles.filter(p => p.id !== currentUserId).length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <p className="text-3xl mb-2">🔍</p>
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles
              .filter(p => p.id !== currentUserId)
              .map(profile => (
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
                    {profile.bio && (
                      <p className="text-gray-500 text-xs mt-1 truncate">{profile.bio}</p>
                    )}
                  </div>
                  <span className="text-gray-600 group-hover:text-indigo-400 transition text-lg">→</span>
                </Link>
              ))}
          </div>
        )
      ) : (
        posts.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <p className="text-3xl mb-2">📝</p>
            <p>No se encontraron posts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onUpdate={() => loadPosts(query)} />
            ))}
          </div>
        )
      )}
    </div>
  )
}