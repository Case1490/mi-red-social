'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useCallback } from 'react'
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
  profiles: { username: string; avatar_url: string | null }
  likes: { count: number }[]
  comments: { count: number }[]
}

const PAGE_SIZE = 10

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchPosts = async (pageNum: number, replace = false) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const ids = [...(followingData?.map(f => f.following_id) ?? []), user.id]

    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(count), comments(count)')
      .in('user_id', ids)
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (!data) return

    if (data.length < PAGE_SIZE) setHasMore(false)

    if (replace) {
      setPosts(data as Post[])
    } else {
      setPosts(prev => [...prev, ...data as Post[]])
    }

    setLoading(false)
    setLoadingMore(false)
  }

  useEffect(() => {
    fetchPosts(0, true)
  }, [])

  // Observer para detectar cuando llega al fondo
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true)
          const nextPage = page + 1
          setPage(nextPage)
          fetchPosts(nextPage)
        }
      },
      { threshold: 0.5 }
    )
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page])

  const handleNewPost = () => {
    setPage(0)
    setHasMore(true)
    fetchPosts(0, true)
  }

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={handleNewPost} />

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
        <>
          {posts.map((post, i) => (
            <div key={post.id} style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
              <PostCard post={post} onUpdate={handleNewPost} />
            </div>
          ))}

          {/* Trigger del scroll infinito */}
          <div ref={bottomRef} className="py-2">
            {loadingMore && (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-gray-900 rounded-2xl p-6 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-700 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                  </div>
                ))}
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <p className="text-center text-gray-600 text-sm py-4">Ya viste todo 👀</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}