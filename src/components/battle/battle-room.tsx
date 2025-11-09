"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Trophy,
  Clock,
  Swords,
  CheckCircle2,
  XCircle,
  Crown,
  Timer,
} from "lucide-react"

interface Participant {
  id: string
  user: {
    id: string
    name: string | null
    image: string | null
    level: number
    rank: string
  }
  isReady: boolean
  joinedAt: Date
  isCurrentUser: boolean
}

interface BattleAttempt {
  id: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  success: boolean
  confidence: number
  xpEarned: number
  submitTime: number
  createdAt: Date
  isCurrentUser: boolean
}

interface RoomData {
  id: string
  code: string
  term: {
    id: string
    word: string
    category: string
    ngWords: string[]
  }
  maxPlayers: number
  difficulty: string
  timeLimit: number
  status: string
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
  participants: Participant[]
  attempts: BattleAttempt[]
  isParticipant: boolean
}

interface BattleRoomProps {
  roomId: string
}

export function BattleRoom({ roomId }: BattleRoomProps) {
  const router = useRouter()
  const [room, setRoom] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [explanation, setExplanation] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    confidence: number
    aiGuess: string
    aiComment: string
    xpEarned: number
  } | null>(null)

  useEffect(() => {
    fetchRoom()
    const interval = setInterval(fetchRoom, 3000) // 3秒ごとに更新
    return () => clearInterval(interval)
  }, [roomId])

  // タイマー管理
  useEffect(() => {
    if (room?.status === "in_progress" && room.startedAt && !hasSubmitted) {
      const updateTimer = () => {
        const elapsed = Math.floor(
          (Date.now() - new Date(room.startedAt!).getTime()) / 1000
        )
        const remaining = room.timeLimit - elapsed

        if (remaining <= 0) {
          setTimeRemaining(0)
        } else {
          setTimeRemaining(remaining)
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [room?.status, room?.startedAt, room?.timeLimit, hasSubmitted])

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/battle/rooms/${roomId}`)
      const data = await res.json()

      if (data.success) {
        setRoom(data.room)

        // 自分が既に提出済みかチェック
        const myAttempt = data.room.attempts.find((a: BattleAttempt) => a.isCurrentUser)
        if (myAttempt) {
          setHasSubmitted(true)
        }
      }
    } catch (error) {
      console.error("Error fetching room:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleReady = async () => {
    try {
      const res = await fetch(`/api/battle/rooms/${roomId}/ready`, {
        method: "POST",
      })

      const data = await res.json()

      if (data.success) {
        fetchRoom()

        if (data.gameStarted) {
          // ゲーム開始
          setTimeRemaining(room?.timeLimit || 300)
        }
      }
    } catch (error) {
      console.error("Error toggling ready:", error)
    }
  }

  const submitExplanation = async () => {
    if (!explanation.trim() || !room) return

    // NGワードチェック（クライアント側）
    const lowerExplanation = explanation.toLowerCase()
    const usedNgWords = room.term.ngWords.filter((word) =>
      lowerExplanation.includes(word.toLowerCase())
    )

    if (usedNgWords.length > 0) {
      alert(`NGワードが含まれています: ${usedNgWords.join(", ")}`)
      return
    }

    try {
      setSubmitting(true)

      const submitTime = room.startedAt
        ? Math.floor((Date.now() - new Date(room.startedAt).getTime()) / 1000)
        : 0

      const res = await fetch(`/api/battle/rooms/${roomId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explanation,
          submitTime,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setResult(data.result)
        setHasSubmitted(true)
        fetchRoom()
      } else {
        alert(data.error || "提出に失敗しました")
      }
    } catch (error) {
      console.error("Error submitting explanation:", error)
      alert("提出に失敗しました")
    } finally {
      setSubmitting(false)
    }
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

  const getRankColor = (rank: string) => {
    const colors = {
      Bronze: "text-orange-600",
      Silver: "text-gray-400",
      Gold: "text-yellow-400",
      Platinum: "text-cyan-400",
      Diamond: "text-blue-400",
    }
    return colors[rank as keyof typeof colors] || "text-gray-400"
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <Card className="knowledge-cluster p-8">
        <p className="text-center text-muted-foreground">読み込み中...</p>
      </Card>
    )
  }

  if (!room) {
    return (
      <Card className="knowledge-cluster p-8">
        <p className="text-center text-muted-foreground">
          ルームが見つかりません
        </p>
      </Card>
    )
  }

  if (!room.isParticipant) {
    return (
      <Card className="knowledge-cluster p-8">
        <p className="text-center text-muted-foreground">
          このルームに参加していません
        </p>
      </Card>
    )
  }

  // ランキングを計算（完了時）
  const rankedAttempts =
    room.status === "completed"
      ? [...room.attempts].sort((a, b) => {
          // 成功 > 失敗
          if (a.success !== b.success) return a.success ? -1 : 1
          // 成功同士なら提出時間が早い方が上位
          if (a.success && b.success) return a.submitTime - b.submitTime
          // 失敗同士ならconfidenceが高い方が上位
          return b.confidence - a.confidence
        })
      : []

  return (
    <div className="space-y-6">
      {/* ルーム情報ヘッダー */}
      <Card className="knowledge-cluster p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">{room.term.word}</h2>
            {getDifficultyBadge(room.difficulty)}
            <Badge className="bg-background/50 border-border/50">
              {room.term.category}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">ルームコード</div>
            <div className="text-xl font-mono font-bold">{room.code}</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              {room.participants.length}/{room.maxPlayers}人
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={16} />
            <span>制限時間: {formatTime(room.timeLimit)}</span>
          </div>
          {room.status === "in_progress" && timeRemaining !== null && (
            <div className="flex items-center gap-2">
              <Clock
                size={16}
                className={timeRemaining < 30 ? "text-red-400" : ""}
              />
              <span
                className={
                  timeRemaining < 30 ? "text-red-400 font-bold" : "font-bold"
                }
              >
                残り: {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* 参加者一覧 */}
      <Card className="knowledge-cluster p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={20} />
          参加者
        </h3>
        <div className="grid gap-3">
          {room.participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-golden/20 flex items-center justify-center font-bold">
                  {participant.user.name?.[0] || "?"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {participant.user.name || "匿名ユーザー"}
                    </span>
                    {participant.isCurrentUser && (
                      <Badge className="bg-golden/20 text-golden border-golden/30">
                        YOU
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Lv.{participant.user.level}</span>
                    <span className={getRankColor(participant.user.rank)}>
                      {participant.user.rank}
                    </span>
                  </div>
                </div>
              </div>

              {room.status === "waiting" && (
                <div>
                  {participant.isReady ? (
                    <Badge className="bg-green-600/20 text-green-400 border-green-400/30">
                      <CheckCircle2 size={14} className="mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-600/20 text-gray-400 border-gray-400/30">
                      待機中
                    </Badge>
                  )}
                </div>
              )}

              {room.status === "in_progress" && (
                <div>
                  {room.attempts.some((a) => a.user.id === participant.user.id) ? (
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-400/30">
                      <CheckCircle2 size={14} className="mr-1" />
                      提出済み
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-400/30">
                      解答中...
                    </Badge>
                  )}
                </div>
              )}

              {room.status === "completed" && (
                <div className="flex items-center gap-2">
                  {rankedAttempts.findIndex(
                    (a) => a.user.id === participant.user.id
                  ) === 0 && (
                    <Crown size={20} className="text-golden" />
                  )}
                  <span className="text-sm font-bold">
                    {rankedAttempts.findIndex(
                      (a) => a.user.id === participant.user.id
                    ) + 1}
                    位
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 待機中 */}
      {room.status === "waiting" && (
        <Card className="knowledge-cluster p-6">
          <div className="text-center space-y-4">
            <p className="text-lg">
              全員がReadyになるとゲームが開始されます
            </p>
            <button
              onClick={toggleReady}
              className={
                room.participants.find((p) => p.isCurrentUser)?.isReady
                  ? "knowledge-cluster px-8 py-4 text-lg font-bold"
                  : "action-node px-8 py-4 text-lg font-bold"
              }
            >
              {room.participants.find((p) => p.isCurrentUser)?.isReady
                ? "Ready解除"
                : "Ready"}
            </button>
          </div>
        </Card>
      )}

      {/* ゲーム進行中 */}
      {room.status === "in_progress" && !hasSubmitted && (
        <Card className="knowledge-cluster p-6">
          <h3 className="text-xl font-bold mb-4">説明を入力してください</h3>

          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">NGワード:</div>
            <div className="flex flex-wrap gap-2">
              {room.term.ngWords.map((word, index) => (
                <Badge
                  key={index}
                  className="unstable-zone text-sm px-3 py-1"
                >
                  {word}
                </Badge>
              ))}
            </div>
          </div>

          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="ここに説明を入力..."
            className="thought-workspace min-h-[200px] text-base mb-4"
            maxLength={1000}
            disabled={submitting}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {explanation.length}/1000文字
            </div>
            <button
              onClick={submitExplanation}
              disabled={!explanation.trim() || submitting}
              className="action-node px-8 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "提出中..." : "提出する"}
            </button>
          </div>
        </Card>
      )}

      {/* 提出済み（結果表示） */}
      {hasSubmitted && result && (
        <Card className="knowledge-cluster p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            {result.success ? (
              <>
                <CheckCircle2 className="text-green-400" size={24} />
                <span className="text-green-400">成功！</span>
              </>
            ) : (
              <>
                <XCircle className="text-red-400" size={24} />
                <span className="text-red-400">失敗</span>
              </>
            )}
          </h3>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                AIの推測:
              </div>
              <div className="text-lg font-bold">{result.aiGuess}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">
                確信度:
              </div>
              <div className="text-lg font-bold">{result.confidence}%</div>
            </div>

            {result.aiComment && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  AIのコメント:
                </div>
                <div className="text-base">{result.aiComment}</div>
              </div>
            )}

            {result.success && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  獲得XP:
                </div>
                <div className="text-2xl font-bold text-golden">
                  +{result.xpEarned} XP
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border/30">
              <p className="text-center text-muted-foreground">
                他のプレイヤーの結果を待っています...
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 完了 */}
      {room.status === "completed" && (
        <Card className="knowledge-cluster p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="text-golden" size={24} />
            バトル結果
          </h3>

          <div className="space-y-3">
            {rankedAttempts.map((attempt, index) => (
              <div
                key={attempt.id}
                className={`p-4 rounded-lg border ${
                  index === 0
                    ? "bg-golden/10 border-golden/30"
                    : "bg-background/30 border-border/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold">#{index + 1}</div>
                    {index === 0 && <Crown className="text-golden" size={24} />}
                    <div>
                      <div className="font-bold">
                        {attempt.user.name || "匿名ユーザー"}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>提出: {formatTime(attempt.submitTime)}</span>
                        <span>確信度: {attempt.confidence}%</span>
                        {attempt.success && (
                          <span className="text-green-400 font-bold">
                            +{attempt.xpEarned} XP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {attempt.success ? (
                    <CheckCircle2 className="text-green-400" size={24} />
                  ) : (
                    <XCircle className="text-red-400" size={24} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/battle")}
              className="action-node px-8 py-3 font-bold"
            >
              ロビーに戻る
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
