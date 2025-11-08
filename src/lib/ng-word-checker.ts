export function checkNGWords(text: string, ngWords: string[]): {
  hasNGWord: boolean
  foundWords: string[]
} {
  const lowerText = text.toLowerCase()
  const foundWords: string[] = []

  for (const ngWord of ngWords) {
    if (lowerText.includes(ngWord.toLowerCase())) {
      foundWords.push(ngWord)
    }
  }

  return {
    hasNGWord: foundWords.length > 0,
    foundWords,
  }
}
