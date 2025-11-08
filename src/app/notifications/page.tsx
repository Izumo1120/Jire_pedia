import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserNotifications, markAllNotificationsAsRead } from "@/lib/notification"
import { NotificationList } from "@/components/social/notification-list"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const notifications = await getUserNotifications(session.user.id, 50)

  return (
    <div className="nexus-container nexus-section">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold heading text-golden">通知</h1>
        </div>

        <NotificationList initialNotifications={notifications} />
      </div>
    </div>
  )
}
