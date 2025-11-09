import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/social/notification-dropdown"
import { Gamepad2 } from "lucide-react"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex gap-4 md:gap-8 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 md:w-7 md:h-7 text-primary" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))' }} />
            <span className="text-xl md:text-2xl font-bold heading" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.15)' }}>
              Jire-pedia
            </span>
          </Link>
          {session && (
            <nav className="flex gap-4 md:gap-6">
              <Link
                href="/daily-challenge"
                className="flex items-center text-sm md:text-base font-medium transition-all duration-300 hover:text-primary hover:scale-105"
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              >
                デイリー
              </Link>
              <Link
                href="/play/select"
                className="flex items-center text-sm md:text-base font-medium transition-all duration-300 hover:text-primary hover:scale-105"
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              >
                プレイ
              </Link>
              <Link
                href="/collaboration"
                className="flex items-center text-sm md:text-base font-medium transition-all duration-300 hover:text-primary hover:scale-105"
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              >
                共作
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center text-sm md:text-base font-medium transition-all duration-300 hover:text-primary hover:scale-105"
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              >
                ランキング
              </Link>
              <Link
                href="/dictionary"
                className="flex items-center text-sm md:text-base font-medium transition-all duration-300 hover:text-primary hover:scale-105"
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              >
                辞書
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <NotificationDropdown />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {session.user?.name || "ユーザー"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">プロフィール</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/play/select">プレイ</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dictionary">辞書</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/api/auth/signout" method="POST">
                    <button type="submit" className="w-full text-left">
                      ログアウト
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2 md:gap-3">
              <Link href="/login" className="action-node text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
                ログイン
              </Link>
              <Link href="/register" className="action-node text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
                新規登録
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
