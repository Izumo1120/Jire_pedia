import { prisma } from "@/lib/prisma"

// バッジの条件をチェック
export async function checkAndAwardBadges(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attempts: {
          where: { success: true },
        },
        entries: true,
        userBadges: {
          include: { badge: true },
        },
      },
    })

    if (!user) return

    const newBadges: string[] = []

    // 既に獲得済みのバッジIDリスト
    const earnedBadgeIds = new Set(user.userBadges.map((ub) => ub.badge.id))

    // すべてのバッジを取得
    const allBadges = await prisma.badge.findMany()

    for (const badge of allBadges) {
      // 既に獲得済みならスキップ
      if (earnedBadgeIds.has(badge.id)) continue

      let shouldAward = false

      // バッジの条件をチェック
      switch (badge.name) {
        case "初心者":
          shouldAward = user.attempts.length >= 1
          break

        case "継続は力なり":
          shouldAward = user.attempts.length >= 10
          break

        case "ベテラン":
          shouldAward = user.attempts.length >= 50
          break

        case "マスター":
          shouldAward = user.attempts.length >= 100
          break

        case "レジェンド":
          shouldAward = user.attempts.length >= 500
          break

        case "レベル10到達":
          shouldAward = user.level >= 10
          break

        case "レベル25到達":
          shouldAward = user.level >= 25
          break

        case "レベル50到達":
          shouldAward = user.level >= 50
          break

        case "シルバーランク":
          shouldAward = user.rank === "Silver" || user.level >= 5
          break

        case "ゴールドランク":
          shouldAward = user.rank === "Gold" || user.level >= 15
          break

        case "プラチナランク":
          shouldAward = user.rank === "Platinum" || user.level >= 30
          break

        case "ダイヤモンドランク":
          shouldAward = user.rank === "Diamond" || user.level >= 50
          break

        case "辞書貢献者":
          shouldAward = user.entries.length >= 5
          break

        case "辞書エキスパート":
          shouldAward = user.entries.length >= 20
          break

        case "辞書マスター":
          shouldAward = user.entries.length >= 50
          break

        case "完璧主義者":
          // 信頼度95%以上の成功を10回
          const highConfidenceAttempts = await prisma.attempt.count({
            where: {
              userId,
              success: true,
              confidence: {
                gte: 95,
              },
            },
          })
          shouldAward = highConfidenceAttempts >= 10
          break

        case "難易度マスター":
          // Hardモードで10回成功
          const hardModeSuccesses = await prisma.attempt.count({
            where: {
              userId,
              success: true,
              difficulty: "hard",
            },
          })
          shouldAward = hardModeSuccesses >= 10
          break

        default:
          break
      }

      if (shouldAward) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        })
        newBadges.push(badge.name)
      }
    }

    return newBadges
  } catch (error) {
    console.error("Error checking badges:", error)
    return []
  }
}
