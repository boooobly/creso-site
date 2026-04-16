-- CreateTable
CREATE TABLE "BagetCatalogSnapshot" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "tab" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "itemsJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BagetCatalogSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BagetCatalogSnapshot_sourceKey_key" ON "BagetCatalogSnapshot"("sourceKey");
