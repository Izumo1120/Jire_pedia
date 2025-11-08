"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  entryId: string
  initialLikeCount: number
  initialLiked?: boolean
  size?: "sm" | "md" | "lg"
}

export function LikeButton({
  entryId,
  initialLikeCount,
  initialLiked = false,
  size = "md",
}: LikeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)

  // 初期状態を取得
  useEffect(() => {
    if (session?.user) {
      fetchLikeStatus()
    }
  }, [session, entryId])

  const fetchLikeStatus = async () => {
    try {
      const res = await fetch(`/api/likes?entryId=${entryId}`)
      const data = await res.json()
      setLiked(data.liked)
    } catch (error) {
      console.error("Failed to fetch like status:", error)
    }
  }

  const handleLike = async () => {
    if (!session?.user) {
      router.push("/login")
      return
    }

    if (isLoading) return

    setIsLoading(true)

    // 楽観的更新
    const wasLiked = liked
    const prevCount = likeCount

    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      })

      const data = await res.json()

      if (!res.ok) {
        // エラー時は元に戻す
        setLiked(wasLiked)
        setLikeCount(prevCount)
        throw new Error(data.error || "いいねに失敗しました")
      }

      setLiked(data.liked)
    } catch (error) {
      console.error("Like error:", error)
      // エラー時は元に戻す
      setLiked(wasLiked)
      setLikeCount(prevCount)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-2",
    lg: "text-lg gap-2",
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`
        flex items-center ${sizeClasses[size]}
        transition-all duration-200
        ${
          liked
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-red-400"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      aria-label={liked ? "いいねを取り消す" : "いいねする"}
    >
      <Heart
        size={iconSizes[size]}
        fill={liked ? "currentColor" : "none"}
        className="transition-all"
      />
      <span className="font-medium">{likeCount}</span>
    </button>
  )
}
