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
    const dailyChallengeId = searchParams.get("id")

    if (!dailyChallengeId) {
      return NextResponse.json(
        { error: "デイリーチャレンジIDが必要です" },
        { status: 400 }
      )
    }

    // Get all attempts for this daily challenge
    const attempts = await prisma.dailyChallengeAttempt.findMany({
      where: {
        dailyChallengeId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            level: true,
            rank: true,
          },
        },
        attempt: {
          select: {
            success: true,
            confidence: true,
            xpEarned: true,
            difficulty: true,
          },
        },
      },
      orderBy: [
        { attempt: { success: "desc" } },
        { attempt: { confidence: "desc" } },
        { completedAt: "asc" },
      ],
    })

    // Format leaderboard data
    const leaderboard = attempts.map((entry, index) => ({
      rank: index + 1,
      user: {
        id: entry.user.id,
        name: entry.user.name || "匿名ユーザー",
        image: entry.user.image,
        level: entry.user.level,
        rank: entry.user.rank,
      },
      success: entry.attempt.success,
      confidence: entry.attempt.confidence,
      xpEarned: entry.attempt.xpEarned,
      difficulty: entry.attempt.difficulty,
      completedAt: entry.completedAt,
      isCurrentUser: entry.user.id === session.user.id,
    }))

    return NextResponse.json({
      success: true,
      leaderboard,
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { error: "リーダーボードの取得に失敗しました" },
      { status: 500 }
    )
  }
}
