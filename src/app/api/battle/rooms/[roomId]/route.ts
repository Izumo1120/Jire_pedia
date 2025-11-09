import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const { roomId } = await params

    const room = await prisma.battleRoom.findUnique({
      where: { id: roomId },
      include: {
        term: {
          select: {
            id: true,
            word: true,
            category: true,
            ngWords: true,
          },
        },
        participants: {
          where: {
            isActive: true,
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
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        attempts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: "ルームが見つかりません" },
        { status: 404 }
      )
    }

    // 参加者かどうか確認
    const isParticipant = room.participants.some(
      (p) => p.userId === session.user.id
    )

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        term: room.term,
        maxPlayers: room.maxPlayers,
        difficulty: room.difficulty,
        timeLimit: room.timeLimit,
        status: room.status,
        createdAt: room.createdAt,
        startedAt: room.startedAt,
        completedAt: room.completedAt,
        participants: room.participants.map((p) => ({
          id: p.id,
          user: p.user,
          isReady: p.isReady,
          joinedAt: p.joinedAt,
          isCurrentUser: p.userId === session.user.id,
        })),
        attempts: room.attempts.map((a) => ({
          id: a.id,
          user: a.user,
          success: a.success,
          confidence: a.confidence,
          xpEarned: a.xpEarned,
          submitTime: a.submitTime,
          createdAt: a.createdAt,
          isCurrentUser: a.userId === session.user.id,
        })),
        isParticipant,
      },
    })
  } catch (error) {
    console.error("Error fetching battle room:", error)
    return NextResponse.json(
      { error: "ルーム情報の取得に失敗しました" },
      { status: 500 }
    )
  }
}
