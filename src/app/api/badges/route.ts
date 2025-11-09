import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || session.user.id

    // ユーザーが獲得したバッジを取得
    const userBadges = await prisma.userBadge.findMany({
      where: {
        userId,
      },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: "desc",
      },
    })

    // すべてのバッジを取得（獲得済みかどうかをマーク）
    const allBadges = await prisma.badge.findMany({
      orderBy: [{ category: "asc" }, { rarity: "desc" }],
    })

    const badgesWithStatus = allBadges.map((badge) => {
      const userBadge = userBadges.find((ub) => ub.badgeId === badge.id)
      return {
        ...badge,
        earned: !!userBadge,
        earnedAt: userBadge?.earnedAt || null,
        progress: userBadge?.progress || 0,
      }
    })

    return NextResponse.json({
      success: true,
      badges: badgesWithStatus,
      earnedCount: userBadges.length,
      totalCount: allBadges.length,
    })
  } catch (error) {
    console.error("Error fetching badges:", error)
    return NextResponse.json(
      { error: "バッジの取得に失敗しました" },
      { status: 500 }
    )
  }
}
