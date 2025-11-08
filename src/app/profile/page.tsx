import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getRequiredXP } from "@/lib/xp"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      attempts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          term: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const totalAttempts = await prisma.attempt.count({
    where: { userId: user.id },
  })

  const successfulAttempts = await prisma.attempt.count({
    where: { userId: user.id, success: true },
  })

  const successRate = totalAttempts > 0
    ? Math.round((successfulAttempts / totalAttempts) * 100)
    : 0

  const requiredXP = getRequiredXP(user.level)
  const xpProgress = (user.xp / requiredXP) * 100

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
          <p className="text-lg text-muted-foreground">{user.email}</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">レベル</p>
                <p className="text-3xl font-bold">Lv. {user.level}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {user.rank}
              </Badge>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">経験値</span>
                <span className="text-sm font-semibold">
                  {user.xp} / {requiredXP} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalAttempts}</p>
              <p className="text-sm text-muted-foreground">挑戦回数</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{successfulAttempts}</p>
              <p className="text-sm text-muted-foreground">成功回数</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className={`text-3xl font-bold ${successRate > 50 ? "text-green-600" : "text-orange-600"}`}>
                {successRate}%
              </p>
              <p className="text-sm text-muted-foreground">成功率</p>
            </div>
          </Card>
        </div>

        {user.attempts.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">最近の挑戦</h2>
            <div className="space-y-3">
              {user.attempts.map((attempt) => (
                <Card key={attempt.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">
                          {attempt.term.word}
                        </span>
                        {attempt.success ? (
                          <Badge variant="default" className="bg-green-600">成功</Badge>
                        ) : (
                          <Badge variant="destructive">失敗</Badge>
                        )}
                        <Badge variant="outline">{attempt.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {attempt.term.category}
                        {attempt.term.subcategory && ` / ${attempt.term.subcategory}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">獲得XP</p>
                      <p className="text-xl font-bold">+{attempt.xpEarned}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
