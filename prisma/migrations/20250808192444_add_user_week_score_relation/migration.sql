-- CreateTable
CREATE TABLE "UserWeekScore" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "sl" INTEGER NOT NULL DEFAULT 0,
    "weekNumber" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,

    CONSTRAINT "UserWeekScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWeekScore_userId_seasonId_weekNumber_key" ON "UserWeekScore"("userId", "seasonId", "weekNumber");

-- AddForeignKey
ALTER TABLE "UserWeekScore" ADD CONSTRAINT "UserWeekScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWeekScore" ADD CONSTRAINT "UserWeekScore_seasonId_weekNumber_fkey" FOREIGN KEY ("seasonId", "weekNumber") REFERENCES "Week"("seasonId", "number") ON DELETE RESTRICT ON UPDATE CASCADE;
