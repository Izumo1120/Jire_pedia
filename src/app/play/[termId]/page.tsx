import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GamePlayForm } from "@/components/game/game-play-form"

export default async function GamePlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ termId: string }>
  searchParams: Promise<{ daily?: string; challengeId?: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { termId } = await params
  const { challengeId } = await searchParams

  const term = await prisma.term.findUnique({
    where: { id: termId },
  })

  if (!term) {
    redirect("/play/select")
  }

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-3xl">
        <GamePlayForm
          term={term}
          userId={session.user.id}
          dailyChallengeId={challengeId}
        />
      </div>
    </div>
  )
}
