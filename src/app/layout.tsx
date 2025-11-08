import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { HeaderClient } from "@/components/layout/header-client"
import { Sidebar } from "@/components/layout/sidebar"
import { NexusCanvas } from "@/components/nexus/nexus-canvas"

export const metadata: Metadata = {
  title: "Jire-pedia - AIを攻略する説明力ゲーム",
  description: "専門用語を自分の言葉で説明し、AIに推測させる学習プラットフォーム",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <NexusCanvas />
          <div className="relative flex min-h-screen flex-col" style={{ zIndex: 1 }}>
            <HeaderClient />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
