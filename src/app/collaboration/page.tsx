import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CollaborationLobby } from "@/components/collaboration/collaboration-lobby"

export default async function CollaborationPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="nexus-container nexus-section">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="heading text-3xl md:text-4xl lg:text-5xl font-bold text-golden">
            共作モード
          </h1>
          <p className="text-base md:text-lg text-gray-300">
            仲間と協力して用語を説明しよう
          </p>
        </div>

        <CollaborationLobby />
      </div>
    </div>
  )
}
