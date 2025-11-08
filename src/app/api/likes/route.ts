import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createNotification } from "@/lib/notification"

const likeSchema = z.object({
  entryId: z.string(),
})

// いいねを追加・削除（トグル）
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { entryId } = likeSchema.parse(body)

    // 既存のいいねをチェック
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_entryId: {
          userId: session.user.id,
          entryId,
        },
      },
    })

    if (existingLike) {
      // いいねを削除
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      // EntryのlikeCountを減らす
      await prisma.entry.update({
        where: { id: entryId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      })

      return NextResponse.json({
        success: true,
        liked: false,
        message: "いいねを取り消しました",
      })
    } else {
      // いいねを追加
      await prisma.like.create({
        data: {
          userId: session.user.id,
          entryId,
        },
      })

      // EntryのlikeCountを増やす
      const entry = await prisma.entry.update({
        where: { id: entryId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
        include: {
          user: true,
          term: true,
        },
      })

      // エントリーの投稿者に通知（自分自身の投稿でない場合）
      if (entry.userId !== session.user.id) {
        await createNotification({
          userId: entry.userId,
          type: "like",
          title: "いいねされました",
          message: `「${entry.term.word}」の説明にいいねされました`,
          link: `/dictionary/${entry.termId}`,
        })
      }

      return NextResponse.json({
        success: true,
        liked: true,
        message: "いいねしました",
      })
    }
  } catch (error) {
    console.error("Like error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "リクエストが正しくありません" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "いいね処理に失敗しました" },
      { status: 500 }
    )
  }
}

// いいね状態を取得
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const entryId = searchParams.get("entryId")

    if (!entryId) {
      return NextResponse.json(
        { error: "entryIdが必要です" },
        { status: 400 }
      )
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_entryId: {
          userId: session.user.id,
          entryId,
        },
      },
    })

    return NextResponse.json({
      liked: !!like,
    })
  } catch (error) {
    console.error("Get like status error:", error)
    return NextResponse.json(
      { error: "いいね状態の取得に失敗しました" },
      { status: 500 }
    )
  }
}
