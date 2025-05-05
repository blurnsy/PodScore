'use client'

import { useState } from 'react'

interface Show {
  id: string
  name: string
  publisher: string
  total_episodes: number
  images?: { url: string; height: number; width: number }[]
}

interface ShowSearchProps {
  onShowSelect: (show: Show) => void
  userShows: Show[]
}

export default function ShowSearch({ onShowSelect, userShows }: ShowSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredShows, setFilteredShows] = useState<Show[]>([])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setFilteredShows([])
      return
    }
    
    const filtered = userShows.filter(show => 
      show.name.toLowerCase().includes(term.toLowerCase()) ||
      show.publisher.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredShows(filtered)
  }

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search your shows..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
        
        {searchTerm.trim() !== '' && filteredShows.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredShows.map(show => (
              <button
                key={show.id}
                onClick={() => onShowSelect(show)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <div className="font-medium text-gray-900">{show.name}</div>
                <div className="text-sm text-gray-500">{show.publisher}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 