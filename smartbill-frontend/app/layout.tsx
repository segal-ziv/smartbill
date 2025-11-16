import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "./globals.css"

import { Heebo } from "next/font/google"

const heebo = Heebo({ subsets: ["hebrew", "latin"] })
const isProduction = process.env.NODE_ENV === "production"

export const metadata: Metadata = {
  title: "SmartBill - ניהול חשבוניות חכם",
  description: "מערכת ניהול חשבוניות דיגיטלית לעוסקים בישראל",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        {isProduction ? <Analytics /> : null}
      </body>
    </html>
  )
}
