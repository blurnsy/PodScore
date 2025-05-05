'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, TvIcon, ListBulletIcon, ChartBarIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

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
      <div className="mb-2">
        <button className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-full text-lg transition-colors shadow">
          <PencilSquareIcon className="h-6 w-6" />
          Log
        </button>
      </div>
    </aside>
  )
} 