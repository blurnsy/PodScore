'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Review {
  id: string
  name: string
  show_name: string
  rating: number
  review?: string
  timestamp: string
  image_url?: string
}

interface RecentReviewsProps {
  initialReviews: Review[]
}

type FilterType = 'recent' | 'rating-high' | 'rating-low'

export default function RecentReviews({ initialReviews }: RecentReviewsProps) {
  const [filter, setFilter] = useState<FilterType>('recent')
  const [reviews] = useState(initialReviews)
  const [isOpen, setIsOpen] = useState(false)

  const sortedReviews = [...reviews].sort((a, b) => {
    if (filter === 'recent') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
    if (filter === 'rating-high') {
      return b.rating - a.rating
    }
    return a.rating - b.rating // rating-low
  })

  const filterLabel = {
    'recent': 'Most Recent',
    'rating-high': 'Highest Rating',
    'rating-low': 'Lowest Rating'
  }[filter]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Reviews
          </h3>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
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
            {isOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <button
                  onClick={() => {
                    setFilter('recent')
                    setIsOpen(false)
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
                    setIsOpen(false)
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
                    setIsOpen(false)
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
        <div className="mt-4 space-y-4">
          {sortedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4">
              <div className="flex gap-4">
                {review.image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={review.image_url}
                      alt={review.name}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {review.name}
                      </h4>
                      <p className="text-sm text-gray-500">{review.show_name}</p>
                      <div className="text-sm text-yellow-400">
                        {'★'.repeat(review.rating)}
                      </div>
                      {review.review && (
                        <p className="mt-1 text-sm text-gray-600">{review.review}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/reviews"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all reviews →
          </Link>
        </div>
      </div>
    </div>
  )
} 