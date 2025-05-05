import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import PostBox from './PostBox'

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
  likes?: number
  comments?: number
  isLiked?: boolean
}

interface TimelineProps {
  initialReviews: Review[]
  userProfilePic?: string
}

export default function Timeline({ initialReviews, userProfilePic = '/profile.jpg' }: TimelineProps) {
  const [reviews, setReviews] = useState(initialReviews)

  const sortedReviews = [...reviews].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  const handleLike = async (reviewId: number) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          likes: (review.likes || 0) + (review.isLiked ? -1 : 1),
          isLiked: !review.isLiked
        }
      }
      return review
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PostBox userProfilePic={userProfilePic} />
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-12">
          {sortedReviews.map((review) => (
            <div key={review.id} className="flex gap-6">
              <div className="flex-shrink-0 w-32">
                {review.image_url ? (
                  <Image
                    src={review.image_url}
                    alt={review.name}
                    width={128}
                    height={192}
                    className="rounded-md shadow-sm object-cover"
                  />
                ) : (
                  <div className="w-32 h-48 bg-gray-100 rounded-md" />
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-start gap-3 mb-3">
                  <Image
                    src={userProfilePic}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-gray-900 whitespace-nowrap">
                      <span className="font-medium">You</span>
                      <span className="text-gray-500">listened to</span>
                      <h2 className="font-medium truncate max-w-[300px]" title={review.name}>{review.name}</h2>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(review.timestamp))} ago
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="text-yellow-400 text-lg">
                    {'★'.repeat(review.rating)}
                    <span className="text-gray-200">{'★'.repeat(5 - review.rating)}</span>
                  </div>
                  {review.show_name && (
                    <span className="text-gray-500 text-sm">
                      {review.show_name}
                    </span>
                  )}
                </div>

                {review.review && (
                  <p className="text-gray-700 mb-4">{review.review}</p>
                )}

                <div className="flex items-center gap-6 text-gray-500">
                  <button
                    onClick={() => handleLike(review.id)}
                    className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${
                      review.isLiked ? 'text-blue-600' : ''
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>{review.likes || 0}</span>
                  </button>

                  <button className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{review.comments || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 