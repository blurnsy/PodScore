import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../providers/auth-provider'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  avatarUrl: string
  onProfileUpdate: (username: string, avatarUrl: string) => void
}

export default function EditProfileModal({
  isOpen,
  onClose,
  username: initialUsername,
  avatarUrl: initialAvatarUrl,
  onProfileUpdate
}: EditProfileModalProps) {
  const [username, setUsername] = useState(initialUsername)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { user, refreshUser } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setUsername(initialUsername)
    setAvatarUrl(initialAvatarUrl)
    setSelectedImage(null)
  }, [initialUsername, initialAvatarUrl, isOpen])

  if (!isOpen) return null

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    handleAvatarUpload(file)
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true)
      setMessage('')

      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      setMessage('Avatar updated successfully!')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error uploading avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage('')

      console.log('Saving profile with avatarUrl:', avatarUrl)

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      // Update Supabase Auth user_metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { username, avatar_url: avatarUrl }
      })
      if (authError) throw authError

      // Refresh session to get updated user_metadata in JWT
      await supabase.auth.refreshSession()
      
      onProfileUpdate(username, avatarUrl)
      await refreshUser()
      setMessage('Profile updated successfully!')
      setTimeout(() => onClose(), 1000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={selectedImage || avatarUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                {uploading ? 'Uploading...' : 'Change Avatar'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              placeholder="Enter your username"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 