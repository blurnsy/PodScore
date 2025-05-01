'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

interface Show {
  id: string
  name: string
  publisher: string
  total_episodes: number
  last_updated?: string
  images?: { url: string; height: number; width: number }[]
}

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Show[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAddingMap, setIsAddingMap] = useState<Record<string, boolean>>({})
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null)
  const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchShows()
  }, [])

  const fetchShows = async () => {
    const res = await fetch(`${API_BASE}/api/shows`)
    if (!res.ok) throw new Error("Failed to fetch shows")
    const data = await res.json()
    setShows(data)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`${API_BASE}/api/shows/search?q=${encodeURIComponent(searchQuery)}`)
      if (!res.ok) throw new Error("Failed to search shows")
      const data = await res.json()
      setSearchResults(data)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddShow = async (show: Show) => {
    setIsAddingMap(prev => ({ ...prev, [show.id]: true }))
    try {
      const res = await fetch(`${API_BASE}/api/shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ show_id: show.id }),
      })
      if (!res.ok) throw new Error("Failed to add show")
      await fetchShows()
      setSearchResults([])
      setSearchQuery("")
    } finally {
      setIsAddingMap(prev => ({ ...prev, [show.id]: false }))
    }
  }

  const handleRefreshShow = async (showId: string) => {
    setIsRefreshing(showId)
    try {
      const res = await fetch(`${API_BASE}/api/shows/${showId}/refresh`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error("Failed to refresh show")
      await fetchShows()
    } finally {
      setIsRefreshing(null)
    }
  }

  const handleRefreshAllShows = async () => {
    setIsGlobalRefreshing(true)
    try {
      await Promise.all(shows.map(show => 
        fetch(`${API_BASE}/api/shows/${show.id}/refresh`, {
          method: 'POST',
        })
      ))
      await fetchShows()
    } finally {
      setIsGlobalRefreshing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Search for Podcast Shows
          </h3>
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a podcast..."
              className="flex-grow rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Search Results</h4>
              <div className="mt-2 space-y-4">
                {searchResults.map((show) => (
                  <div key={show.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-4">
                      {show.images && show.images[0] && (
                        <div className="flex-shrink-0">
                          <Image
                            src={show.images[0].url}
                            alt={show.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">{show.name}</h5>
                        <p className="text-sm text-gray-500">{show.publisher}</p>
                        <p className="text-xs text-gray-400">{show.total_episodes} episodes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddShow(show)}
                      disabled={isAddingMap[show.id]}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isAddingMap[show.id] ? "Adding..." : "Add Show"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Your Podcast Shows
            </h3>
            <button
              onClick={handleRefreshAllShows}
              disabled={isGlobalRefreshing || isRefreshing !== null}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                className={`h-5 w-5 ${isGlobalRefreshing ? 'animate-spin' : ''}`}
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
            {shows.map((show) => (
              <div key={show.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-4">
                  {show.images && show.images[0] && (
                    <div className="flex-shrink-0">
                      <Image
                        src={show.images[0].url}
                        alt={show.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{show.name}</h4>
                    <p className="text-sm text-gray-500">{show.publisher}</p>
                    <p className="text-xs text-gray-400">
                      {show.total_episodes} episodes
                      {show.last_updated && ` • Last updated ${new Date(show.last_updated).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/episodes?show_id=${show.id}`)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    View Episodes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 