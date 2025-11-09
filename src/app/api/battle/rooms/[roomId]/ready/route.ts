import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // 参加者確認
    const participant = await prisma.battleParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id,
        isActive: true,
      },
      include: {
        room: {
          include: {
            participants: {
              where: {
                isActive: true,
              },
            },
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

    if (participant.room.status !== "waiting") {
      return NextResponse.json(
        { error: "ルームは既に開始されています" },
        { status: 400 }
      )
    }

    // Ready状態を切り替え
    const updatedParticipant = await prisma.battleParticipant.update({
      where: { id: participant.id },
      data: {
        isReady: !participant.isReady,
      },
    })

    // 全員がReadyならゲーム開始
    const allParticipants = participant.room.participants
    const allReady = allParticipants.every(
      (p) =>
        p.userId === session.user.id ? updatedParticipant.isReady : p.isReady
    )

    if (allReady && allParticipants.length >= 2) {
      await prisma.battleRoom.update({
        where: { id: roomId },
        data: {
          status: "in_progress",
          startedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        isReady: updatedParticipant.isReady,
        gameStarted: true,
      })
    }

    return NextResponse.json({
      success: true,
      isReady: updatedParticipant.isReady,
      gameStarted: false,
    })
  } catch (error) {
    console.error("Error toggling ready status:", error)
    return NextResponse.json(
      { error: "Ready状態の変更に失敗しました" },
      { status: 500 }
    )
  }
}
