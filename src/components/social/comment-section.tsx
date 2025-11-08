"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Trash2, Send } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface CommentSectionProps {
  entryId: string
  initialCommentCount: number
}

export function CommentSection({
  entryId,
  initialCommentCount,
}: CommentSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isExpanded) {
      fetchComments()
    }
  }, [isExpanded])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?entryId=${entryId}`)
      const data = await res.json()
      setComments(data.comments)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      router.push("/login")
      return
    }

    if (!newComment.trim() || isLoading) return

    setIsLoading(true)

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId,
          content: newComment.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "コメントの投稿に失敗しました")
      }

      setComments([data.comment, ...comments])
      setCommentCount(commentCount + 1)
      setNewComment("")
    } catch (error) {
      console.error("Comment error:", error)
      alert("コメントの投稿に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("コメントを削除しますか?")) return

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "コメントの削除に失敗しました")
      }

      setComments(comments.filter((c) => c.id !== commentId))
      setCommentCount(commentCount - 1)
    } catch (error) {
      console.error("Delete comment error:", error)
      alert("コメントの削除に失敗しました")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "たった今"
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    if (days < 7) return `${days}日前`

    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* コメント展開ボタン */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-300 hover:text-golden transition-colors"
      >
        <MessageCircle size={20} />
        <span className="font-medium">{commentCount} コメント</span>
      </button>

      {/* コメントセクション */}
      {isExpanded && (
        <div className="space-y-4 pl-4 border-l-2 border-golden/30">
          {/* コメント入力フォーム */}
          {session?.user && (
            <form onSubmit={handleSubmit} className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを入力..."
                className="thought-workspace min-h-[80px]"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isLoading}
                  className="action-node px-4 py-2 text-sm md:text-base font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
                >
                  <Send size={16} />
                  投稿
                </button>
              </div>
            </form>
          )}

          {/* コメント一覧 */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                まだコメントがありません
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="knowledge-cluster p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.image || undefined} />
                        <AvatarFallback>
                          {comment.user.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">
                            {comment.user.name || "匿名ユーザー"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                    {session?.user?.id === comment.user.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        aria-label="コメントを削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
