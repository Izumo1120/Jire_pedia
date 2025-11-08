# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jire-pedia** is an AI-powered explanation game where users explain specialized terms without using specific forbidden words (NG words). The AI judges the explanation and awards XP based on difficulty and confidence. Successful explanations are saved to a collaborative knowledge dictionary.

**Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, PostgreSQL, Prisma, NextAuth.js v5, Tailwind CSS v4, Google Generative AI (Gemini), Groq SDK, Zustand (state management).

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
   - AI model selection based on difficulty (Easy: Gemini 2.5 Flash, Normal: Llama 3.1 8B Instant, Hard: Llama 3 70B)
   - Parse JSON response: `{ "guess": "...", "confidence": 0-100, "comment": "..." }`
   - Database updates: Create Attempt, update User XP/level, create/update Entry (if successful), update Term stats
   - Notification creation for level-ups
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

- **User**: Stores XP, level, rank, authentication credentials (bcrypt hashed passwords)
- **Term**: Word, category, subcategory, officialDef, ngWords array, tags array, statistics (totalAttempts, totalSuccess, viewCount, favoriteCount)
- **Attempt**: Full game attempt record (explanation, AI response, success/failure, XP earned, difficulty, aiModel)
- **Entry**: Published successful explanations with difficulty scores (easyScore, normalScore, hardScore), crown system fields (isCrown, crownStartDate, crownDays), version tracking, social metrics (likeCount, commentCount)
- **Like**: User-Entry many-to-many relationship with unique constraint (userId + entryId)
- **Comment**: Text comments on entries (max 500 chars), with user/entry relations and timestamps
- **Notification**: Type-based notifications (like, comment, crown, level_up, system) with read/unread status
- **Favorite**: (Schema exists, UI not fully implemented) User term favorites
- **Account/Session**: NextAuth.js adapter models for authentication

**Key Relationships**:
- User → Attempts (1:many)
- User → Entries (1:many)
- User → Likes (1:many)
- User → Comments (1:many)
- User → Notifications (1:many)
- User → Favorites (1:many)
- Term → Attempts (1:many)
- Term → Entries (1:many)
- Term → Favorites (1:many)
- Entry → Likes (1:many)
- Entry → Comments (1:many)
- Entry → Notifications (1:many)

**Database Patterns**:
- All primary keys use CUID format (`@default(cuid())`)
- Cascade deletes on user/entry removal
- Strategic indexing on userId, termId, entryId, createdAt
- Unique constraints for preventing duplicate likes (userId + entryId)

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

## Social Features Architecture

### Like System

**Implementation**:
- **API Endpoint**: `POST /api/likes` (toggle), `GET /api/likes?entryId={id}` (check status)
- **Component**: [src/components/social/like-button.tsx](src/components/social/like-button.tsx)
- **Pattern**: Toggle pattern - creates if not exists, deletes if exists
- **Optimistic Updates**: UI updates immediately, rolls back on error
- **Notifications**: Automatically sends notification to entry author (except self-likes)

**Database Operations**:
```typescript
// Check existence: findUnique({ userId, entryId })
// Create: like.create() + entry.update({ likeCount: increment })
// Delete: like.delete() + entry.update({ likeCount: decrement })
```

**Authorization**: Requires authenticated session

### Comment System

**Implementation**:
- **API Endpoints**:
  - `POST /api/comments` - Create comment
  - `GET /api/comments?entryId={id}` - List comments
  - `DELETE /api/comments/[id]` - Delete comment (owner only)
- **Component**: [src/components/social/comment-section.tsx](src/components/social/comment-section.tsx)
- **Validation**: Max 500 characters (Zod schema)
- **Authorization**: Users can only delete their own comments

**Features**:
- Expandable/collapsible UI
- Real-time character counter
- Timestamp display (relative time)
- Notification to entry author on new comment
- Comment count updates on Entry model

### Notification System

**Implementation**:
- **API Endpoints**:
  - `GET /api/notifications` - List notifications (paginated, default limit: 20)
  - `GET /api/notifications/unread-count` - Badge count
  - `PATCH /api/notifications/[id]` - Mark single as read
  - `PATCH /api/notifications` - Mark all as read
