"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

interface NotificationListProps {
  initialNotifications: Notification[]
}

export function NotificationList({
  initialNotifications,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
      })

      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      })

      if (res.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        )
      }
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️"
      case "comment":
        return "💬"
      case "crown":
        return "👑"
      case "level_up":
        return "⬆️"
      case "system":
        return "📢"
      default:
        return "🔔"
    }
  }

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      {/* フィルターとアクション */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "action-node" : ""}
          >
            すべて ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
            className={filter === "unread" ? "action-node" : ""}
          >
            未読 ({unreadCount})
          </Button>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={markAllAsRead}
            className="text-sm"
          >
            <Check size={16} className="mr-2" />
            すべて既読にする
          </Button>
        )}
      </div>

      {/* 通知リスト */}
      {filteredNotifications.length === 0 ? (
        <div className="knowledge-cluster p-12 text-center">
          <Bell size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">
            {filter === "unread" ? "未読通知はありません" : "通知はありません"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`knowledge-cluster p-4 ${
                !notification.read ? "border-golden/50 bg-golden/5" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-golden">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-golden transition-colors flex-shrink-0"
                        aria-label="既読にする"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-200 mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-400">
                      {formatDate(notification.createdAt)}
                    </span>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="text-sm text-golden hover:underline"
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        詳細を見る →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
