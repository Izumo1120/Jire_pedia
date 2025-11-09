"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement: string
  rarity: string
  earned: boolean
  earnedAt: Date | null
  progress: number
}

interface BadgeGridProps {
  userId?: string
}

export function BadgeGrid({ userId }: BadgeGridProps) {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true)
        const url = userId
          ? `/api/badges?userId=${userId}`
          : "/api/badges"
        const res = await fetch(url)
        const data = await res.json()

        if (data.success) {
          setBadges(data.badges)
        }
      } catch (error) {
        console.error("Error fetching badges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [userId])

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "bg-gray-600/20 text-gray-300 border-gray-600/50",
      rare: "bg-blue-600/20 text-blue-400 border-blue-600/50",
      epic: "bg-purple-600/20 text-purple-400 border-purple-600/50",
      legendary: "bg-orange-600/20 text-orange-400 border-orange-600/50",
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  const categories = [
    { value: "all", label: "すべて" },
    { value: "attempts", label: "挑戦" },
    { value: "level", label: "レベル" },
    { value: "rank", label: "ランク" },
    { value: "entries", label: "辞書貢献" },
    { value: "special", label: "特殊" },
  ]

  const filteredBadges =
    filter === "all"
      ? badges
      : badges.filter((badge) => badge.category === filter)

  if (loading) {
    return (
      <Card className="knowledge-cluster p-8">
        <p className="text-center text-muted-foreground">読み込み中...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <Card className="knowledge-cluster p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/50 border border-border hover:bg-background/70"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* バッジグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <Card
            key={badge.id}
            className={`knowledge-cluster p-6 transition-all ${
              badge.earned
                ? "border-golden/30 shadow-[0_0_20px_rgba(255,215,0,0.15)]"
                : "opacity-50 grayscale"
            }`}
          >
            <div className="space-y-3">
              {/* アイコンと名前 */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">{badge.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{badge.name}</h3>
                  <Badge className={getRarityColor(badge.rarity)}>
                    {badge.rarity}
                  </Badge>
                </div>
              </div>

              {/* 説明 */}
              <p className="text-sm text-muted-foreground">
                {badge.description}
              </p>

              {/* 要件 */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">条件</p>
                <p className="text-sm">{badge.requirement}</p>
              </div>

              {/* 獲得日時 */}
              {badge.earned && badge.earnedAt && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-golden">
                    獲得日:{" "}
                    {new Date(badge.earnedAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              )}

              {/* 未獲得 */}
              {!badge.earned && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">未獲得</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <Card className="knowledge-cluster p-8">
          <p className="text-center text-muted-foreground">
            このカテゴリーにバッジはありません
          </p>
        </Card>
      )}
    </div>
  )
}
