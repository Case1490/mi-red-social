'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { use } from 'react'
import PostCard from '@/components/PostCard'
import Avatar from '@/components/Avatar'

type Profile = {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
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

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAll()
  }, [id])

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id ?? null)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (profileData) setProfile(profileData)

    const { data: postsData } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(count), comments(count)')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
    if (postsData) setPosts(postsData as Post[])

    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', id)
    setFollowers(followersCount ?? 0)

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', id)
    setFollowing(followingCount ?? 0)

    if (user && user.id !== id) {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .maybeSingle()
      setIsFollowing(!!data)
    }

    setLoading(false)
  }

  const toggleFollow = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id)
        .eq('following_id', id)
      setFollowers(f => f - 1)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: id,
      })
      setFollowers(f => f + 1)
      setIsFollowing(true)
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-gray-900 rounded-2xl p-8 h-48" />
    </div>
  )

  if (!profile) return (
    <div className="text-center text-gray-500 py-20">Usuario no encontrado</div>
  )

  const isOwnProfile = currentUserId === id

  return (
    <div className="space-y-6">
      {/* Header del perfil */}
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar userId={id} username={profile.username} avatarUrl={profile.avatar_url} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-white">@{profile.username}</h1>
              {profile.full_name && (
                <p className="text-gray-400 text-sm mt-0.5">{profile.full_name}</p>
              )}
              {profile.bio && (
                <p className="text-gray-300 text-sm mt-2 max-w-xs">{profile.bio}</p>
              )}
            </div>
          </div>

          {isOwnProfile ? (

            <Link href="/profile/edit"
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-full transition"
            >
              Editar perfil
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link
                href={`/messages/${id}`}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-full transition"
              >
                💬 Mensaje
              </Link>
              <button
                onClick={toggleFollow}
                className={`text-sm font-medium px-5 py-2 rounded-full transition ${isFollowing
                  ? 'bg-gray-800 hover:bg-red-900/30 hover:text-red-400 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-6 pt-6 border-t border-gray-800">
          <div className="text-center">
            <p className="text-white font-bold text-xl">{posts.length}</p>
            <p className="text-gray-500 text-xs mt-0.5">Posts</p>
          </div>
          <Link href={`/profile/${id}/followers`} className="text-center hover:opacity-80 transition">
            <p className="text-white font-bold text-xl">{followers}</p>
            <p className="text-gray-500 text-xs mt-0.5">Seguidores</p>
          </Link>
          <Link href={`/profile/${id}/following`} className="text-center hover:opacity-80 transition">
            <p className="text-white font-bold text-xl">{following}</p>
            <p className="text-gray-500 text-xs mt-0.5">Siguiendo</p>
          </Link>
        </div>
      </div>

      {/* Posts del usuario */}
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <p className="text-3xl mb-2">📝</p>
          <p>No hay posts todavía</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} onUpdate={loadAll} />
        ))
      )}
    </div>
  )
}