'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PostCard from '@/components/PostCard'
import CreatePost from '@/components/CreatePost'
import Link from 'next/link'

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

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Traer IDs de personas que sigues
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = followingData?.map(f => f.following_id) ?? []

    // Incluir tus propios posts también
    const ids = [...followingIds, user.id]

    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(count), comments(count)')
      .in('user_id', ids)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setPosts(data as Post[])
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={fetchPosts} />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-6 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-1/4" />
                  <div className="h-3 bg-gray-700 rounded w-1/3" />
                </div>
              </div>
              <div className="h-4 bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-4xl mb-3">📭</p>
          <p>No hay posts todavía</p>
          <p className="text-sm mt-1">Sigue a alguien para ver su contenido</p>
          <Link href="/explore" className="text-indigo-400 hover:underline text-sm mt-2 inline-block">
            Explorar usuarios →
          </Link>
        </div>
      ) : (
        posts.map((post, i) => (
          <div key={post.id} style={{ animationDelay: `${i * 60}ms` }}>
            <PostCard post={post} onUpdate={fetchPosts} />
          </div>
        ))
      )}
    </div>
  )
}