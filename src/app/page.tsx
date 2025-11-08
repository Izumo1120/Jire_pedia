import Link from "next/link"
import Image from "next/image"
import { Target, BookOpen, Zap, TrendingUp, ArrowRight, CheckCircle2, Users, Brain } from "lucide-react"
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
      <div className="relative">
        {/* ヒーローセクション */}
        <section className="nexus-container nexus-section">
          <div className="mx-auto max-w-6xl">
            <div className="text-center space-y-8 md:space-y-12 py-16 md:py-24">
              {/* ロゴ */}
              <div className="flex justify-center mb-8">
                <div className="relative w-24 h-24 md:w-32 md:h-32" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))' }}>
                  <Image
                    src="/logo.png"
                    alt="Jire-pedia"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* メインコピー */}
              <div className="space-y-6">
                <h1 className="heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  AIを攻略する
                  <br />
                  <span className="text-primary" style={{ textShadow: '0 0 40px rgba(255, 215, 0, 0.5)' }}>
                    説明力ゲーム
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  専門用語を「その言葉を使わずに」説明し、AIに推測させる。
                  <br />
                  <span className="text-sm md:text-base mt-2 inline-block">
                    成功した説明は、みんなで作る知の辞書に刻まれます。
                  </span>
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 px-4">
                <Link href="/register" className="action-node text-base md:text-lg px-8 py-4 md:px-10 md:py-5 font-bold flex items-center justify-center gap-2 relative z-20 group">
                  無料で始める
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="action-node text-base md:text-lg px-8 py-4 md:px-10 md:py-5 font-medium relative z-20"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  ログイン
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="nexus-container py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                なぜ <span className="text-primary" style={{ textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}>Jire-pedia</span> なのか
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                言葉の真の理解と表現力を、楽しみながら鍛える革新的なプラットフォーム
              </p>
            </div>

            <div className="nexus-grid nexus-grid-3 gap-6 md:gap-8">
              <div className="knowledge-cluster text-center p-6 md:p-8 relative z-10">
                <div className="mb-4 md:mb-6 flex justify-center">
                  <div className="p-4 rounded-full" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <Brain className="w-12 h-12 md:w-14 md:h-14 text-primary" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' }} />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">AIと対峙する</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  3つの難易度から選択。難しいほど高得点、レベルアップで新たな挑戦が解放。最先端のAIがあなたの説明力を評価します。
                </p>
              </div>

              <div className="knowledge-cluster text-center p-6 md:p-8 relative z-10">
                <div className="mb-4 md:mb-6 flex justify-center">
                  <div className="p-4 rounded-full" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <Users className="w-12 h-12 md:w-14 md:h-14 text-primary" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' }} />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">知を共有する</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  成功した説明が辞書に蓄積。他者の説明から新たな視点を獲得。コミュニティ全体で知識を深めます。
                </p>
              </div>

              <div className="knowledge-cluster text-center p-6 md:p-8 relative z-10">
                <div className="mb-4 md:mb-6 flex justify-center">
                  <div className="p-4 rounded-full" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <Zap className="w-12 h-12 md:w-14 md:h-14 text-primary" style={{ filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' }} />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">言葉を磨く</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  禁止ワードの制約下で表現力を鍛え、真の理解へ到達する。制約が創造性を引き出します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ベネフィットセクション */}
        <section className="nexus-container py-16 md:py-24" style={{ background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.02) 0%, rgba(255, 215, 0, 0) 100%)' }}>
          <div className="mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-6">
                <h2 className="heading text-3xl md:text-4xl font-bold">
                  あなたの
                  <span className="text-primary" style={{ textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}> 説明力 </span>
                  を次のレベルへ
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))' }} />
                    <div>
                      <h4 className="font-bold mb-1">深い理解の獲得</h4>
                      <p className="text-sm text-muted-foreground">言葉を使わずに説明することで、本質的な理解が深まります</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))' }} />
                    <div>
                      <h4 className="font-bold mb-1">表現力の向上</h4>
                      <p className="text-sm text-muted-foreground">制約下での説明が、創造的な表現力を鍛えます</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))' }} />
                    <div>
                      <h4 className="font-bold mb-1">ゲーミフィケーション</h4>
                      <p className="text-sm text-muted-foreground">レベル、ランク、XPで楽しみながら成長を実感</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="knowledge-cluster p-8 md:p-10 relative z-10">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-bold text-primary mb-2" style={{ textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}>
                      ∞
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">無限に広がる学習の可能性</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.05)' }}>
                      <div className="text-2xl md:text-3xl font-bold mb-1">5段階</div>
                      <p className="text-xs md:text-sm text-muted-foreground">ランクシステム</p>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.05)' }}>
                      <div className="text-2xl md:text-3xl font-bold mb-1">3種</div>
                      <p className="text-xs md:text-sm text-muted-foreground">AIモデル</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 最終CTA */}
        <section className="nexus-container py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="knowledge-cluster p-8 md:p-12 relative z-10">
              <h2 className="heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                今すぐ始めよう
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                アカウント作成は30秒。すぐにAIとの知的ゲームを体験できます。
              </p>
              <Link href="/register" className="action-node text-base md:text-lg px-10 py-5 font-bold inline-flex items-center gap-2 relative z-20 group">
                無料でアカウントを作成
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
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
