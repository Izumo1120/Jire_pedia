"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DailyChallengeLeaderboard } from "./daily-challenge-leaderboard"

interface Term {
  id: string
  word: string
  category: string
  subcategory: string | null
}

interface DailyChallengeCardProps {
  dailyChallenge: {
    id: string
    date: Date
    term: Term
    hasCompleted: boolean
  }
}

export function DailyChallengeCard({
  dailyChallenge,
}: DailyChallengeCardProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <div className="space-y-6">
      <Card className="knowledge-cluster p-6 md:p-8">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="knowledge-crystal">本日のお題</Badge>
              <p className="text-sm text-muted-foreground">
                {formatDate(dailyChallenge.date)}
              </p>
            </div>
            {dailyChallenge.hasCompleted && (
              <Badge className="bg-green-600/20 text-green-400 border-green-400/30">
                完了済み
              </Badge>
            )}
          </div>

          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">カテゴリー</p>
              <p className="text-lg font-semibold">
                {dailyChallenge.term.category}
              </p>
              {dailyChallenge.term.subcategory && (
                <p className="text-sm text-muted-foreground mt-1">
                  {dailyChallenge.term.subcategory}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                あなたが説明する用語
              </p>
              <p className="text-3xl md:text-4xl font-bold text-golden">
                {dailyChallenge.term.word}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {!dailyChallenge.hasCompleted ? (
              <a
                href={`/play/${dailyChallenge.term.id}?daily=true&challengeId=${dailyChallenge.id}`}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors action-node"
              >
                チャレンジする
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 bg-primary/50 text-primary-foreground cursor-not-allowed"
              >
                完了済み
              </button>
            )}
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-11 px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              {showLeaderboard ? "ランキングを閉じる" : "ランキングを見る"}
            </button>
          </div>
        </div>
      </Card>

      {showLeaderboard && (
        <DailyChallengeLeaderboard dailyChallengeId={dailyChallenge.id} />
      )}
    </div>
  )
}
