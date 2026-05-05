import React from 'react'

export const metadata = {
  title: 'System Design Interview Guide - HLD + LLD',
  description: 'Complete guide covering High-Level Design, Low-Level Design, trade-offs, and real-world case studies for system design interviews.',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'System Design Interview Guide',
    description: 'Master both HLD and LLD with real case studies and trade-offs',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>📐</text></svg>" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}