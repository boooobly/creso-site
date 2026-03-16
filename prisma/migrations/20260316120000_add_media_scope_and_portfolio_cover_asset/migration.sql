-- CreateEnum
CREATE TYPE "MediaAssetScope" AS ENUM ('site', 'portfolio');

-- AlterTable
ALTER TABLE "MediaAsset"
ADD COLUMN "scope" "MediaAssetScope" NOT NULL DEFAULT 'site';

-- AlterTable
ALTER TABLE "PortfolioItem"
ADD COLUMN "coverImageAssetId" TEXT;

-- CreateIndex
CREATE INDEX "MediaAsset_scope_kind_isActive_sortOrder_idx" ON "MediaAsset"("scope", "kind", "isActive", "sortOrder");

-- AddForeignKey
ALTER TABLE "PortfolioItem"
ADD CONSTRAINT "PortfolioItem_coverImageAssetId_fkey"
FOREIGN KEY ("coverImageAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
