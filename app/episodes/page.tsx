'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import ReviewModal from "../components/ReviewModal"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

interface Episode {
  id: string
  name: string
  show_name: string
  show_id: string
  release_date: string
  duration_ms: number
  description: string
  images?: { url: string; height: number; width: number }[]
  listened?: boolean
  rating?: number
}

interface Show {
  id: string
  name: string
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [shows, setShows] = useState<Show[]>([])
  const [selectedShow, setSelectedShow] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchShows()
    const showId = searchParams.get('show_id')
    if (showId) {
      fetchEpisodes(showId)
    } else {
      fetchEpisodes()
    }
  }, [searchParams])

  const fetchShows = async () => {
    const res = await fetch(`${API_BASE}/api/shows`)
    if (!res.ok) throw new Error("Failed to fetch shows")
    const data = await res.json()
    setShows(data)
  }

  const fetchEpisodes = async (showId?: string) => {
    setIsLoading(true)
    try {
      const url = showId 
        ? `${API_BASE}/api/episodes?show_id=${showId}`
        : `${API_BASE}/api/episodes`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch episodes")
      const data = await res.json()
      
      // Fetch listening history
      const historyRes = await fetch(`${API_BASE}/api/listening-history`)
      if (!historyRes.ok) throw new Error("Failed to fetch listening history")
      const history = await historyRes.json()
      const listenedEpisodes = new Set(history.map((h: any) => h.episode_id))
      
      // Fetch ratings
      const ratingsRes = await fetch(`${API_BASE}/api/reviews`)
      if (!ratingsRes.ok) throw new Error("Failed to fetch ratings")
      const ratings = await ratingsRes.json()
      const episodeRatings = new Map(ratings.map((r: any) => [r.episode_id, r.rating]))
      
      // Mark episodes as listened and add ratings
      setEpisodes(data.map((episode: Episode) => ({
        ...episode,
        listened: listenedEpisodes.has(episode.id),
        rating: episodeRatings.get(episode.id)
      })))
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsListened = async (episodeId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/listening-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episode_id: episodeId }),
      })
      if (!res.ok) throw new Error("Failed to mark episode as listened")
      
      // Update local state
      setEpisodes(episodes.map(episode => 
        episode.id === episodeId 
          ? { ...episode, listened: true }
          : episode
      ))
    } catch (error) {
      console.error("Error marking episode as listened:", error)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return hours > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${minutes}m`
  }

  const filteredEpisodes = searchQuery
    ? episodes.filter(episode => 
        episode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : episodes

  const handleReview = (episode: Episode) => {
    setSelectedEpisode(episode)
    setIsReviewModalOpen(true)
  }

  const handleSubmitReview = async (rating: number, review: string) => {
    if (!selectedEpisode) return

    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        episode_id: selectedEpisode.id,
        rating,
        review: review.trim(),
      }),
    })

    if (!res.ok) throw new Error("Failed to submit review")
    
    // Update local state with the new rating
    setEpisodes(episodes.map(episode => 
      episode.id === selectedEpisode.id
        ? { ...episode, rating }
        : episode
    ))
  }

  // Add this helper function for rendering stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {Array(rating).fill("★").join("")}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Podcast Episodes
            </h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search episodes..."
                className="w-96 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="mt-4 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {filteredEpisodes.map((episode) => (
                <div key={episode.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16">
                      {episode.images && episode.images[0] ? (
                        <Image
                          src={episode.images[0].url}
                          alt={episode.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-md bg-gray-100 flex items-center justify-center">
                          <svg
                            className="h-8 w-8 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {episode.name}
                            {episode.listened && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Finished ✅
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">{episode.show_name}</p>
                          <p className="text-xs text-gray-400">
                            {formatDuration(episode.duration_ms)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-gray-500">
                            {new Date(episode.release_date).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            {!episode.listened && (
                              <button
                                onClick={() => handleMarkAsListened(episode.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Mark as Listened
                              </button>
                            )}
                            {episode.listened && !episode.rating && (
                              <button
                                onClick={() => handleReview(episode)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                Rate Episode
                              </button>
                            )}
                            {episode.rating && (
                              <div className="text-sm text-yellow-400">
                                {renderStars(episode.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {episode.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEpisode && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false)
            setSelectedEpisode(null)
          }}
          onSubmit={handleSubmitReview}
          showName={selectedEpisode.show_name}
          episodeName={selectedEpisode.name}
        />
      )}
    </div>
  )
} 