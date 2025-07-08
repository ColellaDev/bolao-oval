/*
  Warnings:

  - You are about to drop the column `week` on the `Bet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,seasonId,weekNumber,gameId]` on the table `Bet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seasonId` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekNumber` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bet" DROP COLUMN "week",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seasonId" INTEGER NOT NULL,
ADD COLUMN     "weekNumber" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "winnerTeamId" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Week" (
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("seasonId","number")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "logo" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSeasonScore" (
    "userId" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserSeasonScore_pkey" PRIMARY KEY ("userId","seasonId")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bet_userId_seasonId_weekNumber_gameId_key" ON "Bet"("userId", "seasonId", "weekNumber", "gameId");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_seasonId_weekNumber_fkey" FOREIGN KEY ("seasonId", "weekNumber") REFERENCES "Week"("seasonId", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_seasonId_weekNumber_fkey" FOREIGN KEY ("seasonId", "weekNumber") REFERENCES "Week"("seasonId", "number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Week" ADD CONSTRAINT "Week_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSeasonScore" ADD CONSTRAINT "UserSeasonScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSeasonScore" ADD CONSTRAINT "UserSeasonScore_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
