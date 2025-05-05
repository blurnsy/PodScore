import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { UserDropdown } from "./components/UserDropdown"
import { NotificationBell } from "./components/NotificationBell"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PersonalPod",
  description: "Track and review your podcast listening",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-gray-900">
                    Podiary
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <UserDropdown />
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
