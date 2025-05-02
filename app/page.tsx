"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import RecentEpisodes from "./components/RecentEpisodes"
import RecentReviews from "./components/RecentReviews"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

interface Episode {
  id: string
  name: string
  show_name: string
  release_date: string
  image_url: string
  listened?: boolean
  rating?: number
}

interface Stats {
  total_episodes: number
  total_shows: number
  monthly_stats: Array<{ month: string; count: number }>
}

interface Review {
  id: string
  name: string
  show_name: string
  rating: number
  review?: string
  timestamp: string
  image_url?: string
}

async function getStats() {
  const res = await fetch(`${API_BASE}/api/stats`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

async function getRecentReviews() {
  const res = await fetch(`${API_BASE}/api/reviews?limit=3`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

function filterAndEnrichEpisodes(episodes: any[], history: any[], reviews: any[]): Episode[] {
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const listenedEpisodes = new Set(history.map((h: any) => h.episode_id))
  const ratedEpisodes = new Map(reviews.map((r: any) => [r.episode_id, r.rating]))
  return episodes
    .filter((episode: Episode) => {
      const releaseDate = new Date(episode.release_date)
      const isRecent = releaseDate >= twoDaysAgo
      const isListened = listenedEpisodes.has(episode.id)
      const rating = ratedEpisodes.get(episode.id)
      return isRecent && (!isListened || !rating)
    })
    .map((episode: Episode) => ({
      ...episode,
      listened: listenedEpisodes.has(episode.id),
      rating: ratedEpisodes.get(episode.id),
      image_url: episode.image_url
    }))
}

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    getStats().then(setStats)
    getRecentReviews().then(setReviews)
    refreshEpisodes()
    // eslint-disable-next-line
  }, [])

  async function refreshEpisodes() {
    console.log('refreshEpisodes called')
    setIsRefreshing(true)
    try {
      const [episodesRes, historyRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/api/episodes?limit=50`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/listening-history`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/reviews`, { cache: 'no-store' })
      ])
      if (!episodesRes.ok || !historyRes.ok || !reviewsRes.ok) return
      const [episodesData, history, reviewsData] = await Promise.all([
        episodesRes.json(),
        historyRes.json(),
        reviewsRes.json()
      ])
      setEpisodes(filterAndEnrichEpisodes(episodesData, history, reviewsData))
    } finally {
      await new Promise(res => setTimeout(res, 1000))
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/episodes" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900">Episodes</h2>
          <p className="mt-2 text-sm text-gray-600">Browse and review episodes</p>
        </Link>
        <Link href="/reviews" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
          <p className="mt-2 text-sm text-gray-600">View all podcast reviews</p>
        </Link>
        <Link href="/reviews/admin" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900">Manage Reviews</h2>
          <p className="mt-2 text-sm text-gray-600">Add and manage your reviews</p>
        </Link>
      </div>
      <div className="mt-12">
        <RecentEpisodes episodes={episodes} onRefresh={refreshEpisodes} isRefreshing={isRefreshing} setEpisodes={setEpisodes} />
      </div>
      <div className="mt-12">
        <RecentReviews initialReviews={reviews} />
      </div>
    </div>
  )
}