- **Components**:
  - [src/components/social/notification-dropdown.tsx](src/components/social/notification-dropdown.tsx) - Header icon with badge
  - [src/app/notifications/page.tsx](src/app/notifications/page.tsx) - Full notification page
- **Polling**: 60-second interval for unread count updates

**Notification Types**:
- `like`: Someone liked your entry
- `comment`: Someone commented on your entry
- `crown`: Your entry became/lost crown status
- `level_up`: User leveled up
- `system`: System announcements

**Helper Functions** ([src/lib/notification.ts](src/lib/notification.ts)):
```typescript
createNotification(userId, type, message, entryId?)
getUserNotifications(userId, limit?, cursor?)
markNotificationAsRead(notificationId)
markAllNotificationsAsRead(userId)
getUnreadNotificationCount(userId)
```

### Share Functionality

**Implementation**:
- **Component**: [src/components/social/share-button.tsx](src/components/social/share-button.tsx)
- **Platforms**: X (Twitter), Facebook, LINE
- **Features**:
  - Native Web Share API (if supported)
  - Fallback to platform-specific URLs
  - Copy link functionality
  - Success/error toast notifications

**URL Generation Pattern**:
```typescript
const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dictionary/${termId}`
const text = `「${termWord}」の説明を投稿しました！`
```

### Entry Card Component

**Implementation**:
- **Component**: [src/components/social/entry-card.tsx](src/components/social/entry-card.tsx)
- **Features**:
  - Displays entry metadata (user, date, difficulty, confidence)
  - Integrated LikeButton, CommentSection, ShareButton
  - Crown badge for top entries
  - Difficulty score badges
  - Responsive layout

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

- **`src/components/ui/`**: shadcn/ui base components (Button, Card, Badge, Input, Textarea, etc.) - Built on Radix UI primitives
- **`src/components/game/`**: Game-specific components (GamePlayForm, etc.)
- **`src/components/auth/`**: Authentication forms (LoginForm, RegisterForm)
- **`src/components/social/`**: Social features (LikeButton, CommentSection, NotificationDropdown, ShareButton, EntryCard)
- **`src/components/layout/`**: Header, navigation
- **`src/components/nexus/`**: Generative Nexus design system components (NexusCanvas)
- **`src/components/providers.tsx`**: SessionProvider wrapper for NextAuth

## Critical Files Reference

### Core Libraries
- **`src/lib/auth.ts`**: NextAuth configuration, session callbacks
- **`src/lib/ai.ts`**: AI judgment logic, multi-provider support (Gemini, Groq)
- **`src/lib/xp.ts`**: XP calculation, level-up logic, rank determination
- **`src/lib/prisma.ts`**: Database client singleton
- **`src/lib/utils.ts`**: Utility functions (cn, hashPassword, verifyPassword)
- **`src/lib/ng-word-checker.ts`**: NG word validation logic
- **`src/lib/notification.ts`**: Notification helper functions (create, read, mark read, count)

### Key API Routes
- **`src/app/api/ai/judge/route.ts`**: Core game logic orchestrator (~180 lines)
- **`src/app/api/auth/register/route.ts`**: User registration endpoint
- **`src/app/api/likes/route.ts`**: Like toggle and status check
- **`src/app/api/comments/route.ts`**: Comment CRUD operations
- **`src/app/api/notifications/route.ts`**: Notification list and mark all read
- **`src/app/api/notifications/[id]/route.ts`**: Mark single notification as read
- **`src/app/api/notifications/unread-count/route.ts`**: Badge count endpoint

### Layouts & Styles
- **`src/app/layout.tsx`**: Root layout with NexusCanvas and SessionProvider
- **`src/app/globals.css`**: Complete Generative Nexus design system (445+ lines)

## Known Limitations

### Core Architecture
- **No Transactions**: Judge route updates User + Term + Attempt separately (consider Prisma transactions for atomicity)
- **No Rate Limiting**: API routes lack rate limiting protection (vulnerable to abuse)
- **No Error Boundaries**: Client components don't have error boundaries for graceful error handling
- **No Pagination**: Dictionary and term lists fetch all records (performance issue as data grows)

### Social Features
- **No Real-time Updates**: Uses polling (60s interval) instead of WebSockets for notifications
- **No Notification Cleanup**: Old notifications accumulate indefinitely in database
- **No Comment Editing**: Users can only delete comments, not edit them
- **Persistent Like Notifications**: Notifications remain even after unlike action

### UI Implementation
- **Favorites**: Model exists but UI not fully implemented for adding/removing favorites
- **Crown System**: Database fields exist but crown competition logic partially implemented

### Code Quality
- **Long Judge Route**: API judge route is ~180 lines, could be refactored into smaller functions
- **No Centralized Logging**: Console.log scattered throughout, no centralized error tracking
- **No Analytics**: No user behavior tracking or performance monitoring

## Deployment Notes

- **Vercel Recommended**: Zero-config deployment with automatic preview URLs
- **Database**: Use Vercel Postgres, Supabase, or Neon for managed PostgreSQL
- **Environment Variables**: Set all required vars in Vercel dashboard:
  - `DATABASE_URL` - PostgreSQL connection string
  - `NEXTAUTH_SECRET` - JWT signing secret (generate with `openssl rand -base64 32`)
  - `NEXTAUTH_URL` - Application base URL
  - `GOOGLE_GENERATIVE_AI_API_KEY` - For Gemini (Easy difficulty)
  - `GROQ_API_KEY` - For Llama models (Normal/Hard difficulty)
  - `NEXT_PUBLIC_APP_URL` - Public base URL (for share functionality)
- **Prisma**: `postinstall` script runs `prisma generate` automatically
- **Database Migrations**: Run `npx prisma migrate deploy` in production
- **Docker**: `docker-compose.yml` provided for local development with PostgreSQL

## Quick Start Guide

### For New Developers

1. **Clone & Setup**:
   ```bash
   git clone <repository>
   cd Jire_pedia
   pnpm install
   ```

2. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` (local PostgreSQL or Docker)
   - Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - Add AI API keys (Gemini and Groq)

