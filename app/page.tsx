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

async function getRecentEpisodes() {
  // Get episodes from the last 2 days
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  
  // Fetch episodes and listening history
  const [episodesRes, historyRes, reviewsRes] = await Promise.all([
    fetch(`${API_BASE}/api/episodes?limit=50`, { cache: 'no-store' }),
    fetch(`${API_BASE}/api/listening-history`, { cache: 'no-store' }),
    fetch(`${API_BASE}/api/reviews`, { cache: 'no-store' })
  ])

  if (!episodesRes.ok || !historyRes.ok || !reviewsRes.ok) 
    throw new Error("Failed to fetch data")

  const [episodes, history, reviews] = await Promise.all([
    episodesRes.json(),
    historyRes.json(),
    reviewsRes.json()
  ])

  // Create sets for quick lookup
  const listenedEpisodes = new Set(history.map((h: any) => h.episode_id))
  const ratedEpisodes = new Map(reviews.map((r: any) => [r.episode_id, r.rating]))

  // Filter and enrich episodes
  return episodes
    .filter((episode: Episode) => {
      const releaseDate = new Date(episode.release_date)
      const isRecent = releaseDate >= twoDaysAgo
      const isListened = listenedEpisodes.has(episode.id)
      const rating = ratedEpisodes.get(episode.id)
      
      // Only include if:
      // 1. Episode is from last 2 days AND
      // 2. Either not listened to OR not rated
      return isRecent && (!isListened || !rating)
    })
    .map((episode: Episode) => ({
      ...episode,
      listened: listenedEpisodes.has(episode.id),
      rating: ratedEpisodes.get(episode.id),
      image_url: episode.image_url
    }))
}

async function getRecentReviews() {
  const res = await fetch(`${API_BASE}/api/reviews?limit=3`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

export default async function Home() {
  const [stats, episodes, reviews] = await Promise.all([
    getStats(),
    getRecentEpisodes(),
    getRecentReviews(),
  ])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Episodes Listened
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.total_episodes}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Shows
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.total_shows}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Episodes This Month
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.monthly_stats[0]?.count || 0}
            </dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentEpisodes initialEpisodes={episodes} />
        <RecentReviews initialReviews={reviews} />
      </div>
    </div>
  )
}
