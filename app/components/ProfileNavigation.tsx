import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Shows', href: '/shows' },
  { label: 'Episodes', href: '/episodes' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Activity', href: '/activity' },
  { label: 'Likes', href: '/likes' }
]

export default function ProfileNavigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-200">
      <div className="flex gap-1">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-4 py-2 text-sm font-medium
                ${isActive 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }
              `}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 