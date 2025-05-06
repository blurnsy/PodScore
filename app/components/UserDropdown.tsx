'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/auth-provider'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'

export function UserDropdown() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button className="w-full p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <img
              src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex flex-col items-start">
              <span className="font-bold text-gray-900">
                {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-sm text-gray-500">
                @{user?.user_metadata?.username || user?.email?.split('@')[0] || 'user'}
              </span>
            </div>
          </div>
          <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute bottom-full left-0 right-0 mb-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => router.push('/profile')}
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                Your Profile
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => router.push('/settings')}
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm text-gray-700`}
              >
                Settings
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleSignOut}
                className={`${
                  active ? 'bg-gray-50' : ''
                } w-full text-left px-4 py-2 text-sm text-gray-700 border-t border-gray-200`}
              >
                Log out @{user?.user_metadata?.username || user?.email?.split('@')[0] || 'user'}
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 