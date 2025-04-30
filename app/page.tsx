import Link from "next/link"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

async function getStats() {
  const res = await fetch(`${API_BASE}/api/stats`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

async function getRecentEpisodes() {
  const res = await fetch(`${API_BASE}/api/episodes?limit=5`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch episodes")
  return res.json()
}

async function getRecentReviews() {
  const res = await fetch(`${API_BASE}/api/reviews?limit=5`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

export default async function Home() {
  const [stats, episodes, reviews] = await Promise.all([
    getStats(),
    getRecentEpisodes(),
    getRecentReviews(),
  ])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Episodes Listened
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.total_episodes}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Shows
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.total_shows}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Episodes This Month
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.monthly_stats[0]?.count || 0}
            </dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Recent Episodes
            </h3>
            <div className="mt-4 space-y-4">
              {episodes.map((episode) => (
                <div key={episode.id} className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {episode.name}
                      </h4>
                      <p className="text-sm text-gray-500">{episode.show_name}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(episode.release_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/episodes"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all episodes →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Recent Reviews
            </h3>
            <div className="mt-4 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {review.name}
                      </h4>
                      <p className="text-sm text-gray-500">{review.show_name}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Array(review.rating).fill("★").join("")}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{review.review}</p>
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
      </div>
    </div>
  )
}
