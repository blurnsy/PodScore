import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Sidebar from "./components/Sidebar"
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
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar />
          <main className="flex-1 ml-56 py-6 px-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
