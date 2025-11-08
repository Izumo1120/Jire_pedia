import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function ResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { attemptId } = await params

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      term: true,
      user: true,
    },
  })

  if (!attempt || attempt.userId !== session.user.id) {
    redirect("/play/select")
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          {attempt.success ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold text-green-600">成功!</h1>
              <p className="text-lg text-muted-foreground mt-2">
                AIはあなたの説明を理解しました
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">😢</div>
              <h1 className="text-4xl font-bold text-red-600">失敗...</h1>
              <p className="text-lg text-muted-foreground mt-2">
                AIは別の答えを推測しました
              </p>
            </>
          )}
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">問題の用語</h3>
              <p className="text-3xl font-bold text-primary">{attempt.term.word}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {attempt.term.category}
                {attempt.term.subcategory && ` / ${attempt.term.subcategory}`}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">公式の定義</h3>
              <p className="text-muted-foreground">{attempt.term.officialDef}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">あなたの説明</h3>
              <p className="whitespace-pre-wrap">{attempt.explanation}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">AIの推測</h3>
                <p className="text-xl font-bold">
                  {attempt.aiResponse}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">確信度</h3>
                <p className="text-xl font-bold">
                  {attempt.confidence}%
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AIのコメント</h3>
              <p className="text-muted-foreground">{attempt.aiComment}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">獲得XP</p>
                  <p className="text-2xl font-bold">+{attempt.xpEarned} XP</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">難易度</p>
                  <Badge>{attempt.difficulty}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">使用AI</p>
                  <p className="text-sm">{attempt.aiModel}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/play/select">もう一度プレイ</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dictionary">辞書を見る</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
