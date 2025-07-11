-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "awayTeamScore" INTEGER,
ADD COLUMN     "homeTeamScore" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SCHEDULED';
