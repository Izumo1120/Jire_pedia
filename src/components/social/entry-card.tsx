"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LikeButton } from "./like-button"
import { CommentSection } from "./comment-section"
import { ShareButton } from "./share-button"
import { Crown } from "lucide-react"

interface EntryCardProps {
  entry: {
    id: string
    explanation: string
    difficulty: string
    confidence: number
    isCrown: boolean
    crownDays: number
    likeCount: number
    commentCount: number
    createdAt: string
    user: {
      id: string
      name: string | null
      image: string | null
      level: number
      rank: string
    }
  }
  termId: string
  termWord: string
}

export function EntryCard({ entry, termId, termWord }: EntryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="knowledge-cluster p-6 space-y-4">
      {/* ユーザー情報 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={entry.user.image || undefined} />
            <AvatarFallback>{entry.user.name?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-golden">
                {entry.user.name || "匿名ユーザー"}
              </span>
              {entry.isCrown && (
                <div className="flex items-center gap-1 text-golden">
                  <Crown size={16} fill="currentColor" />
                  <span className="text-xs font-bold">{entry.crownDays}日</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Badge variant="outline" className="text-xs">
                Lv.{entry.user.level}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {entry.user.rank}
              </Badge>
              <span className="text-xs">{formatDate(entry.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="knowledge-crystal">
            {entry.difficulty}
          </Badge>
          <span className="text-sm text-gray-400">
            確信度: {entry.confidence}%
          </span>
        </div>
      </div>

      {/* 説明文 */}
      <div className="bg-white/5 rounded-lg p-4 border border-golden/20">
        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">
          {entry.explanation}
        </p>
      </div>

      {/* アクション */}
      <div className="flex items-center justify-between border-t border-golden/20 pt-4">
        <div className="flex items-center gap-4">
          <LikeButton
            entryId={entry.id}
            initialLikeCount={entry.likeCount}
            size="md"
          />
          <CommentSection
            entryId={entry.id}
            initialCommentCount={entry.commentCount}
          />
        </div>
        <ShareButton
          url={`/dictionary/${termId}`}
          title={`「${termWord}」の説明`}
          text={`Jire-pediaで「${termWord}」の説明をチェック！`}
        />
      </div>
    </div>
  )
}
