import { GoogleGenerativeAI } from "@google/generative-ai"
import Groq from "groq-sdk"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export interface JudgementResult {
  aiGuess: string
  confidence: number
  reasoning: string
  success: boolean
}

function createJudgementPrompt(explanation: string): string {
  return `あなたは用語推測AIです。以下の説明文が何の用語を説明しているか推測してください。

説明文: ${explanation}

以下の形式で回答してください（JSON形式で）:
{
  "guess": "推測した用語名",
  "confidence": 確信度（0-100の数値）,
  "reasoning": "なぜそう推測したかの理由"
}

重要: 回答は必ずJSON形式のみで、説明文や追加のテキストは含めないでください。`
}

export async function judgeWithGemini(
  explanation: string,
  correctAnswer: string
): Promise<JudgementResult> {
  // Using Gemini 2.5 Flash - best model for price-performance
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  const result = await model.generateContent(createJudgementPrompt(explanation))
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("Failed to parse AI response")

  const parsed = JSON.parse(jsonMatch[0])
  const success = parsed.guess.toLowerCase().trim() === correctAnswer.toLowerCase().trim()

  return {
    aiGuess: parsed.guess,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
    success,
  }
}

export async function judgeWithGroq(
  explanation: string,
  correctAnswer: string,
  modelId: "llama-3.1-8b-instant" | "llama-3-70b-8192"
): Promise<JudgementResult> {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: createJudgementPrompt(explanation) }],
    model: modelId,
    temperature: 0.3,
    max_tokens: 500,
  })

  const text = completion.choices[0]?.message?.content
  if (!text) throw new Error("No response from AI")

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("Failed to parse AI response")

  const parsed = JSON.parse(jsonMatch[0])
  const success = parsed.guess.toLowerCase().trim() === correctAnswer.toLowerCase().trim()

  return {
    aiGuess: parsed.guess,
    confidence: parsed.confidence,
    reasoning: parsed.reasoning,
    success,
  }
}
