# Jire-pedia 🎮

**AIを攻略する説明力ゲーム**

専門用語を「その言葉を使わずに」説明し、AIに推測させるゲーム。成功した説明は、みんなで作る知の辞書に刻まれます。

## 特徴

- **3つの難易度**: Easy、Normal、Hard から選択。難しいほど高得点
- **レベルアップシステム**: XPを獲得してレベルアップ、新たな挑戦を解放
- **協創する辞書**: 成功した説明文が集まる、みんなで作る知の辞書
- **Generative Nexus デザイン**: 知的な美しさを追求したUIデザインシステム

## 技術スタック

### フロントエンド
- **Next.js 14+** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4**
- **Generative Nexus Design System** (カスタムデザインシステム)

### バックエンド
- **Next.js API Routes**
- **PostgreSQL**
- **Prisma ORM**
- **NextAuth.js v5** (認証)
- **bcryptjs** (パスワードハッシュ化)

### AI
- **Google Generative AI** (Gemini)
- **OpenAI API** (オプション)
- **Groq SDK** (オプション)

## セットアップ手順

### 前提条件

- Node.js 18以上
- PostgreSQL
- pnpm (推奨) または npm/yarn
- Google AI API キー または OpenAI API キー

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/Jire_pedia.git
cd Jire_pedia
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成:

```env
# データベース接続
DATABASE_URL="postgresql://username:password@localhost:5432/jire_pedia"

# NextAuth.js 設定
NEXTAUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32 で生成推奨
NEXTAUTH_URL="http://localhost:3000"

# AI API (いずれか1つ以上設定)
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
OPENAI_API_KEY="your-openai-api-key"
GROQ_API_KEY="your-groq-api-key"
```

### 4. PostgreSQLデータベースの準備

```bash
# データベース作成
createdb jire_pedia

# または psql で
psql -U postgres
CREATE DATABASE jire_pedia;
\q
```

### 5. Prismaのセットアップ

```bash
# Prisma Client の生成
npx prisma generate

# データベースマイグレーション実行
npx prisma migrate dev

# (オプション) 初期データ投入
pnpm prisma:seed
```

### 6. 開発サーバーの起動

```bash
pnpm dev
```

### 7. ブラウザでアクセス

```
http://localhost:3000
```

## 主要コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 (localhost:3000) |
| `pnpm build` | 本番ビルド |
| `pnpm start` | 本番サーバー起動 |
| `pnpm lint` | ESLint実行 |
| `pnpm prisma:generate` | Prisma Client 生成 |
| `pnpm prisma:push` | データベーススキーマ push |
| `pnpm prisma:seed` | シードデータ投入 |
| `npx prisma studio` | データベースGUI起動 (localhost:5555) |
| `npx prisma migrate dev` | マイグレーション作成・実行 |

## データベーススキーマ

### 主要モデル

- **User**: ユーザー情報、レベル、XP、ランク
- **Term**: 用語情報、カテゴリ、NGワード、統計情報
- **Attempt**: ゲームプレイ履歴、成功/失敗、獲得XP
- **Entry**: 投稿された説明文、難易度別スコア
- **Favorite**: お気に入り用語

詳細は [prisma/schema.prisma](prisma/schema.prisma) を参照してください。

## プロジェクト構造

```
Jire_pedia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ (login, register)
│   │   ├── dictionary/        # 辞書ページ
│   │   ├── play/              # ゲームプレイページ
│   │   ├── profile/           # プロフィールページ
│   │   ├── api/               # API Routes
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # ホームページ
│   │   └── globals.css        # グローバルスタイル (Generative Nexus)
│   ├── components/
│   │   ├── auth/              # 認証コンポーネント
│   │   ├── dictionary/        # 辞書コンポーネント
│   │   ├── game/              # ゲームコンポーネント
│   │   ├── layout/            # レイアウトコンポーネント (Header等)
│   │   ├── nexus/             # Generative Nexus コンポーネント
│   │   └── ui/                # 基本UIコンポーネント
│   ├── lib/
│   │   ├── auth.ts            # NextAuth設定
│   │   ├── prisma.ts          # Prisma Client
│   │   └── ai/                # AI統合ロジック
│   └── types/                 # TypeScript型定義
├── prisma/
│   ├── schema.prisma          # Prismaスキーマ
│   ├── migrations/            # マイグレーションファイル
│   └── seed.ts                # シードデータ
├── public/                    # 静的ファイル
└── package.json
```

## Generative Nexus デザインシステム

このプロジェクトは独自の「Generative Nexus」デザインシステムを採用しています。

### 主要コンセプト

- **光の定義 (Emanations)**: Deep Blue (#0A2540) + Golden Yellow (#FFD700)
- **知の粒子 (Particles)**: Canvas上を流れる知的な文字 (漢字、数式、ギリシャ文字、論理記号)
- **ガラス形態 (Glassmorphism)**: backdrop-filter による半透明レイヤー
- **完全レスポンシブ**: モバイルファースト設計 (320px〜1920px対応)

### 主要CSSクラス

- `.knowledge-cluster`: カード・コンテナ要素
- `.action-node`: ボタン・アクション要素
- `.thought-workspace`: テキストエリア・入力フィールド
- `.knowledge-crystal`: タグ・バッジ要素
- `.unstable-zone`: 警告・注意要素
- `.nexus-container`: レスポンシブコンテナ
- `.nexus-grid`: レスポンシブグリッド (1→2→3カラム)

詳細は [src/app/globals.css](src/app/globals.css) を参照してください。

## トラブルシューティング

### ビルドエラーが発生する場合

```bash
# キャッシュをクリア
rm -rf .next
pnpm dev
```

### データベース接続エラー

```bash
# DATABASE_URL を確認
echo $DATABASE_URL

# PostgreSQL が起動しているか確認
pg_ctl status

# または
sudo service postgresql status
```

### マイグレーションエラー

```bash
# データベースをリセット (注意: すべてのデータが削除されます)
npx prisma migrate reset

# または手動でマイグレーション
npx prisma migrate deploy
```

### Prisma Client が生成されない

```bash
# 手動で生成
npx prisma generate

# node_modules を削除して再インストール
rm -rf node_modules
pnpm install
```

## デプロイ

### Vercel (推奨)

1. [Vercel](https://vercel.com) にプロジェクトをインポート
2. 環境変数を設定 (DATABASE_URL, NEXTAUTH_SECRET, API Keys)
3. PostgreSQL データベースを用意 (Vercel Postgres, Supabase, Neon 等)
4. デプロイ

### 本番環境の環境変数

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_GENERATIVE_AI_API_KEY="..."
```

## ライセンス

ISC

## 作者

Jire-pedia Development Team

---

**楽しんでプレイしてください！🎮✨**
# Jire_pedia
