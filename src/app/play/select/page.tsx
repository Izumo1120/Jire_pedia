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
    return <div className="container py-10">用語が見つかりませんでした</div>
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">用語を説明しよう</h1>
          <p className="text-muted-foreground">
            AIに推測させる用語が選ばれました
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">カテゴリー</p>
              <p className="text-lg font-semibold">{randomTerm.category}</p>
              {randomTerm.subcategory && (
                <p className="text-sm text-muted-foreground mt-1">
                  {randomTerm.subcategory}
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">あなたが説明する用語</p>
              <p className="text-4xl font-bold text-primary">{randomTerm.word}</p>
            </div>

            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href={`/play/${randomTerm.id}`}>
                  説明を始める
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/play/select">
                  別の用語にする
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
