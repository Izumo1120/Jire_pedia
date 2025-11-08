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
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            「<span className="text-yellow-500">{term.word}</span>」を説明しよう
          </h1>
          <p className="text-sm text-gray-400">
            {term.category} {term.subcategory && `/ ${term.subcategory}`}
          </p>
        </div>

        <div className="space-y-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
          {/* NGワード */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">
              使ってはいけない言葉（NGワード）
            </h3>
            <div className="flex flex-wrap gap-2">
              {term.ngWords.map((word) => (
                <span
                  key={word}
                  className="px-3 py-1 bg-red-900/30 border border-red-700 rounded text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* 難易度選択 */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">難易度を選択</h3>
            <div className="grid grid-cols-3 gap-3">
              {(["easy", "normal", "hard"] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`
                    text-center py-4 px-4 rounded border-2 transition-all
                    ${difficulty === diff 
                      ? 'border-yellow-500 bg-yellow-500/20' 
                      : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'}
                  `}
                >
                  <div className="text-base font-bold mb-1">
                    {difficultyInfo[diff].label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {difficultyInfo[diff].xp}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-3 text-center">
              対戦相手: {difficultyInfo[difficulty].ai}
            </p>
          </div>

          {/* 説明文入力 */}
          <div>
            <h3 className="font-semibold mb-4 text-lg"><a href=""></a>あなたの説明</h3>
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
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-vertical focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-sm text-gray-400 mt-2">
              {explanation.length} 文字
            </p>
          </div>

          {/* NGワード警告 */}
          {ngWordsFound.length > 0 && (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded">
              <p className="text-sm text-red-400 font-medium">
                ⚠ NGワードが含まれています: {ngWordsFound.join(", ")}
              </p>
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !explanation.trim() || ngWordsFound.length > 0}
            className="w-full text-lg py-4 font-bold rounded border-2 border-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "判定中..." : "AIに挑戦する"}
          </button>
        </div>
      </div>
    </div>
  )
}