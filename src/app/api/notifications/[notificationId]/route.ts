import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { markNotificationAsRead } from "@/lib/notification"
import { prisma } from "@/lib/prisma"

// 通知を既読にする
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { notificationId } = await params

    // 通知の所有者確認
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "通知が見つかりません" },
        { status: 404 }
      )
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "権限がありません" },
        { status: 403 }
      )
    }

    await markNotificationAsRead(notificationId)

    return NextResponse.json({
      success: true,
      message: "通知を既読にしました",
    })
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return NextResponse.json(
      { error: "通知の既読処理に失敗しました" },
      { status: 500 }
    )
  }
}
