'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, TvIcon, ListBulletIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../providers/auth-provider'
import { UserDropdown } from './UserDropdown'

const navItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Shows', href: '/shows', icon: TvIcon },
  { name: 'Episodes', href: '/episodes', icon: ListBulletIcon },
  { name: 'Stats', href: '/stats', icon: ChartBarIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  if (loading || !user) {
    return null
  }

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Podcast
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-3 text-xl font-medium transition-colors hover:bg-gray-50
                  ${active ? 'text-indigo-600' : 'text-gray-700'}`}
              >
                <Icon className={`h-7 w-7 ${active ? 'text-indigo-600' : 'text-gray-700'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto border-t border-gray-200">
          <UserDropdown />
        </div>
      </div>
    </aside>
  )
} 