-- CreateEnum
CREATE TYPE "public"."CollectionStatus" AS ENUM ('WANT_TO_PLAY', 'PLAYING', 'COMPLETED', 'DROPPED');

-- CreateTable
CREATE TABLE "public"."GameCollection" (
    "id" TEXT NOT NULL,
    "status" "public"."CollectionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "GameCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameCollection_userId_gameId_key" ON "public"."GameCollection"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "public"."GameCollection" ADD CONSTRAINT "GameCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameCollection" ADD CONSTRAINT "GameCollection_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
