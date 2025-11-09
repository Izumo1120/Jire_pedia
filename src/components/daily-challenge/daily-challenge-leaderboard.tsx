"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    name: string
    image: string | null
    level: number
    rank: string
  }
  success: boolean
  confidence: number
  xpEarned: number
  difficulty: string
  completedAt: Date
  isCurrentUser: boolean
}

interface DailyChallengeLeaderboardProps {
  dailyChallengeId: string
}

export function DailyChallengeLeaderboard({
  dailyChallengeId,
}: DailyChallengeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/daily-challenge/leaderboard?id=${dailyChallengeId}`
        )
        const data = await res.json()

        if (data.success) {
          setLeaderboard(data.leaderboard)
        } else {
          setError(data.error || "ランキングの取得に失敗しました")
        }
      } catch (err) {
        setError("ランキングの取得に失敗しました")
        console.error("Error fetching leaderboard:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [dailyChallengeId])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `${rank}位`
  }

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      easy: "bg-green-600/20 text-green-400 border-green-400/30",
      normal: "bg-blue-600/20 text-blue-400 border-blue-400/30",
      hard: "bg-red-600/20 text-red-400 border-red-400/30",
    }
    const labels = {
      easy: "Easy",
      normal: "Normal",
      hard: "Hard",
    }
    return (
      <Badge className={variants[difficulty as keyof typeof variants]}>
        {labels[difficulty as keyof typeof labels]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className="knowledge-cluster p-6">
        <p className="text-center text-muted-foreground">読み込み中...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="knowledge-cluster p-6">
        <p className="text-center text-red-400">{error}</p>
      </Card>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="knowledge-cluster p-6">
        <p className="text-center text-muted-foreground">
          まだ誰もチャレンジしていません
        </p>
      </Card>
    )
  }

  return (
    <Card className="knowledge-cluster p-6">
      <h2 className="text-2xl font-bold text-golden mb-6">ランキング</h2>
      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.user.id}
            className={`p-4 rounded-lg border transition-colors ${
              entry.isCurrentUser
                ? "bg-golden/10 border-golden/30"
                : "bg-background/50 border-border/50"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-2xl font-bold w-16 text-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex items-center gap-3 flex-1">
                  {entry.user.image && (
                    <img
                      src={entry.user.image}
                      alt={entry.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{entry.user.name}</p>
                      {entry.isCurrentUser && (
                        <Badge className="knowledge-crystal text-xs">
                          あなた
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Lv.{entry.user.level}</span>
                      <span>•</span>
                      <span>{entry.user.rank}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getDifficultyBadge(entry.difficulty)}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">信頼度</p>
                  <p className="text-lg font-bold">
                    {entry.confidence.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">獲得XP</p>
                  <p className="text-lg font-bold text-golden">
                    {entry.xpEarned}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
