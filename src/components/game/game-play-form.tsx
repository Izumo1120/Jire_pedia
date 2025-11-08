"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Term } from "@prisma/client"

type Difficulty = "easy" | "normal" | "hard"

interface GamePlayFormProps {
  term: Term
  userId: string
}

export function GamePlayForm({ term }: GamePlayFormProps) {
  const router = useRouter()
  const [explanation, setExplanation] = useState("")
  const [difficulty, setDifficulty] = useState<Difficulty>("normal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ngWordsFound, setNgWordsFound] = useState<string[]>([])

  const checkNGWords = (text: string) => {
    const lowerText = text.toLowerCase()
    const found: string[] = []

    for (const ngWord of term.ngWords) {
      if (lowerText.includes(ngWord.toLowerCase())) {
        found.push(ngWord)
      }
    }

    setNgWordsFound(found)
    return found.length === 0
  }

  const handleSubmit = async () => {
    if (!explanation.trim()) {
      alert("説明文を入力してください")
      return
    }

    if (ngWordsFound.length > 0) {
      alert("NGワードが含まれています。別の言葉で説明してください。")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/ai/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termId: term.id,
          explanation,
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error("判定に失敗しました")
      }

      const result = await response.json()
      router.push(`/play/result/${result.attemptId}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました")
      setIsSubmitting(false)
    }
  }

  const difficultyInfo = {
    easy: { label: "かんたん", xp: "10 XP", ai: "Gemini 1.5 Flash" },
    normal: { label: "ふつう", xp: "20 XP", ai: "Llama 3.1 8B" },
    hard: { label: "むずかしい", xp: "30 XP", ai: "Llama 3 70B" },
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ヘッダー */}
      <div className="text-center space-y-3 md:space-y-4">
        <h1 className="heading text-3xl md:text-4xl font-bold">
          「<span className="text-primary" style={{ textShadow: '0 0 40px rgba(255, 215, 0, 0.5)' }}>{term.word}</span>」を説明しよう
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {term.category} {term.subcategory && `/ ${term.subcategory}`}
        </p>
      </div>

      <div className="knowledge-cluster p-6 md:p-8 space-y-6 md:space-y-8 relative z-10">
        {/* NGワード */}
        <div>
          <h3 className="heading text-lg md:text-xl font-bold mb-3 md:mb-4">
            使ってはいけない言葉（NGワード）
          </h3>
          <div className="flex flex-wrap gap-2">
            {term.ngWords.map((word) => (
              <span
                key={word}
                className="px-3 py-1 text-sm font-medium rounded bg-red-950/50 border border-red-700/70 text-red-400"
                style={{
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)',
                  textShadow: '0 0 8px rgba(248, 113, 113, 0.3)'
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* 難易度選択 */}
        <div className="relative z-20">
          <h3 className="heading text-lg md:text-xl font-bold mb-3 md:mb-4">難易度を選択</h3>
          <div className="grid grid-cols-3 gap-3">
            {(["easy", "normal", "hard"] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`
                  text-center py-4 px-4 rounded border-2 transition-all relative z-20 cursor-pointer
                  ${difficulty === diff
                    ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                    : 'border-border bg-background/50 hover:bg-background/70 hover:border-primary/30'}
                `}
              >
                <div className="text-base font-bold mb-1">
                  {difficultyInfo[diff].label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {difficultyInfo[diff].xp}
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            対戦相手: {difficultyInfo[difficulty].ai}
          </p>
        </div>

        {/* 説明文入力 */}
        <div className="relative z-20">
          <h3 className="heading text-lg md:text-xl font-bold mb-3 md:mb-4">あなたの説明</h3>
          <textarea
            value={explanation}
            onChange={(e) => {
              const newValue = e.target.value
              setExplanation(newValue)
              checkNGWords(newValue)
            }}
            placeholder="この用語を、NGワードを使わずに説明してください..."
            rows={8}
            disabled={isSubmitting}
            className="thought-workspace w-full min-h-[200px] resize-vertical relative z-20"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {explanation.length} 文字
          </p>
        </div>

        {/* NGワード警告 */}
        {ngWordsFound.length > 0 && (
          <div className="unstable-zone p-4 relative z-20">
            <p className="text-sm md:text-base font-medium">
              ⚠ NGワードが含まれています: {ngWordsFound.join(", ")}
            </p>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !explanation.trim() || ngWordsFound.length > 0}
          className="action-node w-full text-lg md:text-xl py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
        >
          {isSubmitting ? "判定中..." : "AIに挑戦する"}
        </button>
      </div>
    </div>
  )
}