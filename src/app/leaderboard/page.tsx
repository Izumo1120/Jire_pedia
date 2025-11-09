import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LeaderboardTabs } from "@/components/leaderboard/leaderboard-tabs"

export default async function LeaderboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold text-golden">
            ランキング
          </h1>
          <p className="text-base md:text-lg text-gray-300">
            トッププレイヤーと競い合おう
          </p>
        </div>

        <LeaderboardTabs />
      </div>
    </div>
  )
}
