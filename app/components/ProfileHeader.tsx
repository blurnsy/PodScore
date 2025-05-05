import React, { useState } from 'react'

type ProfileHeaderProps = {
  avatarUrl?: string
  username: string
  onEditProfile?: () => void
  onShareProfile?: () => void
  onOpenSettings?: () => void
  stats: {
    following: number
    followers: number
  }
}

export default function ProfileHeader({ 
  avatarUrl, 
  username,
  onEditProfile = () => console.log('Edit profile clicked'),
  onShareProfile = () => console.log('Share profile clicked'),
  onOpenSettings = () => console.log('Settings clicked'),
  stats
}: ProfileHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  console.log('ProfileHeader stats:', stats) // Debug log

  const handleMenuClick = (handler: () => void) => {
    handler()
    setShowMenu(false)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt="User avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="space-y-4">
            <span className="text-2xl font-bold text-gray-900">{username}</span>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="font-semibold">{stats?.following || 0}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{stats?.followers || 0}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onEditProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button 
                  onClick={() => handleMenuClick(onShareProfile)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share Profile
                </button>
                <button 
                  onClick={() => handleMenuClick(onOpenSettings)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 