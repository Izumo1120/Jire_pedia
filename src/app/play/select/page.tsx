import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default async function SelectTermPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // ランダムに用語を取得
  const termCount = await prisma.term.count()
  const skip = Math.floor(Math.random() * termCount)
  const randomTerm = await prisma.term.findFirst({
    skip,
    take: 1,
  })

  if (!randomTerm) {
    return <div className="nexus-container nexus-section">用語が見つかりませんでした</div>
  }

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-2xl space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold">用語を説明しよう</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            AIに推測させる用語が選ばれました
          </p>
        </div>

        <Card className="knowledge-cluster p-6 md:p-8 relative z-10">
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <p className="text-sm md:text-base text-muted-foreground mb-2">カテゴリー</p>
              <p className="text-lg md:text-xl font-semibold">{randomTerm.category}</p>
              {randomTerm.subcategory && (
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {randomTerm.subcategory}
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm md:text-base text-muted-foreground mb-2">あなたが説明する用語</p>
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary" style={{ textShadow: '0 0 40px rgba(255, 215, 0, 0.5)' }}>
                {randomTerm.word}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 relative z-20">
              <Link href={`/play/${randomTerm.id}`} className="action-node text-base md:text-lg px-6 py-3 text-center">
                説明を始める
              </Link>
              <Link href="/play/select" className="action-node text-base md:text-lg px-6 py-3 text-center" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                別の用語にする
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
