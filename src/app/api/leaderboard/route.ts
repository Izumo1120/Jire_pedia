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
    const type = searchParams.get("type") || "global" // global, category, weekly
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "50")

    let whereClause = {}

    // カテゴリー別リーダーボードの場合
    if (type === "category" && category) {
      // カテゴリー別の統計を計算
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          level: true,
          rank: true,
          xp: true,
          attempts: {
            where: {
              term: {
                category: category,
              },
              success: true,
            },
            select: {
              xpEarned: true,
            },
          },
        },
        orderBy: {
          xp: "desc",
        },
        take: limit,
      })

      const leaderboard = users
        .map((user) => {
          const categoryXp = user.attempts.reduce(
            (sum, attempt) => sum + attempt.xpEarned,
            0
          )
          return {
            userId: user.id,
            name: user.name || "匿名ユーザー",
            image: user.image,
            level: user.level,
            rank: user.rank,
            xp: categoryXp,
            totalAttempts: user.attempts.length,
            isCurrentUser: user.id === session.user.id,
          }
        })
        .filter((user) => user.xp > 0)
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limit)
        .map((user, index) => ({
          ...user,
          position: index + 1,
        }))

      return NextResponse.json({
        success: true,
        type: "category",
        category,
        leaderboard,
      })
    }

    // 週間リーダーボード
    if (type === "weekly") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          level: true,
          rank: true,
          attempts: {
            where: {
              createdAt: {
                gte: oneWeekAgo,
              },
              success: true,
            },
            select: {
              xpEarned: true,
            },
          },
        },
      })

      const leaderboard = users
        .map((user) => {
          const weeklyXp = user.attempts.reduce(
            (sum, attempt) => sum + attempt.xpEarned,
            0
          )
          return {
            userId: user.id,
            name: user.name || "匿名ユーザー",
            image: user.image,
            level: user.level,
            rank: user.rank,
            xp: weeklyXp,
            totalAttempts: user.attempts.length,
            isCurrentUser: user.id === session.user.id,
          }
        })
        .filter((user) => user.xp > 0)
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limit)
        .map((user, index) => ({
          ...user,
          position: index + 1,
        }))

      return NextResponse.json({
        success: true,
        type: "weekly",
        leaderboard,
      })
    }

    // グローバルリーダーボード（デフォルト）
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        level: true,
        rank: true,
        xp: true,
        attempts: {
          where: {
            success: true,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ xp: "desc" }, { level: "desc" }],
      take: limit,
    })

    const leaderboard = users.map((user, index) => ({
      position: index + 1,
      userId: user.id,
      name: user.name || "匿名ユーザー",
      image: user.image,
      level: user.level,
      rank: user.rank,
      xp: user.xp,
      totalAttempts: user.attempts.length,
      isCurrentUser: user.id === session.user.id,
    }))

    return NextResponse.json({
      success: true,
      type: "global",
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
