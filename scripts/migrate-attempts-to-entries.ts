/**
 * 既存の成功したAttemptsからEntryを作成するマイグレーションスクリプト
 *
 * 実行方法:
 * npx tsx scripts/migrate-attempts-to-entries.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 既存の成功したAttemptsからEntryを作成します...")

  // 成功したAttemptsを取得
  const successfulAttempts = await prisma.attempt.findMany({
    where: {
      success: true,
    },
    orderBy: {
      confidence: "desc",
    },
  })

  console.log(`✅ ${successfulAttempts.length}件の成功したAttemptsを見つけました`)

  let createdCount = 0
  let skippedCount = 0

  // ユーザー×用語の組み合わせごとに最も高いconfidenceのAttemptからEntryを作成
  const userTermMap = new Map<string, typeof successfulAttempts[0]>()

  for (const attempt of successfulAttempts) {
    const key = `${attempt.userId}-${attempt.termId}`
    const existing = userTermMap.get(key)

    if (!existing || attempt.confidence > existing.confidence) {
      userTermMap.set(key, attempt)
    }
  }

  console.log(`📊 ${userTermMap.size}件のユニークなユーザー×用語の組み合わせがあります`)

  for (const [key, attempt] of userTermMap) {
    try {
      // 既にEntryが存在するかチェック
      const existingEntry = await prisma.entry.findFirst({
        where: {
          userId: attempt.userId,
          termId: attempt.termId,
        },
      })

      if (existingEntry) {
        console.log(`⏭️  スキップ: ユーザー ${attempt.userId.slice(0, 8)}... の用語 ${attempt.termId.slice(0, 8)}... は既にEntryが存在します`)
        skippedCount++
        continue
      }

      // Entryを作成
      await prisma.entry.create({
        data: {
          userId: attempt.userId,
          termId: attempt.termId,
          explanation: attempt.explanation,
          difficulty: attempt.difficulty,
          confidence: attempt.confidence,
        },
      })

      console.log(`✨ 作成: ユーザー ${attempt.userId.slice(0, 8)}... の用語 ${attempt.termId.slice(0, 8)}... (confidence: ${attempt.confidence})`)
      createdCount++
    } catch (error) {
      console.error(`❌ エラー: ${key}`, error)
    }
  }

  console.log("\n🎉 マイグレーション完了!")
  console.log(`📝 作成: ${createdCount}件`)
  console.log(`⏭️  スキップ: ${skippedCount}件`)
}

main()
  .catch((e) => {
    console.error("❌ マイグレーション失敗:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
