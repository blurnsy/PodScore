'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, TvIcon, ListBulletIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const navItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Shows', href: '/shows', icon: TvIcon },
  { name: 'Episodes', href: '/episodes', icon: ListBulletIcon },
  { name: 'Stats', href: '/stats', icon: ChartBarIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-screen w-56 bg-white border-r border-gray-200 shadow-sm p-4 justify-between fixed">
      <nav className="flex flex-col gap-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors
                ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-500'}`}
            >
              <Icon className={`h-6 w-6 ${active ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors mt-4">
        <img src="/profile.jpg" alt="User avatar" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 leading-tight">burnsy</span>
          <span className="text-gray-500 text-sm">@0xburnsy</span>
        </div>
        <span className="ml-auto text-gray-400 text-2xl">&#8230;</span>
      </Link>
    </aside>
  )
} 