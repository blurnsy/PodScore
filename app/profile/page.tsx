"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import RecentEpisodes from "../components/RecentEpisodes"
import RecentReviews from "../components/RecentReviews"
import ProfileHeader from "../components/ProfileHeader"
import ProfileNavigation from "../components/ProfileNavigation"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5328"

interface Episode {
  id: string
  name: string
  show_name: string
  release_date: string
  image_url: string
  listened?: boolean
  rating?: number
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

interface Stats {
  podcastsListened: number
  following: number
  followers: number
}

async function getStats() {
  const res = await fetch(`${API_BASE}/api/stats`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

async function getRecentReviews() {
  const res = await fetch(`${API_BASE}/api/reviews?limit=3`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Failed to fetch reviews")
  return res.json()
}

export default function ProfilePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    getStats().then(setStats)
    getRecentReviews().then(setReviews)
    refreshEpisodes()
  }, [])

  async function refreshEpisodes() {
    console.log('refreshEpisodes called')
    setIsRefreshing(true)
    try {
      const [episodesRes, historyRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/api/episodes?limit=50`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/listening-history`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/reviews`, { cache: 'no-store' })
      ])
      if (!episodesRes.ok || !historyRes.ok || !reviewsRes.ok) return
      const [episodesData, history, reviewsData] = await Promise.all([
        episodesRes.json(),
        historyRes.json(),
        reviewsRes.json()
      ])
      setEpisodes(filterAndEnrichEpisodes(episodesData, history, reviewsData))
    } finally {
      await new Promise(res => setTimeout(res, 1000))
      setIsRefreshing(false)
    }
  }

  const handleEditProfile = () => {
    console.log('Edit profile clicked - implement modal or navigation')
  }

  const handleShareProfile = () => {
    console.log('Share profile clicked - implement share dialog')
  }

  const handleOpenSettings = () => {
    console.log('Settings clicked - implement settings page navigation')
  }

  const socialStats = {
    following: 247,
    followers: 182
  }

  return (
    <div className="space-y-8">
      <ProfileHeader 
        username="Brett Burns"
        avatarUrl="/profile.jpg"
        onEditProfile={handleEditProfile}
        onShareProfile={handleShareProfile}
        onOpenSettings={handleOpenSettings}
        stats={socialStats}
      />
      <ProfileNavigation />
      <div className="mt-12">
        <RecentEpisodes episodes={episodes} onRefresh={refreshEpisodes} isRefreshing={isRefreshing} setEpisodes={setEpisodes} />
      </div>
      <div className="mt-12">
        <RecentReviews initialReviews={reviews} />
      </div>
    </div>
  )
} 