import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { BattleRoom } from "@/components/battle/battle-room"

export default async function BattleRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { roomId } = await params

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-4xl">
        <BattleRoom roomId={roomId} />
      </div>
    </div>
  )
}