3. **Initialize Database**:
   ```bash
   npx prisma migrate dev      # Run migrations
   npx prisma generate         # Generate Prisma Client
   pnpm prisma:seed           # Seed initial terms
   ```

4. **Start Development**:
   ```bash
   # Option 1: Local development
   pnpm dev

   # Option 2: With Docker (includes PostgreSQL)
   docker-compose up
   ```

5. **Verify Setup**:
   - App: http://localhost:3000
   - Prisma Studio: `npx prisma studio` → http://localhost:5555

### Common Development Workflows

**Adding a New Term**:
- Use Prisma Studio GUI, or
- Add to `prisma/seed.ts` and run `pnpm prisma:seed`

**Modifying Database Schema**:
```bash
# 1. Edit prisma/schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name descriptive_name
# 3. Regenerate Prisma Client
npx prisma generate
```

**Debugging AI Responses**:
- Check console output in `src/app/api/ai/judge/route.ts`
- Logs show: raw AI response, parsed JSON, success/failure
- Test different models by changing difficulty level

**Testing Social Features**:
- Create multiple test users
- Post entries via the game flow
- Test like/unlike, comment, notifications
- Check notification polling in Network tab (60s interval)

### Understanding the Game Flow

```
User Journey:
1. Register/Login → Creates session (JWT)
2. /play/select → Random term selected from database
3. /play/[termId] → Display term + NG words, user writes explanation
4. Submit → POST /api/ai/judge
   ├─ Validate NG words (server-side)
   ├─ Select AI model (Easy/Normal/Hard)
   ├─ AI judges explanation
   ├─ Calculate XP + level-up check
   ├─ Create Attempt record
   ├─ Update User (XP, level, rank)
   ├─ Create/Update Entry (if successful)
   ├─ Send level-up notification (if applicable)
   └─ Return result
5. /play/result/[attemptId] → Display AI feedback + XP earned
6. /dictionary/[termId] → Browse all entries (with likes/comments)
```
