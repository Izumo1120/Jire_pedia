import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { judgeWithGemini, judgeWithGroq } from "@/lib/ai";
import { checkNGWords } from "@/lib/ng-word-checker";
import { calculateXP, checkLevelUp, getRankFromLevel } from "@/lib/xp";
import { z } from "zod";

const judgeSchema = z.object({
  termId: z.string(),
  explanation: z.string().min(1),
  difficulty: z.enum(["easy", "normal", "hard"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const { termId, explanation, difficulty } = judgeSchema.parse(body);

    // 用語を取得
    const term = await prisma.term.findUnique({
      where: { id: termId },
    });

    if (!term) {
      return NextResponse.json(
        { message: "用語が見つかりません" },
        { status: 404 }
      );
    }

    // NGワードチェック
    const ngCheck = checkNGWords(explanation, term.ngWords);
    if (ngCheck.hasNGWord) {
      return NextResponse.json(
        { message: "NGワードが含まれています", ngWords: ngCheck.foundWords },
        { status: 400 }
      );
    }

    // AIで判定
    let result;
    let aiModel = "";

    if (difficulty === "easy") {
      aiModel = "gemini-2.5-flash";
      result = await judgeWithGemini(explanation, term.word);
    } else if (difficulty === "normal") {
      aiModel = "llama-3.1-8b-instant";
      result = await judgeWithGroq(
        explanation,
        term.word,
        "llama-3.1-8b-instant"
      );
    } else {
      aiModel = "llama-3-70b-8192";
      result = await judgeWithGroq(explanation, term.word, "llama-3-70b-8192");
    }

    // XP計算
    const xpEarned = result.success
      ? calculateXP(difficulty, result.confidence)
      : 0;

    // Attemptを保存
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        termId: term.id,
        difficulty,
        aiModel,
        explanation,
        success: result.success,
        confidence: result.confidence,
        aiResponse: result.aiGuess,
        aiComment: result.reasoning,
        xpEarned,
      },
    });

    // ユーザーのXPとレベルを更新 & Entryを作成
    if (result.success) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (user) {
        const newXP = user.xp + xpEarned;
        const levelUpCheck = checkLevelUp(newXP, user.level);

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            xp: levelUpCheck.remainingXP,
            level: levelUpCheck.newLevel,
            rank: getRankFromLevel(levelUpCheck.newLevel),
          },
        })

        // 成功した説明をEntryとして辞書に投稿
        console.log("📝 Entry作成処理開始:", {
          userId: session.user.id,
          termId: term.id,
          confidence: result.confidence,
        })

        // 既存のEntryがあるかチェック
        const existingEntry = await prisma.entry.findFirst({
          where: {
            userId: session.user.id,
            termId: term.id,
          },
        })

        if (existingEntry) {
          console.log("🔄 既存Entry発見:", existingEntry.id, "confidence:", existingEntry.confidence)
          // 既存のEntryがある場合、より高いconfidenceの場合のみ更新
          if (result.confidence > existingEntry.confidence) {
            const updated = await prisma.entry.update({
              where: { id: existingEntry.id },
              data: {
                explanation,
                difficulty,
                confidence: result.confidence,
                version: { increment: 1 },
              },
            })
            console.log("✅ Entry更新成功:", updated.id)
          } else {
            console.log("⏭️  更新スキップ: 既存のconfidenceの方が高い")
          }
        } else {
          // 新規Entry作成
          const newEntry = await prisma.entry.create({
            data: {
              userId: session.user.id,
              termId: term.id,
              explanation,
              difficulty,
              confidence: result.confidence,
            },
          })
          console.log("✨ 新規Entry作成成功:", newEntry.id)
        }
      }
    }

    // 用語の統計を更新
    await prisma.term.update({
      where: { id: termId },
      data: {
        totalAttempts: { increment: 1 },
        totalSuccess: result.success ? { increment: 1 } : undefined,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      success: result.success,
      aiGuess: result.aiGuess,
      confidence: result.confidence,
      xpEarned,
    });
  } catch (error) {
    console.error("Judge error:", error);
    return NextResponse.json(
      {
        message: "判定に失敗しました",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
