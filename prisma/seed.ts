import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const terms = [
  {
    word: "光合成",
    category: "理科",
    subcategory: "生物",
    officialDef: "植物が光エネルギーを使って水と二酸化炭素から糖を合成する過程",
    ngWords: ["光合成", "植物", "光", "エネルギー", "葉緑体"],
    tags: ["高校生物", "中学理科"],
  },
  {
    word: "民主主義",
    category: "社会",
    subcategory: "政治",
    officialDef: "国民が主権を持ち、政治的決定に参加する政治体制",
    ngWords: ["民主主義", "democracy", "主権", "国民"],
    tags: ["中学公民", "高校政治経済"],
  },
  {
    word: "円周率",
    category: "数学",
    subcategory: "幾何",
    officialDef: "円の円周の長さと直径の比を表す定数で、約3.14159...",
    ngWords: ["円周率", "π", "パイ", "3.14"],
    tags: ["中学数学"],
  },
  {
    word: "重力",
    category: "理科",
    subcategory: "物理",
    officialDef: "質量を持つ物体間に働く引力",
    ngWords: ["重力", "gravity", "引力", "万有引力"],
    tags: ["中学理科", "高校物理"],
  },
  {
    word: "憲法",
    category: "社会",
    subcategory: "法律",
    officialDef: "国家の基本的な組織や統治の原理を定めた最高法規",
    ngWords: ["憲法", "constitution", "最高法規"],
    tags: ["中学公民"],
  },
  {
    word: "細胞",
    category: "理科",
    subcategory: "生物",
    officialDef: "生物の基本的な構造単位",
    ngWords: ["細胞", "cell", "核", "細胞膜"],
    tags: ["中学理科", "高校生物"],
  },
  {
    word: "摩擦",
    category: "理科",
    subcategory: "物理",
    officialDef: "接触している物体同士が相対運動をするとき、その運動を妨げる力",
    ngWords: ["摩擦", "friction", "摩擦力"],
    tags: ["中学理科", "高校物理"],
  },
  {
    word: "平方根",
    category: "数学",
    subcategory: "代数",
    officialDef: "ある数を2乗するとその数になる値",
    ngWords: ["平方根", "ルート", "√", "2乗"],
    tags: ["中学数学"],
  },
  {
    word: "三権分立",
    category: "社会",
    subcategory: "政治",
    officialDef: "立法・行政・司法の三つの権力を分離し、互いに抑制する制度",
    ngWords: ["三権分立", "立法", "行政", "司法"],
    tags: ["中学公民"],
  },
  {
    word: "化学反応",
    category: "理科",
    subcategory: "化学",
    officialDef: "物質が別の物質に変化する現象",
    ngWords: ["化学反応", "反応", "化学変化", "変化"],
    tags: ["中学理科", "高校化学"],
  },
  {
    word: "面積",
    category: "数学",
    subcategory: "幾何",
    officialDef: "平面図形の広さを表す量",
    ngWords: ["面積", "area", "広さ"],
    tags: ["小学算数", "中学数学"],
  },
  {
    word: "地震",
    category: "理科",
    subcategory: "地学",
    officialDef: "地下の岩盤が急激にずれることで発生する地面の揺れ",
    ngWords: ["地震", "earthquake", "震度", "マグニチュード"],
    tags: ["中学理科"],
  },
  {
    word: "税金",
    category: "社会",
    subcategory: "経済",
    officialDef: "国や地方公共団体が公共サービスを提供するために徴収するお金",
    ngWords: ["税金", "税", "税収"],
    tags: ["中学公民"],
  },
  {
    word: "DNA",
    category: "理科",
    subcategory: "生物",
    officialDef: "遺伝情報を保存する生体高分子",
    ngWords: ["DNA", "遺伝子", "デオキシリボ核酸"],
    tags: ["高校生物"],
  },
  {
    word: "確率",
    category: "数学",
    subcategory: "統計",
    officialDef: "ある事象が起こりやすさを数値で表したもの",
    ngWords: ["確率", "probability", "起こりやすさ"],
    tags: ["中学数学", "高校数学"],
  },
  {
    word: "浸透圧",
    category: "理科",
    subcategory: "化学",
    officialDef: "半透膜を隔てた溶液の濃度差によって生じる圧力",
    ngWords: ["浸透圧", "浸透", "osmosis"],
    tags: ["高校化学", "高校生物"],
  },
  {
    word: "比例",
    category: "数学",
    subcategory: "関数",
    officialDef: "一方の量が増えると、もう一方の量も一定の割合で増える関係",
    ngWords: ["比例", "比例する", "proportional"],
    tags: ["小学算数", "中学数学"],
  },
  {
    word: "ルネサンス",
    category: "社会",
    subcategory: "歴史",
    officialDef: "14世紀から16世紀にかけてヨーロッパで起こった文化運動",
    ngWords: ["ルネサンス", "Renaissance", "文芸復興"],
    tags: ["中学歴史", "高校世界史"],
  },
  {
    word: "イオン",
    category: "理科",
    subcategory: "化学",
    officialDef: "原子が電子を失ったり受け取ったりして電荷を帯びたもの",
    ngWords: ["イオン", "ion", "電荷"],
    tags: ["中学理科", "高校化学"],
  },
  {
    word: "関数",
    category: "数学",
    subcategory: "関数",
    officialDef: "ある値を入力すると、決まった値が出力される対応関係",
    ngWords: ["関数", "function", "対応"],
    tags: ["中学数学", "高校数学"],
  },
]

async function main() {
  console.log('Start seeding...')

  for (const term of terms) {
    await prisma.term.create({ data: term })
  }

  console.log(`Seeded ${terms.length} terms`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
