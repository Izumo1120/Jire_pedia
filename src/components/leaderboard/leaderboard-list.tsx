"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeaderboardEntry {
  position: number
  userId: string
  name: string
  image: string | null
  level: number
  rank: string
  xp: number
  totalAttempts: number
  isCurrentUser: boolean
}

interface LeaderboardListProps {
  type: "global" | "weekly" | "category"
  category: string | null
}

export function LeaderboardList({ type, category }: LeaderboardListProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)

        let url = `/api/leaderboard?type=${type}`
        if (type === "category" && category) {
          url += `&category=${encodeURIComponent(category)}`
        }

        const res = await fetch(url)
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

    if (type !== "category" || (type === "category" && category)) {
      fetchLeaderboard()
    } else {
      setLeaderboard([])
      setLoading(false)
    }
  }, [type, category])

  const getRankIcon = (position: number) => {
    if (position === 1) return "🥇"
    if (position === 2) return "🥈"
    if (position === 3) return "🥉"
    return `${position}位`
  }

  const getRankBadgeColor = (rank: string) => {
    const colors = {
      Bronze: "bg-orange-900/30 text-orange-400 border-orange-700/50",
      Silver: "bg-gray-400/20 text-gray-300 border-gray-500/50",
      Gold: "bg-yellow-600/20 text-yellow-400 border-yellow-600/50",
      Platinum: "bg-cyan-600/20 text-cyan-400 border-cyan-600/50",
      Diamond: "bg-blue-600/20 text-blue-400 border-blue-600/50",
    }
    return colors[rank as keyof typeof colors] || colors.Bronze
  }

  if (type === "category" && !category) {
    return (
      <Card className="knowledge-cluster p-8">
        <p className="text-center text-muted-foreground">
          カテゴリーを選択してください
        </p>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="knowledge-cluster p-8">
        <p className="text-center text-muted-foreground">読み込み中...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="knowledge-cluster p-8">
        <p className="text-center text-red-400">{error}</p>
      </Card>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="knowledge-cluster p-8">
        <p className="text-center text-muted-foreground">
          ランキングデータがありません
        </p>
      </Card>
    )
  }

  return (
    <Card className="knowledge-cluster p-6">
      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.userId}
            className={`p-4 rounded-lg border transition-all ${
              entry.isCurrentUser
                ? "bg-golden/10 border-golden/30 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                : "bg-background/50 border-border/50 hover:bg-background/70"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* 順位 */}
              <div className="text-2xl font-bold w-16 text-center">
                {getRankIcon(entry.position)}
              </div>

              {/* ユーザー情報 */}
              <div className="flex items-center gap-3 flex-1">
                {entry.image && (
                  <img
                    src={entry.image}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-lg">{entry.name}</p>
                    {entry.isCurrentUser && (
                      <Badge className="knowledge-crystal text-xs">あなた</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRankBadgeColor(entry.rank)}>
                      {entry.rank}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Lv.{entry.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* 統計 */}
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">XP</p>
                  <p className="text-lg font-bold text-golden">
                    {entry.xp.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">成功数</p>
                  <p className="text-lg font-bold">
                    {entry.totalAttempts.toLocaleString()}
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
