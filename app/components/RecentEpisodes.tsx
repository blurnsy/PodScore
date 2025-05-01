'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import ReviewModal from './ReviewModal'
import Image from 'next/image'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

interface Episode {
  id: string
  name: string
  show_name: string
  release_date: string
  image_url?: string
  images?: { url: string; height: number; width: number }[]
  listened?: boolean
  rating?: number
}

interface EpisodeItemProps {
  episode: Episode
  onUpdate: (updatedEpisode: Episode) => void
}

interface RecentEpisodesProps {
  initialEpisodes: Episode[]
}

export default function RecentEpisodes({ initialEpisodes }: RecentEpisodesProps) {
  const [episodes, setEpisodes] = useState(initialEpisodes)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleEpisodeUpdate = (updatedEpisode: Episode) => {
    // Remove episode if both listened and rated
    if (updatedEpisode.listened && updatedEpisode.rating) {
      setEpisodes(episodes.filter(ep => ep.id !== updatedEpisode.id))
    } else {
      // Otherwise update its state
      setEpisodes(episodes.map(ep => 
        ep.id === updatedEpisode.id ? updatedEpisode : ep
      ))
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch(`${API_BASE}/api/episodes?limit=50`, { cache: 'no-store' })
      if (!res.ok) throw new Error("Failed to fetch episodes")
      const newEpisodes = await res.json()
      
      // Fetch listening history
      const historyRes = await fetch(`${API_BASE}/api/listening-history`, { cache: 'no-store' })
      if (!historyRes.ok) throw new Error("Failed to fetch listening history")
      const history = await historyRes.json()
      const listenedEpisodes = new Set(history.map((h: any) => h.episode_id))
      
      // Fetch ratings
      const ratingsRes = await fetch(`${API_BASE}/api/reviews`, { cache: 'no-store' })
      if (!ratingsRes.ok) throw new Error("Failed to fetch ratings")
      const ratings = await ratingsRes.json()
      const episodeRatings = new Map(ratings.map((r: any) => [r.episode_id, r.rating]))
      
      // Filter and enrich episodes
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      
      const filteredEpisodes = newEpisodes
        .filter((episode: Episode) => {
          const releaseDate = new Date(episode.release_date)
          const isRecent = releaseDate >= twoDaysAgo
          const isListened = listenedEpisodes.has(episode.id)
          const rating = episodeRatings.get(episode.id)
          
          return isRecent && (!isListened || !rating)
        })
        .map((episode: Episode) => ({
          ...episode,
          listened: listenedEpisodes.has(episode.id),
          rating: episodeRatings.get(episode.id),
        }))

      setEpisodes(filteredEpisodes)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (episodes.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Recent Episodes
            </h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            No new episodes to catch up on! 🎉
          </div>
          <div className="mt-4">
            <Link
              href="/episodes"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all episodes →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Episodes
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg
              className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {episodes.map((episode) => (
            <EpisodeItem 
              key={episode.id} 
              episode={episode} 
              onUpdate={handleEpisodeUpdate}
            />
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/episodes"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all episodes →
          </Link>
        </div>
      </div>
    </div>
  )
}

function EpisodeItem({ episode, onUpdate }: EpisodeItemProps) {
  const [isListened, setIsListened] = useState(episode.listened)
  const [rating, setRating] = useState(episode.rating)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const handleMarkAsListened = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/listening-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episode_id: episode.id }),
      })

      if (res.ok) {
        setIsListened(true)
        const updatedEpisode = { ...episode, listened: true }
        onUpdate(updatedEpisode)
      }
    } catch (error) {
      console.error('Error marking episode as listened:', error)
    }
  }

  const handleSubmitReview = async (rating: number, review?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episode_id: episode.id,
          rating,
          review: review?.trim(),
        }),
      })

      if (res.ok) {
        setRating(rating)
        setIsReviewModalOpen(false)
        const updatedEpisode = { ...episode, rating }
        onUpdate(updatedEpisode)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-16 h-16">
            {episode.images?.[0]?.url || episode.image_url ? (
              <Image
                src={episode.images?.[0]?.url || episode.image_url || '/placeholder-podcast.png'}
                alt={episode.show_name}
                width={64}
                height={64}
                className="rounded object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full rounded bg-gray-100 flex items-center justify-center">
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
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {episode.name}
            </h4>
            <p className="text-sm text-gray-500">{episode.show_name}</p>
            <div className="text-sm text-gray-400 mt-1">
              {new Date(episode.release_date).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isListened && (
            <button
              onClick={handleMarkAsListened}
              title="Mark as Listened"
              className="p-2 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {isListened && !rating && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              title="Rate Episode"
              className="p-2 rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {rating && (
            <div className="flex items-center gap-0.5 text-yellow-400">
              {Array.from({ length: rating }).map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
      </div>

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
          showName={episode.show_name}
          episodeName={episode.name}
        />
      )}
    </div>
  )
} 