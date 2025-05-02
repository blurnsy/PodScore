'use client'

import { useState, useEffect } from "react"
import Image from "next/image"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

interface Episode {
  id: string
  name: string
  show_name: string
  image_url?: string
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

interface ShowGroup {
  name: string
  episodes: Episode[]
}

async function getEpisodes() {
  const res = await fetch(`${API_BASE}/api/episodes`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch episodes")
  return res.json()
}

async function getReviews() {
  const res = await fetch(`${API_BASE}/api/reviews`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

export default function AdminReviewsPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [shows, setShows] = useState<ShowGroup[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedShow, setSelectedShow] = useState("")
  const [selectedEpisode, setSelectedEpisode] = useState("")
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getEpisodes().then(episodes => {
      setEpisodes(episodes)
      // Group episodes by show
      const showMap = episodes.reduce((acc: { [key: string]: Episode[] }, episode: Episode) => {
        if (!acc[episode.show_name]) {
          acc[episode.show_name] = []
        }
        acc[episode.show_name].push(episode)
        return acc
      }, {})
      const entries = Object.entries(showMap) as [string, Episode[]][]
      const showGroups: ShowGroup[] = entries.map(([name, episodes]) => ({ 
        name, 
        episodes 
      }))
      setShows(showGroups)
    })
    getReviews().then(setReviews)
  }, [])

  const handleShowChange = (showName: string) => {
    setSelectedShow(showName)
    setSelectedEpisode("")
  }

  const selectedShowEpisodes = shows.find(s => s.name === selectedShow)?.episodes || []
  const selectedEpisodeData = episodes.find(e => e.id === selectedEpisode)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episode_id: selectedEpisode,
          rating,
          review: review.trim(),
        }),
      })

      if (!response.ok) throw new Error("Failed to submit review")
      
      // Refresh reviews
      const newReviews = await getReviews()
      setReviews(newReviews)
      
      // Reset form
      setSelectedEpisode("")
      setSelectedShow("")
      setRating(5)
      setReview("")
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Manage Reviews</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add and manage your podcast reviews
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Add a Review
              </h3>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="show" className="block text-sm font-medium text-gray-700">
                    Show
                  </label>
                  <select
                    id="show"
                    value={selectedShow}
                    onChange={(e) => handleShowChange(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a show</option>
                    {shows.map((show) => (
                      <option key={show.name} value={show.name}>
                        {show.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="episode" className="block text-sm font-medium text-gray-700">
                    Episode
                  </label>
                  <select
                    id="episode"
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                    disabled={!selectedShow}
                  >
                    <option value="">Select an episode</option>
                    {selectedShowEpisodes.map((episode) => (
                      <option key={episode.id} value={episode.id}>
                        {episode.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className={`text-2xl focus:outline-none ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                    Review (Optional)
                  </label>
                  <textarea
                    id="review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedEpisode}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Your Reviews
              </h3>
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4">
                    <div className="flex gap-4">
                      {review.image_url && (
                        <div className="flex-shrink-0">
                          <Image
                            src={review.image_url}
                            alt={review.name}
                            width={64}
                            height={64}
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {review.show_name}
                            </h4>
                            <p className="text-sm text-gray-500">{review.name}</p>
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
                          <p className="mt-1 text-sm text-gray-600">{review.review}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 