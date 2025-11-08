import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">アカウント作成</h1>
          <p className="text-sm text-muted-foreground">
            メールアドレスとパスワードを入力してください
          </p>
        </div>
        <RegisterForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
