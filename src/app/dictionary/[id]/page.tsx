import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { EntryCard } from "@/components/social/entry-card"
import { auth } from "@/lib/auth"

export default async function TermDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  const term = await prisma.term.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: [
          { isCrown: "desc" },
          { likeCount: "desc" },
          { createdAt: "desc" },
        ],
        take: 20,
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
      },
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

  // デバッグ情報
  console.log("📚 辞書ページ:", {
    termId: term.id,
    termWord: term.word,
    entriesCount: term.entries.length,
    attemptsCount: term.attempts.length,
  })
  if (term.entries.length > 0) {
    console.log("✅ Entries:", term.entries.map(e => ({
      id: e.id.slice(0, 8),
      userId: e.userId.slice(0, 8),
      confidence: e.confidence,
    })))
  }

  const successRate = term.totalAttempts > 0
    ? Math.round((term.totalSuccess / term.totalAttempts) * 100)
    : 0

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        <div>
          <div className="flex items-start justify-between mb-4 md:mb-6 flex-wrap gap-4">
            <div>
              <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold">{term.word}</h1>
              <p className="text-base md:text-lg text-muted-foreground mt-2">
                {term.category}
                {term.subcategory && ` / ${term.subcategory}`}
              </p>
            </div>
            <Link href={`/play/${term.id}`} className="action-node text-base md:text-lg px-6 py-3 relative z-20">
              この用語で遊ぶ
            </Link>
          </div>

          <div className="flex gap-2 flex-wrap">
            {term.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="knowledge-cluster p-4 md:p-6">
          <h2 className="heading text-xl md:text-2xl font-bold mb-3 md:mb-4">公式の定義</h2>
          <p className="text-base md:text-lg">{term.officialDef}</p>
        </Card>

        <Card className="knowledge-cluster p-4 md:p-6">
          <h2 className="heading text-xl md:text-2xl font-bold mb-3 md:mb-4">NGワード</h2>
          <div className="flex flex-wrap gap-2">
            {term.ngWords.map((word) => (
              <Badge key={word} variant="destructive">
                {word}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="knowledge-cluster p-4 md:p-6">
          <h2 className="heading text-xl md:text-2xl font-bold mb-3 md:mb-4">統計</h2>
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
              <p className={`text-3xl font-bold ${successRate > 50 ? "text-success" : "text-destructive"}`}>
                {successRate}%
              </p>
              <p className="text-sm text-muted-foreground">成功率</p>
            </div>
          </div>
        </Card>

        {/* コミュニティの説明 */}
        {term.entries.length > 0 && (
          <div>
            <h2 className="heading text-2xl md:text-3xl font-bold text-golden mb-4 md:mb-6">
              コミュニティの説明
            </h2>
            <div className="space-y-4 md:space-y-5">
              {term.entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  termId={term.id}
                  termWord={term.word}
                />
              ))}
            </div>
          </div>
        )}

        {term.entries.length === 0 && (
          <Card className="knowledge-cluster p-8 text-center relative z-10">
            <p className="text-lg text-gray-300">
              まだ投稿された説明がありません。最初に説明を投稿する人になりませんか？
            </p>
            <Link href={`/play/${term.id}`} className="action-node inline-block mt-4 px-6 py-3 relative z-20">
              挑戦する
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
