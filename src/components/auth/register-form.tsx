"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const registerSchema = z.object({
  name: z.string().min(2, "名前は2文字以上必要です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上必要です"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "登録に失敗しました")
      }

      router.push("/login?registered=true")
    } catch (error) {
      setError(error instanceof Error ? error.message : "登録に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="knowledge-cluster space-y-4 md:space-y-5 relative z-10">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm md:text-base">名前</Label>
        <Input id="name" {...register("name")} disabled={isLoading} className="thought-workspace" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm md:text-base">パスワード（確認）</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} disabled={isLoading} className="thought-workspace" />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      {error && (
        <div className="unstable-zone p-3">
          <p className="text-sm md:text-base">{error}</p>
        </div>
      )}

      <button type="submit" className="action-node w-full text-base md:text-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed relative z-20" disabled={isLoading}>
        {isLoading ? "登録中..." : "登録"}
      </button>
    </form>
  )
}
