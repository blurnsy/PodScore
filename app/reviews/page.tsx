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

async function getReviews() {
  const res = await fetch(`${API_BASE}/api/reviews`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [shows, setShows] = useState<ShowGroup[]>([])
  const [selectedShow, setSelectedShow] = useState("")

  useEffect(() => {
    getReviews().then(reviews => {
      setReviews(reviews)
      // Group reviews by show
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

  const selectedShowReviews = shows.find(s => s.name === selectedShow)?.reviews || []

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
          <div className="mb-4">
            <label htmlFor="show" className="block text-sm font-medium text-gray-700">
              Filter by Show
            </label>
            <select
              id="show"
              value={selectedShow}
              onChange={(e) => handleShowChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Shows</option>
              {shows.map((show) => (
                <option key={show.name} value={show.name}>
                  {show.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {(selectedShow ? selectedShowReviews : reviews).map((review) => (
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