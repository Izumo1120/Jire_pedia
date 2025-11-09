"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { LeaderboardList } from "./leaderboard-list"

type TabType = "global" | "weekly" | "category"

export function LeaderboardTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("global")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    "プログラミング",
    "数学",
    "物理学",
    "化学",
    "生物学",
    "経済学",
    "哲学",
  ]

  return (
    <div className="space-y-6">
      {/* タブ */}
      <Card className="knowledge-cluster p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("global")}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-md text-sm font-medium transition-all ${
              activeTab === "global"
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                : "bg-background/50 hover:bg-background/70"
            }`}
          >
            グローバル
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-md text-sm font-medium transition-all ${
              activeTab === "weekly"
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                : "bg-background/50 hover:bg-background/70"
            }`}
          >
            週間
          </button>
          <button
            onClick={() => setActiveTab("category")}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-md text-sm font-medium transition-all ${
              activeTab === "category"
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                : "bg-background/50 hover:bg-background/70"
            }`}
          >
            カテゴリー別
          </button>
        </div>
      </Card>

      {/* カテゴリー選択 */}
      {activeTab === "category" && (
        <Card className="knowledge-cluster p-4">
          <p className="text-sm text-muted-foreground mb-3">
            カテゴリーを選択
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/50 border border-border hover:bg-background/70"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* リーダーボードリスト */}
      <LeaderboardList
        type={activeTab}
        category={activeTab === "category" ? selectedCategory : null}
      />
    </div>
  )
}
