"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上必要です"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("メールアドレスまたはパスワードが正しくありません")
      }

      router.push("/play/select")
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "ログインに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="knowledge-cluster space-y-4 md:space-y-5 relative z-10">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm md:text-base">メールアドレス</Label>
        <Input id="email" type="email" {...register("email")} disabled={isLoading} className="thought-workspace" />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm md:text-base">パスワード</Label>
        <Input id="password" type="password" {...register("password")} disabled={isLoading} className="thought-workspace" />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="unstable-zone p-3">
          <p className="text-sm md:text-base">{error}</p>
        </div>
      )}

      <button type="submit" className="action-node w-full text-base md:text-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed relative z-20" disabled={isLoading}>
        {isLoading ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  )
}
