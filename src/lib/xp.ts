export const BASE_XP = {
  easy: 10,
  normal: 20,
  hard: 30,
} as const

export type Difficulty = keyof typeof BASE_XP

export function calculateXP(difficulty: Difficulty, confidence: number): number {
  const baseXP = BASE_XP[difficulty]
  const confidenceBonus = confidence > 80 ? (confidence - 80) * 0.5 : 0
  return Math.floor(baseXP + confidenceBonus)
}

export function getRequiredXP(level: number): number {
  return level * 100
}

export function checkLevelUp(currentXP: number, currentLevel: number): {
  leveledUp: boolean
  newLevel: number
  remainingXP: number
} {
  const requiredXP = getRequiredXP(currentLevel)

  if (currentXP >= requiredXP) {
    return {
      leveledUp: true,
      newLevel: currentLevel + 1,
      remainingXP: currentXP - requiredXP,
    }
  }

  return {
    leveledUp: false,
    newLevel: currentLevel,
    remainingXP: currentXP,
  }
}

export function getRankFromLevel(level: number): string {
  if (level >= 50) return "Diamond"
  if (level >= 30) return "Platinum"
  if (level >= 15) return "Gold"
  if (level >= 5) return "Silver"
  return "Bronze"
}
