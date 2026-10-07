import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({ subsets: ['arabic', 'latin'] })

export const metadata: Metadata = {
  title: 'حضور الأطفال',
  description: 'تسجيل حضور الأطفال في المجموعات التعليمية',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.className} min-h-screen bg-stone-50 text-stone-800 antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
