import Link from "next/link"
import { Target, BookOpen, Zap, TrendingUp } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getRequiredXP } from "@/lib/xp"

export default async function HomePage() {
  const session = await auth()

  // ログイン済みユーザーの場合、ユーザー情報を取得
  let user = null
  let recentTerms = []
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        attempts: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            term: true,
          },
        },
      },
    })

    // 最近挑戦されている用語を取得
    recentTerms = await prisma.term.findMany({
      orderBy: { totalAttempts: "desc" },
      take: 6,
    })
  }

  // 未ログインユーザーの表示
  if (!session || !user) {
    return (
      <div className="nexus-container nexus-section">
        <div className="mx-auto max-w-4xl">
          <section className="text-center space-y-8 md:space-y-10 py-12 md:py-20">
            <h1 className="heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              AIを攻略する
              <br />
              <span className="text-primary" style={{ textShadow: '0 0 40px rgba(255, 215, 0, 0.5)' }}>
                説明力ゲーム
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              専門用語を「その言葉を使わずに」説明し、AIに推測させよう。
              <br />
              <span className="text-sm md:text-base mt-2 inline-block">
                成功した説明は、みんなで作る知の辞書に刻まれます。
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 px-4">
              <Link href="/register" className="action-node text-base md:text-lg px-6 py-3 md:px-8 md:py-4">
                無料で始める
              </Link>
              <Link
                href="/login"
                className="action-node text-base md:text-lg px-6 py-3 md:px-8 md:py-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                ログイン
              </Link>
            </div>
          </section>

          {/* 特徴セクション */}
          <section className="nexus-grid nexus-grid-3 mt-16 md:mt-24">
          <div className="knowledge-cluster text-center p-6 md:p-8">
            <div className="mb-3 md:mb-4 flex justify-center">
              <Target className="w-12 h-12 md:w-14 md:h-14 text-primary" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' }} />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">AIと対峙する</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              3つの難易度から選択。難しいほど高得点、レベルアップで新たな挑戦が解放。
            </p>
          </div>

          <div className="knowledge-cluster text-center p-6 md:p-8">
            <div className="mb-3 md:mb-4 flex justify-center">
              <BookOpen className="w-12 h-12 md:w-14 md:h-14 text-primary" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' }} />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">知を共有する</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              成功した説明が辞書に蓄積。他者の説明から新たな視点を獲得。
            </p>
          </div>

          <div className="knowledge-cluster text-center p-6 md:p-8">
            <div className="mb-3 md:mb-4 flex justify-center">
              <Zap className="w-12 h-12 md:w-14 md:h-14 text-primary" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' }} />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">言葉を磨く</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              禁止ワードの制約下で表現力を鍛え、真の理解へ到達する。
            </p>
          </div>
          </section>
        </div>
      </div>
    )
  }

  // ログイン済みユーザーの表示
  const requiredXP = getRequiredXP(user.level)
  const xpProgress = (user.xp / requiredXP) * 100
  const totalAttempts = user.attempts.length
  const successfulAttempts = user.attempts.filter(a => a.success).length

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-6xl">
        {/* ウェルカムセクション */}
        <section className="text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
          <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold">
            おかえりなさい、
            <span className="text-primary" style={{ textShadow: '0 0 40px rgba(255, 215, 0, 0.5)' }}>
              {user.name}
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            今日も知の探求を続けましょう
          </p>
        </section>

        {/* ユーザー統計 */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12 md:mb-16">
          <Card className="knowledge-cluster p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-primary" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">レベル</p>
                <p className="text-2xl font-bold">Lv. {user.level}</p>
              </div>
            </div>
          </Card>

          <Card className="knowledge-cluster p-4 md:p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">ランク</p>
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {user.rank}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="knowledge-cluster p-4 md:p-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">経験値</p>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">{user.xp} XP</span>
                <span className="text-sm text-muted-foreground">/ {requiredXP}</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
          </Card>

          <Card className="knowledge-cluster p-4 md:p-6">
            <div>
              <p className="text-sm text-muted-foreground">挑戦回数</p>
              <p className="text-2xl font-bold">{totalAttempts}回</p>
              <p className="text-xs text-muted-foreground mt-1">
                成功: {successfulAttempts}回
              </p>
            </div>
          </Card>
        </div>

        {/* クイックアクション */}
        <section className="mb-12 md:mb-16">
          <h2 className="heading text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
            今すぐプレイ
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            <Link href="/play/select" className="action-node text-base md:text-lg px-8 py-4">
              ランダムで挑戦
            </Link>
            <Link href="/dictionary" className="action-node text-base md:text-lg px-8 py-4"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              辞書を見る
            </Link>
          </div>
        </section>

        {/* 人気の用語 */}
        <section>
          <h2 className="heading text-2xl md:text-3xl font-bold mb-6 md:mb-8">
            人気の用語
          </h2>
          <div className="nexus-grid nexus-grid-3">
            {recentTerms.map((term) => (
              <Link key={term.id} href={`/play/${term.id}`}>
                <Card className="knowledge-cluster h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:border-primary">
                  <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-bold">{term.word}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {term.category}
                      {term.subcategory && ` / ${term.subcategory}`}
                    </p>
                    <div className="flex justify-between text-xs md:text-sm text-muted-foreground border-t border-border pt-3">
                      <span>挑戦: {term.totalAttempts}回</span>
                      <span className={term.totalAttempts > 0 && (term.totalSuccess / term.totalAttempts) > 0.5 ? "text-success" : "text-destructive"}>
                        成功率: {term.totalAttempts > 0 ? Math.round((term.totalSuccess / term.totalAttempts) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
