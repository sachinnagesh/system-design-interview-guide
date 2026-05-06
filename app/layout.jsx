import React from 'react'

export const metadata = {
  title: 'System Design Interview Guide - Master HLD & LLD | Free Course',
  description: 'Complete system design interview guide with 14 topics, 40+ concepts with trade-offs, and 20+ real case studies from Netflix, Uber, Discord. Master both High-Level Design (HLD) and Low-Level Design (LLD) for FAANG interviews.',
  keywords: 'system design, system design interview, HLD, LLD, interview prep, high level design, low level design, system design guide',
  authors: [{ name: 'System Design Interview Guide' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'System Design Interview Guide - Master HLD & LLD',
    description: 'Free system design guide with real case studies, trade-offs, and interview framework. Perfect for FAANG interviews.',
    type: 'website',
    url: 'https://system-design-interview-guide.vercel.app',
    siteName: 'System Design Interview Guide',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'System Design Interview Guide',
    description: 'Master system design with real case studies and trade-offs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  canonical: 'https://system-design-interview-guide.vercel.app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>📐</text></svg>" />
        <style>
          {`html, body { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }`}
        </style>
      </head>
      <body style={{ margin: 0, padding: 0, width: '100%', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}