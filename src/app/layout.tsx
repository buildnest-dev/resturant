import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/hanken-grotesk'
import '@fontsource-variable/geist-mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZAQSA Restaurant',
  description: 'QR and NFC ordering, kitchen display, billing and delivery-app orders together.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
