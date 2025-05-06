"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import RecentEpisodes from "../components/RecentEpisodes"
import RecentReviews from "../components/RecentReviews"
import ProfileHeader from "../components/ProfileHeader"
import ProfileNavigation from "../components/ProfileNavigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../providers/auth-provider'
import EditProfileModal from '../components/EditProfileModal'

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
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setUsername(data.username || '')
          setAvatarUrl(data.avatar_url || '')
        }
      }
    }

    getProfile()
  }, [user, supabase])

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
    setIsModalOpen(true)
  }

  const handleShareProfile = () => {
    console.log('Share profile clicked - implement share dialog')
  }

  const handleOpenSettings = () => {
    console.log('Settings clicked - implement settings page navigation')
  }

  const handleProfileUpdate = (newUsername: string, newAvatarUrl: string) => {
    setUsername(newUsername)
    setAvatarUrl(newAvatarUrl)
  }

  const socialStats = {
    following: stats?.following || 0,
    followers: stats?.followers || 0
  }

  return (
    <div className="space-y-8">
      <ProfileHeader 
        username={username}
        avatarUrl={avatarUrl}
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

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        username={username}
        avatarUrl={avatarUrl}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
} 