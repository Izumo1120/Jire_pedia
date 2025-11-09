"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Timer, Swords } from "lucide-react"

interface Room {
  id: string
  code: string
  term: {
    id: string
    word: string
    category: string
  }
  maxPlayers: number
  currentPlayers: number
  difficulty: string
  timeLimit: number
  status: string
  participants: Array<{
    id: string
    isReady: boolean
    user: {
      id: string
      name: string | null
      image: string | null
      level: number
      rank: string
    }
  }>
  createdAt: Date
}

export function BattleLobby() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    maxPlayers: 2,
    difficulty: "normal" as "easy" | "normal" | "hard",
    timeLimit: 300,
  })

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 5000) // 5秒ごとに更新
    return () => clearInterval(interval)
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/battle/rooms")
      const data = await res.json()

      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error("Error fetching battle rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async () => {
    try {
      setCreating(true)
      const res = await fetch("/api/battle/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createFormData),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/battle/rooms/${data.room.id}`)
      }
    } catch (error) {
      console.error("Error creating battle room:", error)
      alert("ルームの作成に失敗しました")
    } finally {
      setCreating(false)
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/battle/rooms/${roomId}/join`, {
        method: "POST",
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/battle/rooms/${roomId}`)
      } else {
        alert(data.error || "参加に失敗しました")
      }
    } catch (error) {
      console.error("Error joining battle room:", error)
      alert("参加に失敗しました")
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    )
    if (seconds < 60) return `${seconds}秒前`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}分前`
    const hours = Math.floor(minutes / 60)
    return `${hours}時間前`
  }

  return (
    <div className="space-y-6">
      {/* ルーム作成セクション */}
      <Card className="knowledge-cluster p-6">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="action-node w-full text-lg py-4 font-bold"
          >
            <Swords className="inline-block mr-2" size={24} />
            新しいバトルルームを作成
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-golden">バトルルーム設定</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  最大人数
                </label>
                <select
                  value={createFormData.maxPlayers}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      maxPlayers: parseInt(e.target.value),
                    })
                  }
                  className="thought-workspace w-full p-2"
                >
                  <option value={2}>2人</option>
                  <option value={3}>3人</option>
                  <option value={4}>4人</option>
                  <option value={6}>6人</option>
                  <option value={8}>8人</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">難易度</label>
                <select
                  value={createFormData.difficulty}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      difficulty: e.target.value as "easy" | "normal" | "hard",
                    })
                  }
                  className="thought-workspace w-full p-2"
                >
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  制限時間
                </label>
                <select
                  value={createFormData.timeLimit}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      timeLimit: parseInt(e.target.value),
                    })
                  }
                  className="thought-workspace w-full p-2"
                >
                  <option value={60}>1分</option>
                  <option value={180}>3分</option>
                  <option value={300}>5分</option>
                  <option value={600}>10分</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createRoom}
                disabled={creating}
                className="action-node flex-1 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "作成中..." : "作成"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="knowledge-cluster px-6 py-3 font-bold"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ルーム一覧 */}
      <div>
        <h2 className="text-2xl font-bold text-golden mb-4">
          参加可能なバトルルーム
        </h2>

        {loading ? (
          <Card className="knowledge-cluster p-8">
            <p className="text-center text-muted-foreground">読み込み中...</p>
          </Card>
        ) : rooms.length === 0 ? (
          <Card className="knowledge-cluster p-8">
            <p className="text-center text-muted-foreground">
              参加可能なルームがありません
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room) => (
              <Card key={room.id} className="knowledge-cluster p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{room.term.word}</h3>
                      {getDifficultyBadge(room.difficulty)}
                      <Badge className="bg-background/50 border-border/50">
                        {room.term.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>
                          {room.currentPlayers}/{room.maxPlayers}人
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer size={16} />
                        <span>{formatTime(room.timeLimit)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{getTimeAgo(room.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono bg-background/50 px-3 py-1 rounded border border-border/50">
                        {room.code}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {room.participants.filter((p) => p.isReady).length}/
                        {room.participants.length} Ready
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => joinRoom(room.id)}
                    className="action-node px-6 py-3 font-bold"
                    disabled={room.currentPlayers >= room.maxPlayers}
                  >
                    {room.currentPlayers >= room.maxPlayers
                      ? "満員"
                      : "参加する"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
