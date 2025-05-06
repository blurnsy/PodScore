import './globals.css'
import type { Metadata } from 'next'
import SupabaseProvider from './providers/supabase-provider'
import { AuthProvider } from './providers/auth-provider'
import { Inter } from "next/font/google"
import Sidebar from './components/Sidebar'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Podcast Review App',
  description: 'Review and track your favorite podcasts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Sidebar />
              <main className="ml-0 md:ml-64 min-h-screen">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
