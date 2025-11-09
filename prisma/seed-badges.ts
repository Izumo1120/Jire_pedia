import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const badges = [
  // 挑戦回数バッジ
  {
    name: "初心者",
    description: "初めての挑戦を完了しました",
    icon: "🌱",
    category: "attempts",
    requirement: "1回挑戦する",
    rarity: "common",
  },
  {
    name: "継続は力なり",
    description: "10回の挑戦を完了しました",
    icon: "💪",
    category: "attempts",
    requirement: "10回挑戦する",
    rarity: "common",
  },
  {
    name: "ベテラン",
    description: "50回の挑戦を完了しました",
    icon: "⭐",
    category: "attempts",
    requirement: "50回挑戦する",
    rarity: "rare",
  },
  {
    name: "マスター",
    description: "100回の挑戦を完了しました",
    icon: "🏆",
    category: "attempts",
    requirement: "100回挑戦する",
    rarity: "epic",
  },
  {
    name: "レジェンド",
    description: "500回の挑戦を完了しました",
    icon: "👑",
    category: "attempts",
    requirement: "500回挑戦する",
    rarity: "legendary",
  },

  // レベルバッジ
  {
    name: "レベル10到達",
    description: "レベル10に到達しました",
    icon: "🎯",
    category: "level",
    requirement: "レベル10に到達",
    rarity: "common",
  },
  {
    name: "レベル25到達",
    description: "レベル25に到達しました",
    icon: "🎖️",
    category: "level",
    requirement: "レベル25に到達",
    rarity: "rare",
  },
  {
    name: "レベル50到達",
    description: "レベル50に到達しました",
    icon: "💎",
    category: "level",
    requirement: "レベル50に到達",
    rarity: "epic",
  },

  // ランクバッジ
  {
    name: "シルバーランク",
    description: "シルバーランクに到達しました",
    icon: "🥈",
    category: "rank",
    requirement: "シルバーランク到達",
    rarity: "common",
  },
  {
    name: "ゴールドランク",
    description: "ゴールドランクに到達しました",
    icon: "🥇",
    category: "rank",
    requirement: "ゴールドランク到達",
    rarity: "rare",
  },
  {
    name: "プラチナランク",
    description: "プラチナランクに到達しました",
    icon: "💿",
    category: "rank",
    requirement: "プラチナランク到達",
    rarity: "epic",
  },
  {
    name: "ダイヤモンドランク",
    description: "ダイヤモンドランクに到達しました",
    icon: "💠",
    category: "rank",
    requirement: "ダイヤモンドランク到達",
    rarity: "legendary",
  },

  // 辞書貢献バッジ
  {
    name: "辞書貢献者",
    description: "5つの用語解説を辞書に投稿しました",
    icon: "📝",
    category: "entries",
    requirement: "5つの用語を解説",
    rarity: "common",
  },
  {
    name: "辞書エキスパート",
    description: "20つの用語解説を辞書に投稿しました",
    icon: "📚",
    category: "entries",
    requirement: "20つの用語を解説",
    rarity: "rare",
  },
  {
    name: "辞書マスター",
    description: "50つの用語解説を辞書に投稿しました",
    icon: "📖",
    category: "entries",
    requirement: "50つの用語を解説",
    rarity: "epic",
  },

  // 特殊バッジ
  {
    name: "完璧主義者",
    description: "信頼度95%以上で10回成功しました",
    icon: "✨",
    category: "special",
    requirement: "信頼度95%以上で10回成功",
    rarity: "epic",
  },
  {
    name: "難易度マスター",
    description: "Hardモードで10回成功しました",
    icon: "🔥",
    category: "special",
    requirement: "Hardモードで10回成功",
    rarity: "rare",
  },
]

async function main() {
  console.log("🎖️  バッジデータのシード開始...")

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    })
  }

  console.log(`✅ ${badges.length}個のバッジを作成/更新しました`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
