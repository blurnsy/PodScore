'use client'

import { useEffect, useState } from 'react'
import Timeline from '../components/Timeline'

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

async function getReviews() {
  const res = await fetch(`${API_BASE}/api/reviews`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

export default function TimelinePage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getReviews()
      .then(reviews => {
        setReviews(reviews)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading reviews...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading reviews: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <Timeline 
        initialReviews={reviews}
        userProfilePic="/profile.jpg"
      />
    </main>
  )
} 