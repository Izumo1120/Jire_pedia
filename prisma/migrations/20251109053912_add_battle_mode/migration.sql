-- CreateTable
CREATE TABLE "BattleRoom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 2,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "difficulty" TEXT NOT NULL DEFAULT 'normal',
    "timeLimit" INTEGER NOT NULL DEFAULT 300,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BattleRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isReady" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BattleParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleAttempt" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "aiComment" TEXT,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "submitTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BattleRoom_code_key" ON "BattleRoom"("code");

-- CreateIndex
CREATE INDEX "BattleRoom_code_idx" ON "BattleRoom"("code");

-- CreateIndex
CREATE INDEX "BattleRoom_termId_idx" ON "BattleRoom"("termId");

-- CreateIndex
CREATE INDEX "BattleRoom_status_idx" ON "BattleRoom"("status");

-- CreateIndex
CREATE INDEX "BattleRoom_createdAt_idx" ON "BattleRoom"("createdAt");

-- CreateIndex
CREATE INDEX "BattleParticipant_roomId_idx" ON "BattleParticipant"("roomId");

-- CreateIndex
CREATE INDEX "BattleParticipant_userId_idx" ON "BattleParticipant"("userId");

-- CreateIndex
CREATE INDEX "BattleParticipant_isActive_idx" ON "BattleParticipant"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BattleParticipant_roomId_userId_key" ON "BattleParticipant"("roomId", "userId");

-- CreateIndex
CREATE INDEX "BattleAttempt_roomId_idx" ON "BattleAttempt"("roomId");

-- CreateIndex
CREATE INDEX "BattleAttempt_userId_idx" ON "BattleAttempt"("userId");

-- CreateIndex
CREATE INDEX "BattleAttempt_createdAt_idx" ON "BattleAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "BattleRoom" ADD CONSTRAINT "BattleRoom_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "BattleRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleAttempt" ADD CONSTRAINT "BattleAttempt_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "BattleRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleAttempt" ADD CONSTRAINT "BattleAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
