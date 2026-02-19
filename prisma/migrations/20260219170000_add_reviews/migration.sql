-- CreateTable
CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
  "rating" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "moderatedAt" TIMESTAMP(3),
  "ipHash" TEXT,
  "userAgent" TEXT,

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");
