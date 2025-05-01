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

export default function RecentReviews({ initialReviews }: RecentReviewsProps) {
  const [reviews] = useState(initialReviews)

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Recent Reviews
        </h3>
        <div className="mt-4 space-y-4">
          {reviews.map((review) => (
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