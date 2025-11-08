import { prisma } from "./prisma"

export type NotificationType = "like" | "comment" | "crown" | "level_up" | "system"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * 通知を作成
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    })
  } catch (error) {
    console.error("Failed to create notification:", error)
    return null
  }
}

/**
 * ユーザーの通知を取得
 */
export async function getUserNotifications(userId: string, limit = 20) {
  return await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  })
}

/**
 * 通知を既読にする
 */
export async function markNotificationAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      read: true,
    },
  })
}

/**
 * 複数の通知を既読にする
 */
export async function markNotificationsAsRead(notificationIds: string[]) {
  return await prisma.notification.updateMany({
    where: {
      id: {
        in: notificationIds,
      },
    },
    data: {
      read: true,
    },
  })
}

/**
 * すべての通知を既読にする
 */
export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  })
}

/**
 * 未読通知の数を取得
 */
export async function getUnreadNotificationCount(userId: string) {
  return await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  })
}
