import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUnreadNotificationCount } from "@/lib/notification"

// 未読通知数を取得
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const count = await getUnreadNotificationCount(session.user.id)

    return NextResponse.json({
      count,
    })
  } catch (error) {
    console.error("Get unread count error:", error)
    return NextResponse.json(
      { error: "未読数の取得に失敗しました" },
      { status: 500 }
    )
  }
}
