const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

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
  show_name: string
  description: string
  images?: { url: string; height: number; width: number }[]
}

interface ApiError {
  message: string
  status: number
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'An error occurred')
  }
  return response.json()
}

export async function getUserShows(): Promise<Show[]> {
  const response = await fetch(`${API_BASE}/api/shows`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return handleResponse<Show[]>(response)
}

export async function getShowEpisodes(showId: string, limit: number = 5): Promise<Episode[]> {
  const response = await fetch(`${API_BASE}/api/episodes?show_id=${showId}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return handleResponse<Episode[]>(response)
}

export async function addShowToLibrary(showId: string): Promise<void> {
  const response = await fetch('/api/shows/library', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ showId }),
  })
  return handleResponse<void>(response)
}

export async function submitReview({ episode_id, rating, review }: { episode_id: string; rating: number; review?: string }): Promise<void> {
  const response = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ episode_id, rating, review }),
  })
  return handleResponse<void>(response)
} 