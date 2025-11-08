import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">ログイン</h1>
          <p className="text-sm text-muted-foreground">
            メールアドレスとパスワードを入力してください
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
