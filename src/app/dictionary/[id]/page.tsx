import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function TermDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const term = await prisma.term.findUnique({
    where: { id },
    include: {
      attempts: {
        where: { success: true },
        orderBy: { confidence: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              level: true,
              rank: true,
            },
          },
        },
      },
    },
  })

  if (!term) {
    redirect("/dictionary")
  }

  const successRate = term.totalAttempts > 0
    ? Math.round((term.totalSuccess / term.totalAttempts) * 100)
    : 0

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">{term.word}</h1>
              <p className="text-lg text-muted-foreground mt-2">
                {term.category}
                {term.subcategory && ` / ${term.subcategory}`}
              </p>
            </div>
            <Button asChild>
              <Link href={`/play/${term.id}`}>この用語で遊ぶ</Link>
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {term.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">公式の定義</h2>
          <p className="text-lg">{term.officialDef}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">NGワード</h2>
          <div className="flex flex-wrap gap-2">
            {term.ngWords.map((word) => (
              <Badge key={word} variant="destructive">
                {word}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-3">統計</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{term.totalAttempts}</p>
              <p className="text-sm text-muted-foreground">挑戦回数</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{term.totalSuccess}</p>
              <p className="text-sm text-muted-foreground">成功回数</p>
            </div>
            <div>
              <p className={`text-3xl font-bold ${successRate > 50 ? "text-green-600" : "text-orange-600"}`}>
                {successRate}%
              </p>
              <p className="text-sm text-muted-foreground">成功率</p>
            </div>
          </div>
        </Card>

        {term.attempts.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">成功した説明</h2>
            <div className="space-y-4">
              {term.attempts.map((attempt) => (
                <Card key={attempt.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{attempt.user.name}</span>
                        <Badge variant="secondary">Lv.{attempt.user.level}</Badge>
                        <Badge variant="outline">{attempt.user.rank}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{attempt.difficulty}</Badge>
                        <span className="text-sm text-muted-foreground">
                          確信度: {attempt.confidence}%
                        </span>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{attempt.explanation}</p>
                    {attempt.aiComment && (
                      <p className="text-sm text-muted-foreground italic border-l-2 pl-3">
                        AI: {attempt.aiComment}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {term.attempts.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground">
              まだ成功した説明がありません。最初に成功する人になりませんか？
            </p>
            <Button asChild className="mt-4">
              <Link href={`/play/${term.id}`}>挑戦する</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
