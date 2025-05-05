'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getShowEpisodes } from '../services/api'

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

interface EpisodeSelectProps {
  showId: string
  onEpisodeSelect: (episode: Episode) => void
}

export default function EpisodeSelect({ showId, onEpisodeSelect }: EpisodeSelectProps) {
  const router = useRouter()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchEpisodes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedEpisodes = await getShowEpisodes(showId, 5)
      setEpisodes(fetchedEpisodes)
    } catch (err) {
      setError('Failed to load episodes')
      console.error('Error fetching episodes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEpisodes()
  }, [showId])

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return hours > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${minutes}m`
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading episodes...</div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No episodes found</div>
        ) : (
          <>
            {episodes.map(episode => (
              <button
                key={episode.id}
                onClick={() => onEpisodeSelect(episode)}
                className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center gap-4">
                  {episode.images?.[0]?.url && (
                    <img 
                      src={episode.images[0].url} 
                      alt={episode.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {episode.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDuration(episode.duration_ms)} • {new Date(episode.release_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {episodes.length === 5 && (
              <button
                onClick={() => router.push(`/episodes?show_id=${showId}`)}
                className="w-full mt-4 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All Episodes
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
} 