"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Home,
  Gamepad2,
  BookOpen,
  User,
  Bell,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: Home, label: "ホーム", href: "/" },
  { icon: Gamepad2, label: "プレイ", href: "/play/select" },
  { icon: BookOpen, label: "辞書", href: "/dictionary" },
  { icon: User, label: "プロフィール", href: "/profile" },
  { icon: Bell, label: "通知", href: "/notifications" },
]

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // ログインしていない場合は表示しない
  if (status === "loading") {
    return <div className="w-0" />
  }

  if (!session) {
    return <div className="w-0" />
  }

  return (
    <>
      {/* サイドバー本体 */}
      <aside
        className={`
          hidden md:block
          fixed left-0 top-16 h-[calc(100vh-4rem)]
          bg-deep-blue/80 backdrop-blur-md border-r border-golden/30
          transition-all duration-300 ease-in-out
          ${isExpanded ? "w-64" : "w-16"}
          z-40
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <nav className="flex flex-col gap-2 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-4 rounded-lg
                  transition-all duration-300 ease-in-out
                  ${isExpanded ? "px-4 py-3" : "px-3 py-3 justify-center"}
                  ${isActive && isExpanded
                    ? "bg-golden/20 text-golden border border-golden/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                    : isActive
                    ? "bg-golden/20 text-golden"
                    : "text-gray-300 hover:bg-golden/10 hover:text-golden"
                  }
                  ${isExpanded && !isActive ? "hover:border-golden/30 border border-transparent" : ""}
                `}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))' : undefined
                }}
              >
                <Icon
                  className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-golden' : ''}`}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))' : undefined
                  }}
                />
                <span
                  className={`
                    text-sm font-medium whitespace-nowrap
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 overflow-hidden"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* 展開/折りたたみインジケーター */}
        <div
          className={`
            absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-12 flex items-center justify-center
            bg-deep-blue border border-golden/30 rounded-r-lg
            transition-all duration-300
            ${isExpanded ? "opacity-100" : "opacity-0"}
          `}
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4 text-golden" />
          ) : (
            <ChevronRight className="w-4 h-4 text-golden" />
          )}
        </div>
      </aside>

      {/* コンテンツのためのスペーサー (デスクトップのみ) */}
      <div className="hidden md:block md:w-16" />
    </>
  )
}
