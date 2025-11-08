import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createNotification } from "@/lib/notification"

const commentSchema = z.object({
  entryId: z.string(),
  content: z.string().min(1).max(500),
})

// コメントを投稿
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
    const { entryId, content } = commentSchema.parse(body)

    // コメントを作成
    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        entryId,
        content,
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

    // EntryのcommentCountを増やす
    const entry = await prisma.entry.update({
      where: { id: entryId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
      include: {
        term: true,
      },
    })

    // エントリーの投稿者に通知（自分自身の投稿でない場合）
    if (entry.userId !== session.user.id) {
      await createNotification({
        userId: entry.userId,
        type: "comment",
        title: "コメントが投稿されました",
        message: `「${entry.term.word}」の説明にコメントがつきました`,
        link: `/dictionary/${entry.termId}`,
      })
    }

    return NextResponse.json({
      success: true,
      comment,
    })
  } catch (error) {
    console.error("Comment error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "リクエストが正しくありません" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "コメントの投稿に失敗しました" },
      { status: 500 }
    )
  }
}

// コメント一覧を取得
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const entryId = searchParams.get("entryId")

    if (!entryId) {
      return NextResponse.json(
        { error: "entryIdが必要です" },
        { status: 400 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: {
        entryId,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      comments,
    })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      { error: "コメントの取得に失敗しました" },
      { status: 500 }
    )
  }
}
