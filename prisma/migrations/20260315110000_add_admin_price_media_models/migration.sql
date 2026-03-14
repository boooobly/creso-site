-- CreateEnum
CREATE TYPE "PriceCategoryKind" AS ENUM ('general', 'baguette_extras');

-- CreateEnum
CREATE TYPE "MediaAssetKind" AS ENUM ('image', 'document');

-- CreateTable
CREATE TABLE "PriceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "kind" "PriceCategoryKind" NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "MediaAssetKind" NOT NULL DEFAULT 'image',
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "altText" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceCategory_slug_key" ON "PriceCategory"("slug");
CREATE INDEX "PriceCategory_kind_isActive_sortOrder_idx" ON "PriceCategory"("kind", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "PriceItem_categoryId_isActive_sortOrder_idx" ON "PriceItem"("categoryId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "MediaAsset_kind_isActive_sortOrder_idx" ON "MediaAsset"("kind", "isActive", "sortOrder");

-- AddForeignKey
ALTER TABLE "PriceItem" ADD CONSTRAINT "PriceItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PriceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
