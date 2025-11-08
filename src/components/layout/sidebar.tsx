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
          ${isExpanded ? "w-64" : "w-16"}
          z-40
        `}
        style={{
          background: 'linear-gradient(180deg, rgba(10, 37, 64, 0.95) 0%, rgba(10, 37, 64, 0.85) 100%)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 215, 0, 0.15)',
          boxShadow: isExpanded ? '4px 0 20px rgba(0, 0, 0, 0.3)' : 'none',
          transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 400ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <nav className="flex flex-col gap-2 p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center rounded-lg
                  ${isExpanded ? "px-4 py-3 gap-4" : "px-3 py-3 justify-center"}
                  ${isActive
                    ? "bg-primary/20 text-primary"
                    : "text-gray-300 hover:bg-primary/10 hover:text-primary"
                  }
                `}
                style={{
                  transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                  ...(isActive ? {
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 20px rgba(255, 215, 0, 0.1)',
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  } : {})
                }}
              >
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                  <Icon
                    className={`w-6 h-6`}
                    style={{
                      transition: 'filter 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                      ...(isActive ? {
                        filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
                      } : {})
                    }}
                  />
                </div>
                <span
                  className={`
                    text-sm font-medium whitespace-nowrap overflow-hidden
                    ${isExpanded ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"}
                  `}
                  style={{
                    transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), max-width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                    ...(isActive ? {
                      textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                    } : {})
                  }}
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
            rounded-r-lg
            ${isExpanded ? "opacity-100" : "opacity-0"}
          `}
          style={{
            background: 'rgba(10, 37, 64, 0.95)',
            borderTop: '1px solid rgba(255, 215, 0, 0.2)',
            borderRight: '1px solid rgba(255, 215, 0, 0.2)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)',
            transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))' }} />
          ) : (
            <ChevronRight className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))' }} />
          )}
        </div>
      </aside>

      {/* コンテンツのためのスペーサー (デスクトップのみ) */}
      <div className="hidden md:block md:w-16" />
    </>
  )
}
