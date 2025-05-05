import Image from 'next/image'
import { useState, useEffect } from 'react'
import ReviewModal from './ReviewModal'
import ShowSearch from './ShowSearch'
import EpisodeSelect from './EpisodeSelect'
import { getUserShows, submitReview } from '../services/api'

interface Show {
  id: string
  name: string
  publisher: string
  total_episodes: number
  images?: { url: string; height: number; width: number }[]
}

interface Episode {
  id: string
  name: string
  release_date: string
  duration_ms: number
}

interface PostBoxProps {
  userProfilePic: string
}

export default function PostBox({ userProfilePic }: PostBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userShows, setUserShows] = useState<Show[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [step, setStep] = useState<'show' | 'episode' | 'review'>('show')

  useEffect(() => {
    async function fetchShows() {
      try {
        setIsLoading(true)
        setError(null)
        const shows = await getUserShows()
        setUserShows(shows)
      } catch (err) {
        setError('Failed to load your shows')
        console.error('Error fetching shows:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShows()
  }, [])

  const handleShowSelect = (show: Show) => {
    setSelectedShow(show)
    setStep('episode')
  }

  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode)
    setStep('review')
    setIsModalOpen(true)
  }

  const handleSubmit = async (rating: number, review?: string) => {
    if (!selectedEpisode) return

    try {
      setError(null)
      await submitReview({ 
        episode_id: selectedEpisode.id, 
        rating, 
        review 
      })
      setIsModalOpen(false)
      setStep('show')
      setSelectedShow(null)
      setSelectedEpisode(null)
    } catch (err) {
      setError('Failed to submit review')
      console.error('Error submitting review:', err)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setStep('show')
    setSelectedShow(null)
    setSelectedEpisode(null)
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex gap-3 items-center">
        <div className="flex-shrink-0">
          <Image
            src={userProfilePic}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full w-10 h-10"
          />
        </div>
        <div className="flex-grow">
          <h2 className="text-xl text-gray-700">What have you been watching?</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading || userShows.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Log'}
        </button>
      </div>

      {isModalOpen && step === 'show' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Show</h3>
            <ShowSearch onShowSelect={handleShowSelect} userShows={userShows} />
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && step === 'episode' && selectedShow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select an Episode</h3>
            <EpisodeSelect showId={selectedShow.id} onEpisodeSelect={handleEpisodeSelect} />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setStep('show')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ReviewModal 
        isOpen={isModalOpen && step === 'review'}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        showName={selectedShow?.name}
        episodeName={selectedEpisode?.name}
      />
    </div>
  )
} 