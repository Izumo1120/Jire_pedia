import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserNotifications, markAllNotificationsAsRead } from "@/lib/notification"

// 通知一覧を取得
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 20

    const notifications = await getUserNotifications(session.user.id, limit)

    return NextResponse.json({
      notifications,
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { error: "通知の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// すべての通知を既読にする
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    await markAllNotificationsAsRead(session.user.id)

    return NextResponse.json({
      success: true,
      message: "すべての通知を既読にしました",
    })
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    return NextResponse.json(
      { error: "通知の既読処理に失敗しました" },
      { status: 500 }
    )
  }
}
