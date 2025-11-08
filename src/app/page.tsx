import Link from "next/link"

export default function HomePage() {
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
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎯</div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">AIと対峙する</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              3つの難易度から選択。難しいほど高得点、レベルアップで新たな挑戦が解放。
            </p>
          </div>

          <div className="knowledge-cluster text-center p-6 md:p-8">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">📚</div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">知を共有する</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              成功した説明が辞書に蓄積。他者の説明から新たな視点を獲得。
            </p>
          </div>

          <div className="knowledge-cluster text-center p-6 md:p-8">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">⚡</div>
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
