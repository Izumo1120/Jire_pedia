import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DailyChallengeCard } from "@/components/daily-challenge/daily-challenge-card"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DailyChallengePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if today's challenge already exists
  let dailyChallenge = await prisma.dailyChallenge.findUnique({
    where: { date: today },
    include: {
      term: true,
      dailyChallengeAttempts: {
        where: { userId: session.user.id },
      },
    },
  })

  // If no challenge exists for today, create one
  if (!dailyChallenge) {
    // Select a random term for today's challenge
    const termCount = await prisma.term.count()

    if (termCount === 0) {
      return (
        <div className="nexus-container nexus-section">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">
              用語が見つかりませんでした
            </p>
          </div>
        </div>
      )
    }

    const skip = Math.floor(Math.random() * termCount)
    const randomTerm = await prisma.term.findFirst({
      skip,
      take: 1,
    })

    if (!randomTerm) {
      return (
        <div className="nexus-container nexus-section">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">
              用語が見つかりませんでした
            </p>
          </div>
        </div>
      )
    }

    // Create today's daily challenge
    dailyChallenge = await prisma.dailyChallenge.create({
      data: {
        date: today,
        termId: randomTerm.id,
      },
      include: {
        term: true,
        dailyChallengeAttempts: {
          where: { userId: session.user.id },
        },
      },
    })
  }

  const hasCompleted = dailyChallenge.dailyChallengeAttempts.length > 0

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold text-golden">
            デイリーチャレンジ
          </h1>
          <p className="text-base md:text-lg text-gray-300">
            毎日更新される特別なお題に挑戦しよう
          </p>
        </div>

        <DailyChallengeCard
          dailyChallenge={{
            id: dailyChallenge.id,
            date: dailyChallenge.date,
            term: dailyChallenge.term,
            hasCompleted,
          }}
        />
      </div>
    </div>
  )
}
