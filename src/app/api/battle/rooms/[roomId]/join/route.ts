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

    // ルームの存在確認
    const room = await prisma.battleRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          where: {
            isActive: true,
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

    // ルームの状態確認
    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "このルームは既に開始されています" },
        { status: 400 }
      )
    }

    // 人数制限確認
    if (room.participants.length >= room.maxPlayers) {
      return NextResponse.json(
        { error: "ルームが満員です" },
        { status: 400 }
      )
    }

    // 既に参加しているか確認
    const existingParticipant = await prisma.battleParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: session.user.id,
        },
      },
    })

    if (existingParticipant) {
      if (existingParticipant.isActive) {
        return NextResponse.json({
          success: true,
          message: "既に参加しています",
        })
      }

      // 再参加
      await prisma.battleParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          isActive: true,
          leftAt: null,
        },
      })
    } else {
      // 新規参加
      await prisma.battleParticipant.create({
        data: {
          roomId: room.id,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "ルームに参加しました",
    })
  } catch (error) {
    console.error("Error joining battle room:", error)
    return NextResponse.json(
      { error: "ルームへの参加に失敗しました" },
      { status: 500 }
    )
  }
}
