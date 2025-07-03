/*
  Warnings:

  - You are about to drop the column `choice` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the column `game` on the `Bet` table. All the data in the column will be lost.
  - Added the required column `choiceId` to the `Bet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `Bet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bet" DROP COLUMN "choice",
DROP COLUMN "game",
ADD COLUMN     "choiceId" TEXT NOT NULL,
ADD COLUMN     "gameId" TEXT NOT NULL;
