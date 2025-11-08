import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] md:w-[420px]">
        <div className="flex flex-col space-y-3 text-center">
          <h1 className="heading text-3xl md:text-4xl font-bold text-golden">ログイン</h1>
          <p className="text-sm md:text-base text-muted-foreground">
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
