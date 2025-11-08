# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jire-pedia** is an AI-powered explanation game where users explain specialized terms without using specific forbidden words (NG words). The AI judges the explanation and awards XP based on difficulty and confidence. Successful explanations are saved to a collaborative knowledge dictionary.

**Tech Stack**: Next.js 14+ (App Router), React 19, TypeScript, PostgreSQL, Prisma, NextAuth.js v5, Tailwind CSS v4, Google Generative AI (Gemini), Groq SDK.

## Development Commands

```bash
# Setup
pnpm install                        # Install dependencies
npx prisma generate                 # Generate Prisma Client (required after schema changes)
npx prisma migrate dev              # Create and run migrations
pnpm prisma:seed                    # Seed initial term data

# Development
pnpm dev                            # Start dev server (localhost:3000)
npx prisma studio                   # Open database GUI (localhost:5555)

# Docker (includes PostgreSQL)
docker-compose up                   # Start full stack (PostgreSQL + app)
docker-compose up db                # Start only PostgreSQL

# Build
pnpm build                          # Production build
pnpm start                          # Production server
pnpm lint                           # Run ESLint
```

## Architecture Essentials

### Next.js App Router Structure

- **Route Groups**: `(auth)` contains login/register pages - grouped for layout purposes
- **Server Components**: Default for all pages; use `"use client"` only when needed (forms, state, events)
- **Data Fetching**: Direct Prisma queries in Server Components, not API routes for reads
- **Dynamic Routes**: `[termId]`, `[attemptId]` use async params (Promise-based in Next.js 14+)

### Authentication Flow (NextAuth.js v5)

- **Configuration**: [src/lib/auth.ts](src/lib/auth.ts) - Credentials provider with bcryptjs hashing
- **Session Strategy**: JWT-based (not database sessions)
- **Protected Routes**: Use `auth()` function + redirect pattern:
  ```typescript
  import { auth } from "@/lib/auth"
  import { redirect } from "next/navigation"

  const session = await auth()
  if (!session) redirect("/login")
  ```
- **Session Data**: Custom callbacks add `userId` to session object (see type extension in [src/types/next-auth.d.ts](src/types/next-auth.d.ts))

### Game Logic Flow

1. **Term Selection**: [src/app/play/select/page.tsx](src/app/play/select/page.tsx) - Random term query with category filtering
2. **Play Page**: [src/app/play/[termId]/page.tsx](src/app/play/[termId]/page.tsx) - Fetches term with ngWords
3. **Client Form**: [src/components/game/game-play-form.tsx](src/components/game/game-play-form.tsx) - Real-time NG word validation
4. **AI Judgment**: POST to [src/app/api/ai/judge/route.ts](src/app/api/ai/judge/route.ts)
   - Server-side NG word validation
   - AI model selection based on difficulty (Easy: Gemini 1.5 Flash, Normal: Llama 3.1 8B, Hard: Llama 3 70B)
   - Parse JSON response: `{ "guess": "...", "confidence": 0-100, "comment": "..." }`
   - Database updates: Create Attempt, update User XP/level, update Term stats
5. **Result Display**: [src/app/play/result/[attemptId]/page.tsx](src/app/play/result/[attemptId]/page.tsx) - Shows AI judgment and XP earned

### XP and Leveling System

Logic in [src/lib/xp.ts](src/lib/xp.ts):

- **Base XP**: Easy (10), Normal (20), Hard (30)
- **Confidence Bonus**: If confidence > 80, add `(confidence - 80) * 0.5`
- **Level Formula**: `level * 100 XP` required to level up
- **Rank Progression**: Bronze → Silver (Lv 5) → Gold (Lv 15) → Platinum (Lv 30) → Diamond (Lv 50)
- **XP Rollover**: Excess XP carries over after level-up

### AI Integration ([src/lib/ai.ts](src/lib/ai.ts))

Multi-provider approach:
- **Google Generative AI** (Gemini): Easy difficulty, fast inference
- **Groq** (Llama models): Normal/Hard difficulties, higher quality reasoning

Response parsing:
- Extract JSON block from markdown code fence (```json ... ```)
- Validate structure: `{ guess: string, confidence: number, comment: string }`
- Fallback to regex extraction if JSON parsing fails

### Database Schema (Prisma)

**Core Models** ([prisma/schema.prisma](prisma/schema.prisma)):

- **User**: Stores XP, level, rank, authentication credentials
- **Term**: Word, category, ngWords array, tags array, statistics (totalAttempts, totalSuccess)
- **Attempt**: Full game attempt record (explanation, AI response, success/failure, XP earned)
- **Entry**: (Partially implemented) Featured explanations with difficulty scores and crown system
- **Favorite**: (Schema exists, UI not implemented) User term favorites

**Key Relationships**:
- User → Attempts (1:many)
- User → Entries (1:many)
- Term → Attempts (1:many)
- Term → Entries (1:many)

**Important**: All primary keys use CUID format. Use `@default(cuid())` for new models.

## Generative Nexus Design System

