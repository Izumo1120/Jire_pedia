import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // Get today's date (in Japan timezone UTC+9)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if today's challenge already exists
    let dailyChallenge = await prisma.dailyChallenge.findUnique({
      where: { date: today },
      include: {
        term: true,
        dailyChallengeAttempts: {
          where: { userId: session.user.id },
        },
      },
    })

    // If no challenge exists for today, create one
    if (!dailyChallenge) {
      // Select a random term for today's challenge
      const termCount = await prisma.term.count()

      if (termCount === 0) {
        return NextResponse.json(
          { error: "用語が見つかりませんでした" },
          { status: 404 }
        )
      }

      const skip = Math.floor(Math.random() * termCount)
      const randomTerm = await prisma.term.findFirst({
        skip,
        take: 1,
      })

      if (!randomTerm) {
        return NextResponse.json(
          { error: "用語が見つかりませんでした" },
          { status: 404 }
        )
      }

      // Create today's daily challenge
      dailyChallenge = await prisma.dailyChallenge.create({
        data: {
          date: today,
          termId: randomTerm.id,
        },
        include: {
          term: true,
          dailyChallengeAttempts: {
            where: { userId: session.user.id },
          },
        },
      })
    }

    // Check if user has already completed today's challenge
    const hasCompleted = dailyChallenge.dailyChallengeAttempts.length > 0

    return NextResponse.json({
      success: true,
      dailyChallenge: {
        id: dailyChallenge.id,
        date: dailyChallenge.date,
        term: dailyChallenge.term,
        hasCompleted,
      },
    })
  } catch (error) {
    console.error("Error fetching daily challenge:", error)
    return NextResponse.json(
      { error: "デイリーチャレンジの取得に失敗しました" },
      { status: 500 }
    )
  }
}
