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

    const room = await prisma.collaborationRoom.findUnique({
      where: { id: roomId },
      include: {
        term: true,
        host: {
          select: {
            id: true,
            name: true,
            image: true,
            level: true,
            rank: true,
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
        messages: {
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
          take: 100,
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
        host: room.host,
        maxPlayers: room.maxPlayers,
        difficulty: room.difficulty,
        status: room.status,
        createdAt: room.createdAt,
        startedAt: room.startedAt,
        completedAt: room.completedAt,
        participants: room.participants.map((p) => ({
          id: p.id,
          user: p.user,
          role: p.role,
          joinedAt: p.joinedAt,
          isCurrentUser: p.userId === session.user.id,
        })),
        messages: room.messages,
        isParticipant,
        isHost: room.hostId === session.user.id,
      },
    })
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json(
      { error: "ルーム情報の取得に失敗しました" },
      { status: 500 }
    )
  }
}
