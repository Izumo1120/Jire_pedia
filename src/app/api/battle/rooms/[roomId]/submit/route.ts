import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { judgeWithGemini, judgeWithGroq } from "@/lib/ai"
import { calculateXP } from "@/lib/xp"
import { checkAndAwardBadges } from "@/lib/badges"

const submitSchema = z.object({
  explanation: z.string().min(1).max(1000),
  submitTime: z.number().min(0),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { roomId } = await params
    const body = await req.json()
    const { explanation, submitTime } = submitSchema.parse(body)

    // 参加者確認とルーム情報取得
    const participant = await prisma.battleParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id,
        isActive: true,
      },
      include: {
        room: {
          include: {
            term: true,
            attempts: true,
          },
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: "このルームに参加していません" },
        { status: 403 }
      )
    }

    const room = participant.room

    if (room.status !== "in_progress") {
      return NextResponse.json(
        { error: "ゲームが進行中ではありません" },
        { status: 400 }
      )
    }

    // 既に提出済みか確認
    const existingAttempt = room.attempts.find(
      (a) => a.userId === session.user.id
    )
    if (existingAttempt) {
      return NextResponse.json(
        { error: "既に提出済みです" },
        { status: 400 }
      )
    }

    // NGワードチェック
    const ngWords = room.term.ngWords
    const lowerExplanation = explanation.toLowerCase()
    const usedNgWords = ngWords.filter((word) =>
      lowerExplanation.includes(word.toLowerCase())
    )

    if (usedNgWords.length > 0) {
      return NextResponse.json(
        {
          error: "NGワードが含まれています",
          ngWords: usedNgWords,
        },
        { status: 400 }
      )
    }

    // AI判定（エラー時はGeminiにフォールバック）
    let result
    let aiModel = ""

    try {
      if (room.difficulty === "easy") {
        aiModel = "gemini-2.5-flash"
        result = await judgeWithGemini(explanation, room.term.word)
      } else if (room.difficulty === "normal") {
        aiModel = "llama-3.1-8b-instant"
        result = await judgeWithGroq(
          explanation,
          room.term.word,
          "llama-3.1-8b-instant"
        )
      } else {
        aiModel = "llama-3-70b-8192"
        result = await judgeWithGroq(explanation, room.term.word, "llama-3-70b-8192")
      }
    } catch (aiError) {
      console.error("AI判定エラー、Geminiにフォールバック:", aiError)
      // Groqがタイムアウトした場合、Geminiにフォールバック
      aiModel = "gemini-2.5-flash (fallback)"
      result = await judgeWithGemini(explanation, room.term.word)
    }

    // XP計算
    const xpEarned = result.success
      ? calculateXP(room.difficulty, result.confidence)
      : 0

    // バトル結果を保存
    const battleAttempt = await prisma.battleAttempt.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        explanation,
        success: result.success,
        confidence: result.confidence,
        aiResponse: result.aiGuess,
        aiComment: result.reasoning,
        xpEarned,
        submitTime,
      },
    })

    // ユーザーのXPとレベルを更新
    if (result.success) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (user) {
        let newXp = user.xp + xpEarned
        let newLevel = user.level
        let leveledUp = false

        // レベルアップ判定
        while (newXp >= newLevel * 100) {
          newXp -= newLevel * 100
          newLevel += 1
          leveledUp = true
        }

        // ランク判定
        let newRank = user.rank
        if (newLevel >= 50) newRank = "Diamond"
        else if (newLevel >= 30) newRank = "Platinum"
        else if (newLevel >= 15) newRank = "Gold"
        else if (newLevel >= 5) newRank = "Silver"
        else newRank = "Bronze"

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            xp: newXp,
            level: newLevel,
            rank: newRank,
          },
        })

        // バッジの獲得チェック
        await checkAndAwardBadges(session.user.id)
      }
    }

    // 全員が提出したかチェック
    const allAttempts = await prisma.battleAttempt.findMany({
      where: { roomId: room.id },
    })

    const activeParticipants = await prisma.battleParticipant.count({
      where: {
        roomId: room.id,
        isActive: true,
      },
    })

    if (allAttempts.length >= activeParticipants) {
      // 全員提出済み → ゲーム終了
      await prisma.battleRoom.update({
        where: { id: room.id },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      result: {
        success: result.success,
        confidence: result.confidence,
        aiGuess: result.aiGuess,
        aiComment: result.reasoning,
        xpEarned,
      },
    })
  } catch (error) {
    console.error("Error submitting battle attempt:", error)
    return NextResponse.json(
      { error: "提出に失敗しました" },
      { status: 500 }
    )
  }
}
