'use client'

import { useState, useEffect } from "react"
import Image from "next/image"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

interface Review {
  id: number
  episode_id: string
  rating: number
  review: string
  timestamp: string
  name: string
  show_name: string
  release_date: string
  image_url?: string
}

interface ShowGroup {
  name: string
  reviews: Review[]
}

type FilterType = 'recent' | 'rating-high' | 'rating-low'

async function getReviews() {
  const res = await fetch(`${API_BASE}/api/reviews`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [shows, setShows] = useState<ShowGroup[]>([])
  const [selectedShow, setSelectedShow] = useState("")
  const [filter, setFilter] = useState<FilterType>('recent')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    getReviews().then(reviews => {
      setReviews(reviews)
      const showMap = reviews.reduce((acc: { [key: string]: Review[] }, review: Review) => {
        if (!acc[review.show_name]) {
          acc[review.show_name] = []
        }
        acc[review.show_name].push(review)
        return acc
      }, {})
      const entries = Object.entries(showMap) as [string, Review[]][]
      const showGroups: ShowGroup[] = entries.map(([name, reviews]) => ({ 
        name, 
        reviews 
      }))
      setShows(showGroups)
    })
  }, [])

  const handleShowChange = (showName: string) => {
    setSelectedShow(showName)
  }

  const filterLabel = {
    'recent': 'Most Recent',
    'rating-high': 'Highest Rating',
    'rating-low': 'Lowest Rating'
  }[filter]

  const filteredReviews = [...(selectedShow ? shows.find(s => s.name === selectedShow)?.reviews || [] : reviews)]
    .filter(review => 
      searchQuery 
        ? review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.show_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.review.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (filter === 'recent') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
      if (filter === 'rating-high') {
        return b.rating - a.rating
      }
      return a.rating - b.rating
    })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Podcast Reviews</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse through all podcast reviews
          </p>
        </div>

        <div className="mt-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedShow}
                onChange={(e) => handleShowChange(e.target.value)}
                className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">All Shows</option>
                {shows.map((show) => (
                  <option key={show.name} value={show.name}>
                    {show.name}
                  </option>
                ))}
              </select>
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span>{filterLabel}</span>
                  <svg
                    className="h-4 w-4 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.59L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <button
                      onClick={() => {
                        setFilter('recent')
                        setIsFilterOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        filter === 'recent'
                          ? 'bg-gray-50 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      Most Recent
                    </button>
                    <button
                      onClick={() => {
                        setFilter('rating-high')
                        setIsFilterOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        filter === 'rating-high'
                          ? 'bg-gray-50 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      Highest Rating
                    </button>
                    <button
                      onClick={() => {
                        setFilter('rating-low')
                        setIsFilterOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        filter === 'rating-low'
                          ? 'bg-gray-50 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      Lowest Rating
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  {review.image_url && (
                    <div className="flex-shrink-0">
                      <Image
                        src={review.image_url}
                        alt={`${review.show_name} - ${review.name}`}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {review.show_name} - {review.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(review.release_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.review && (
                      <p className="mt-4 text-gray-600">{review.review}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 