import type { Metadata, Viewport } from 'next'
import './globals.css'
import LogoutButton from '@/components/LogoutButton'

export const metadata: Metadata = {
  title: 'Allegro - Music Practice Companion',
  description: 'Turn passive listening into active engagement during your kids\' music practice',
  keywords: ['music', 'practice', 'piano', 'guitar', 'coaching', 'parenting'],
  authors: [{ name: 'JMBeh' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="flex flex-col min-h-screen">
          <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
                🎵 Allegro
              </a>
              <LogoutButton />
            </div>
          </header>
          
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="border-t bg-white/50 backdrop-blur-sm py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-sm text-slate-600">
              <p>A personal coaching companion for music practice</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

