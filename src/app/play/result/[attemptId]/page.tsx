import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PartyPopper, X } from "lucide-react"

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
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-3xl space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
          {attempt.success ? (
            <>
              <div className="mb-4 md:mb-6 flex justify-center">
                <PartyPopper className="w-16 h-16 md:w-20 md:h-20 text-success" style={{ filter: 'drop-shadow(0 0 20px rgba(40, 167, 69, 0.8))' }} />
              </div>
              <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold text-success">成功!</h1>
              <p className="text-base md:text-lg text-muted-foreground">
                AIはあなたの説明を理解しました
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 md:mb-6 flex justify-center">
                <X className="w-16 h-16 md:w-20 md:h-20 text-destructive" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 87, 34, 0.8))' }} />
              </div>
              <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold text-destructive">失敗...</h1>
              <p className="text-base md:text-lg text-muted-foreground">
                AIは別の答えを推測しました
              </p>
            </>
          )}
        </div>

        <Card className="knowledge-cluster p-6 md:p-8 relative z-10">
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="heading text-lg md:text-xl font-bold mb-2 md:mb-3">問題の用語</h3>
              <p className="text-3xl md:text-4xl font-bold text-primary" style={{ textShadow: '0 0 40px rgba(255, 215, 0, 0.5)' }}>{attempt.term.word}</p>
              <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
                {attempt.term.category}
                {attempt.term.subcategory && ` / ${attempt.term.subcategory}`}
              </p>
            </div>

            <div>
              <h3 className="heading text-lg md:text-xl font-bold mb-2 md:mb-3">公式の定義</h3>
              <p className="text-sm md:text-base text-muted-foreground">{attempt.term.officialDef}</p>
            </div>

            <div>
              <h3 className="heading text-lg md:text-xl font-bold mb-2 md:mb-3">あなたの説明</h3>
              <p className="text-sm md:text-base whitespace-pre-wrap">{attempt.explanation}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <h3 className="heading text-lg md:text-xl font-bold mb-2 md:mb-3">AIの推測</h3>
                <p className="text-xl md:text-2xl font-bold">
                  {attempt.aiResponse}
                </p>
              </div>

              <div>
                <h3 className="heading text-lg md:text-xl font-bold mb-2 md:mb-3">確信度</h3>
                <p className="text-xl md:text-2xl font-bold">
                  {attempt.confidence}%
                </p>
              </div>
            </div>

            <div>
              <h3 className="heading text-lg md:text-xl font-bold mb-2 md:mb-3">AIのコメント</h3>
              <p className="text-sm md:text-base text-muted-foreground">{attempt.aiComment}</p>
            </div>

            <div className="border-t border-border pt-4 md:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">獲得XP</p>
                  <p className="text-2xl md:text-3xl font-bold text-primary">+{attempt.xpEarned} XP</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">難易度</p>
                  <Badge className="text-base md:text-lg px-3 py-1">{attempt.difficulty}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">使用AI</p>
                  <p className="text-sm md:text-base font-medium">{attempt.aiModel}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 relative z-20">
          <Link href="/play/select" className="action-node text-base md:text-lg px-8 py-4 text-center">
            もう一度プレイ
          </Link>
          <Link href="/dictionary" className="action-node text-base md:text-lg px-8 py-4 text-center" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            辞書を見る
          </Link>
        </div>
      </div>
    </div>
  )
}
