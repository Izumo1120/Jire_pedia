-- CreateTable
CREATE TABLE "CollaborationRoom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "difficulty" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CollaborationRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'participant',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CollaborationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationRoom_code_key" ON "CollaborationRoom"("code");

-- CreateIndex
CREATE INDEX "CollaborationRoom_code_idx" ON "CollaborationRoom"("code");

-- CreateIndex
CREATE INDEX "CollaborationRoom_hostId_idx" ON "CollaborationRoom"("hostId");

-- CreateIndex
CREATE INDEX "CollaborationRoom_termId_idx" ON "CollaborationRoom"("termId");

-- CreateIndex
CREATE INDEX "CollaborationRoom_status_idx" ON "CollaborationRoom"("status");

-- CreateIndex
CREATE INDEX "CollaborationRoom_createdAt_idx" ON "CollaborationRoom"("createdAt");

-- CreateIndex
CREATE INDEX "CollaborationParticipant_roomId_idx" ON "CollaborationParticipant"("roomId");

-- CreateIndex
CREATE INDEX "CollaborationParticipant_userId_idx" ON "CollaborationParticipant"("userId");

-- CreateIndex
CREATE INDEX "CollaborationParticipant_isActive_idx" ON "CollaborationParticipant"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationParticipant_roomId_userId_key" ON "CollaborationParticipant"("roomId", "userId");

-- CreateIndex
CREATE INDEX "CollaborationMessage_roomId_idx" ON "CollaborationMessage"("roomId");

-- CreateIndex
CREATE INDEX "CollaborationMessage_userId_idx" ON "CollaborationMessage"("userId");

-- CreateIndex
CREATE INDEX "CollaborationMessage_createdAt_idx" ON "CollaborationMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "CollaborationRoom" ADD CONSTRAINT "CollaborationRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationRoom" ADD CONSTRAINT "CollaborationRoom_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationParticipant" ADD CONSTRAINT "CollaborationParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CollaborationRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationParticipant" ADD CONSTRAINT "CollaborationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationMessage" ADD CONSTRAINT "CollaborationMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CollaborationRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationMessage" ADD CONSTRAINT "CollaborationMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