Custom design philosophy emphasizing "knowledge visualization" through glowing particles and glassmorphism.

### Core CSS Classes ([src/app/globals.css](src/app/globals.css))

Apply these semantic classes instead of utility-only Tailwind:

- **`.knowledge-cluster`**: Cards, containers (glassmorphism, golden border, hover glow)
- **`.action-node`**: Buttons, CTAs (gradient background, hover lift + glow)
- **`.thought-workspace`**: Textareas, input fields (focus glow effect)
- **`.knowledge-crystal`**: Tags, badges (pulsing glow animation)
- **`.unstable-zone`**: Warnings, errors (red accent, vibration animation)
- **`.nexus-container`**: Responsive container (max-width breakpoints)
- **`.nexus-grid`**: Responsive grid (1→2→3 columns at breakpoints)
- **`.nexus-section`**: Vertical spacing (responsive padding)

### Color Palette

- **Background**: Deep Blue `#0A2540`
- **Primary/Accent**: Golden Yellow `#FFD700`
- **Foreground**: Off-white `#F5F5F5`
- **Muted**: `rgba(255, 255, 255, 0.75)`
- **Border**: `rgba(255, 215, 0, 0.3)`

### Typography

- **Headings**: `M PLUS Rounded 1c` (bold, 700 weight)
- **Body**: `Noto Sans JP` (400/500/700 weights)
- **Responsive Sizing**: `clamp()` for fluid scaling (e.g., `clamp(1.75rem, 5vw, 3rem)` for h1)
- **Text Shadows**: All text has subtle shadows for readability against animated background

### Canvas Background ([src/components/nexus/nexus-canvas.tsx](src/components/nexus/nexus-canvas.tsx))

Animated particle system:
- **Character Types**: Kanji (weighted 3x), math symbols (2x), Greek letters (1.5x), logic symbols (1x), kana (0.5x)
- **Particle Count**: Responsive 30-80 particles based on viewport area (`area / 25000`)
- **Connections**: Lines drawn between particles within 150px distance
- **Performance**: Uses `requestAnimationFrame` for smooth 60fps animation

## Important Patterns

### Type Safety

- **Zod Validation**: All API inputs validated with Zod schemas (see [src/app/api/ai/judge/route.ts](src/app/api/ai/judge/route.ts))
- **TypeScript Strict Mode**: Enabled in tsconfig.json
- **Prisma Types**: Auto-generated; re-run `npx prisma generate` after schema changes

### Environment Variables

Required for development (.env):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/jire_pedia"
NEXTAUTH_SECRET="your-secret"                    # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_GENERATIVE_AI_API_KEY="your-key"          # For Easy difficulty
GROQ_API_KEY="your-key"                          # For Normal/Hard difficulty
```

### Prisma Client Singleton

Always import from [src/lib/prisma.ts](src/lib/prisma.ts), never instantiate directly:
```typescript
import { prisma } from "@/lib/prisma"
```

This ensures single instance across hot reloads in development.

### Error Handling in API Routes

Standard pattern:
```typescript
try {
  // Logic here
  return NextResponse.json({ success: true, data: ... })
} catch (error) {
  console.error("Error:", error)
  return NextResponse.json(
    { error: "Japanese error message for users" },
    { status: 500 }
  )
}
```

### Component Organization

- **`src/components/ui/`**: shadcn/ui base components (Button, Card, Badge, etc.)
- **`src/components/game/`**: Game-specific components (GamePlayForm, etc.)
- **`src/components/auth/`**: Authentication forms
- **`src/components/layout/`**: Header, navigation
- **`src/components/nexus/`**: Generative Nexus design system components

## Critical Files Reference

- **`src/lib/auth.ts`**: NextAuth configuration, session callbacks
- **`src/lib/ai.ts`**: AI judgment logic, multi-provider support
- **`src/lib/xp.ts`**: XP calculation, level-up logic, rank determination
- **`src/lib/prisma.ts`**: Database client singleton
- **`src/app/api/ai/judge/route.ts`**: Core game logic orchestrator
- **`src/app/layout.tsx`**: Root layout with NexusCanvas and SessionProvider
- **`src/app/globals.css`**: Complete Generative Nexus design system (446 lines)

## Known Limitations

- **No Transactions**: Judge route updates User + Term + Attempt separately (consider Prisma transactions)
- **Entry System**: Database schema exists but UI not implemented (crown system, difficulty scores)
- **Favorites**: Model exists but no UI for adding/removing favorites
- **No Rate Limiting**: API routes lack rate limiting protection
- **No Error Boundaries**: Client components don't have error boundaries
- **No Pagination**: Dictionary and term lists fetch all records

## Deployment Notes

- **Vercel Recommended**: Zero-config deployment with automatic preview URLs
- **Database**: Use Vercel Postgres, Supabase, or Neon for managed PostgreSQL
- **Environment Variables**: Set all required vars in Vercel dashboard
- **Prisma**: `postinstall` script runs `prisma generate` automatically
- **Docker**: `docker-compose.yml` provided for local development with PostgreSQL
