"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

export function NotificationDropdown() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount()
      // 1分ごとに未読数を更新
      const interval = setInterval(fetchUnreadCount, 60000)
      return () => clearInterval(interval)
    }
  }, [session])

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchNotifications()
    }
  }, [isOpen, session])

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count")
      const data = await res.json()
      setUnreadCount(data.count)
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=10")
      const data = await res.json()
      setNotifications(data.notifications)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      })
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
      })
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "たった今"
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`

    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    })
  }

  if (!session?.user) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Bell size={20} className="text-golden" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[400px] overflow-y-auto bg-deep-blue border border-golden/30"
      >
        <div className="flex items-center justify-between p-3 border-b border-golden/20">
          <h3 className="font-bold text-golden">通知</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-gray-400 hover:text-golden transition-colors"
            >
              すべて既読
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            通知はありません
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${
                  !notification.read ? "bg-golden/5" : ""
                }`}
                asChild
              >
                <Link
                  href={notification.link || "/notifications"}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id)
                    }
                  }}
                >
                  <div className="space-y-1 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-golden">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-golden flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-300">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild>
              <Link
                href="/notifications"
                className="text-center text-sm text-golden hover:bg-golden/10 p-3 block"
              >
                すべて見る
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
