import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createRoomSchema = z.object({
  termId: z.string().optional(),
  maxPlayers: z.number().min(2).max(8).default(2),
  difficulty: z.enum(["easy", "normal", "hard"]).default("normal"),
  timeLimit: z.number().min(60).max(600).default(300), // 1分〜10分
})

// ランダムなルームコードを生成
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// バトルルームを作成
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const body = await req.json()
    const { termId, maxPlayers, difficulty, timeLimit } =
      createRoomSchema.parse(body)

    // termIdが指定されていない場合はランダムに選択
    let selectedTermId = termId
    if (!selectedTermId) {
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
        select: { id: true },
      })

      if (!randomTerm) {
        return NextResponse.json(
          { error: "用語が見つかりませんでした" },
          { status: 404 }
        )
      }

      selectedTermId = randomTerm.id
    }

    // ユニークなルームコードを生成
    let code = generateRoomCode()
    let existingRoom = await prisma.battleRoom.findUnique({
      where: { code },
    })

    while (existingRoom) {
      code = generateRoomCode()
      existingRoom = await prisma.battleRoom.findUnique({
        where: { code },
      })
    }

    // ルームを作成
    const room = await prisma.battleRoom.create({
      data: {
        code,
        termId: selectedTermId,
        maxPlayers,
        difficulty,
        timeLimit,
      },
      include: {
        term: true,
      },
    })

    // 作成者を参加者として追加
    await prisma.battleParticipant.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        termId: room.termId,
        term: room.term,
        maxPlayers: room.maxPlayers,
        difficulty: room.difficulty,
        timeLimit: room.timeLimit,
        status: room.status,
      },
    })
  } catch (error) {
    console.error("Error creating battle room:", error)
    return NextResponse.json(
      { error: "ルームの作成に失敗しました" },
      { status: 500 }
    )
  }
}

// バトルルーム一覧を取得
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const rooms = await prisma.battleRoom.findMany({
      where: {
        status: "waiting",
      },
      include: {
        term: {
          select: {
            id: true,
            word: true,
            category: true,
          },
        },
        participants: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            isReady: true,
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })

    const roomsWithCount = rooms.map((room) => ({
      id: room.id,
      code: room.code,
      term: room.term,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.participants.length,
      difficulty: room.difficulty,
      timeLimit: room.timeLimit,
      status: room.status,
      participants: room.participants,
      createdAt: room.createdAt,
    }))

    return NextResponse.json({
      success: true,
      rooms: roomsWithCount,
    })
  } catch (error) {
    console.error("Error fetching battle rooms:", error)
    return NextResponse.json(
      { error: "ルーム一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}
