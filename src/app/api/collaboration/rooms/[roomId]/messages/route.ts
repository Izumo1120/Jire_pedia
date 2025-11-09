import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const messageSchema = z.object({
  content: z.string().min(1).max(1000),
  type: z.enum(["text", "hint"]).default("text"),
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
    const { content, type } = messageSchema.parse(body)

    // ルームの存在と参加者確認
    const participant = await prisma.collaborationParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id,
        isActive: true,
      },
      include: {
        room: true,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: "このルームに参加していません" },
        { status: 403 }
      )
    }

    if (participant.room.status === "completed") {
      return NextResponse.json(
        { error: "ルームは既に終了しています" },
        { status: 400 }
      )
    }

    // メッセージを作成
    const message = await prisma.collaborationMessage.create({
      data: {
        roomId,
        userId: session.user.id,
        content,
        type,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "メッセージの送信に失敗しました" },
      { status: 500 }
    )
  }
}
