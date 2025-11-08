import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] md:w-[420px]">
        <div className="flex flex-col space-y-3 text-center">
          <h1 className="heading text-3xl md:text-4xl font-bold text-golden">アカウント作成</h1>
          <p className="text-sm md:text-base text-muted-foreground">
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
