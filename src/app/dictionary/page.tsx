import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DictionaryPage() {
  const terms = await prisma.term.findMany({
    orderBy: { totalAttempts: "desc" },
    take: 50,
  })

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-6xl space-y-8 md:space-y-10">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold">用語辞書</h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
            みんなの説明で作る、最もわかりやすい辞書
          </p>
        </div>

        <div className="nexus-grid nexus-grid-3">
          {terms.map((term) => {
            const successRate = term.totalAttempts > 0
              ? Math.round((term.totalSuccess / term.totalAttempts) * 100)
              : 0

            return (
              <Link key={term.id} href={`/dictionary/${term.id}`}>
                <article className="knowledge-cluster cursor-pointer h-full transition-all duration-300 hover:scale-105 hover:border-primary">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{term.word}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {term.category}
                        {term.subcategory && ` / ${term.subcategory}`}
                      </p>
                    </div>

                    <p className="text-sm md:text-base line-clamp-2 text-muted-foreground leading-relaxed">
                      {term.officialDef}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      {term.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="knowledge-crystal text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs md:text-sm text-muted-foreground border-t border-border pt-3">
                      <span>挑戦: {term.totalAttempts}回</span>
                      <span
                        className={successRate > 50 ? "text-success" : "text-destructive"}
                        style={{ fontWeight: 500 }}
                      >
                        成功率: {successRate}%
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        {terms.length === 0 && (
          <div className="knowledge-cluster text-center py-12 md:py-20">
            <p className="text-base md:text-lg text-muted-foreground">
              まだ用語が登録されていません
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
