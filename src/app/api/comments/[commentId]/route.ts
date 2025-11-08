import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// コメントを削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { commentId } = await params

    // コメントを取得
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json(
        { error: "コメントが見つかりません" },
        { status: 404 }
      )
    }

    // 自分のコメントかチェック
    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "削除権限がありません" },
        { status: 403 }
      )
    }

    // コメントを削除
    await prisma.comment.delete({
      where: { id: commentId },
    })

    // EntryのcommentCountを減らす
    await prisma.entry.update({
      where: { id: comment.entryId },
      data: {
        commentCount: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "コメントを削除しました",
    })
  } catch (error) {
    console.error("Delete comment error:", error)
    return NextResponse.json(
      { error: "コメントの削除に失敗しました" },
      { status: 500 }
    )
  }
}
