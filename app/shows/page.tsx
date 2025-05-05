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
    <div className="min-h-screen bg-gray-50">
      {/* Search Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-center">
            <div className="relative w-[600px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="What do you want to add?"
                className="w-full px-6 py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <svg className={`w-6 h-6 text-gray-400 ${isSearching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((show) => (
                <div key={show.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                  <div className="aspect-square relative">
                    {show.images && show.images[0] ? (
                      <Image
                        src={show.images[0].url}
                        alt={show.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                        </svg>
                      </div>
                    )}
                    <button
                      onClick={() => handleAddShow(show)}
                      disabled={isAddingMap[show.id]}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700">
                        {isAddingMap[show.id] ? "Adding..." : "Add Show"}
                      </span>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{show.name}</h3>
                    <p className="text-sm text-gray-600">{show.publisher}</p>
                    <p className="text-xs text-gray-500 mt-1">{show.total_episodes} episodes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Shows */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your shows</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRefreshAllShows}
                disabled={isGlobalRefreshing || isRefreshing !== null}
                className="text-gray-600 hover:text-gray-900 transition-colors"
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
              <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                Show all
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shows.map((show) => (
              <button
                key={show.id}
                onClick={() => router.push(`/episodes?show_id=${show.id}`)}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow text-left"
              >
                <div className="aspect-square relative">
                  {show.images && show.images[0] ? (
                    <Image
                      src={show.images[0].url}
                      alt={show.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{show.name}</h3>
                  <p className="text-sm text-gray-600">{show.publisher}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {show.total_episodes} episodes
                    {show.last_updated && ` • Updated ${new Date(show.last_updated).toLocaleDateString()}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 