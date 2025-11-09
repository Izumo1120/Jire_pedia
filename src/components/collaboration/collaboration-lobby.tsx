"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock } from "lucide-react"

interface Room {
  id: string
  code: string
  term: {
    id: string
    word: string
    category: string
  }
  host: {
    id: string
    name: string | null
    image: string | null
  }
  maxPlayers: number
  currentPlayers: number
  difficulty: string
  status: string
  createdAt: Date
}

export function CollaborationLobby() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 5000) // 5秒ごとに更新
    return () => clearInterval(interval)
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/collaboration/rooms")
      const data = await res.json()

      if (data.success) {
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async () => {
    try {
      setCreating(true)
      const res = await fetch("/api/collaboration/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxPlayers: 4,
          difficulty: "normal",
        }),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/collaboration/rooms/${data.room.id}`)
      }
    } catch (error) {
      console.error("Error creating room:", error)
      alert("ルームの作成に失敗しました")
    } finally {
      setCreating(false)
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/collaboration/rooms/${roomId}/join`, {
        method: "POST",
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/collaboration/rooms/${roomId}`)
      } else {
        alert(data.error || "参加に失敗しました")
      }
    } catch (error) {
      console.error("Error joining room:", error)
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
      {/* ルーム作成ボタン */}
      <Card className="knowledge-cluster p-6">
        <button
          onClick={createRoom}
          disabled={creating}
          className="action-node w-full text-lg py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "作成中..." : "新しいルームを作成"}
        </button>
      </Card>

      {/* ルーム一覧 */}
      <div>
        <h2 className="text-2xl font-bold text-golden mb-4">
          参加可能なルーム
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
                        <Clock size={16} />
                        <span>{getTimeAgo(room.createdAt)}</span>
                      </div>
                      <span>
                        ホスト: {room.host.name || "匿名ユーザー"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono bg-background/50 px-3 py-1 rounded border border-border/50">
                        {room.code}
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
