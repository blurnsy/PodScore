'use client'

import React, { useState } from 'react'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, review?: string) => void
  showName?: string
  episodeName?: string
  episodeImageUrl?: string
}

export default function ReviewModal({ isOpen, onClose, onSubmit, showName, episodeName, episodeImageUrl }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(rating, review)
    setRating(0)
    setReview('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col items-center">
            {episodeImageUrl && (
              <img
                src={episodeImageUrl}
                alt={episodeName || 'Episode'}
                className="w-24 h-24 object-cover rounded mb-2 border border-gray-200 bg-gray-100"
                onError={e => (e.currentTarget.src = '/placeholder-podcast.png')}
              />
            )}
            {showName && <div className="font-medium mb-1 text-center">{showName}</div>}
            {episodeName && <div className="text-gray-600 text-sm mb-4 text-center">{episodeName}</div>}
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review (optional)"
              className="w-full h-32 p-2 border rounded-lg resize-none text-gray-900 bg-white"
            />
          </div>

          <div className="flex justify-between gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rating === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 