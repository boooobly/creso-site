-- CreateTable
CREATE TABLE "PricingEntryHistory" (
    "id" TEXT NOT NULL,
    "pricingEntryId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "oldValue" JSONB NOT NULL,
    "newValue" JSONB NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingEntryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingEntryHistory_pricingEntryId_createdAt_idx" ON "PricingEntryHistory"("pricingEntryId", "createdAt");

-- CreateIndex
CREATE INDEX "PricingEntryHistory_category_createdAt_idx" ON "PricingEntryHistory"("category", "createdAt");

-- AddForeignKey
ALTER TABLE "PricingEntryHistory" ADD CONSTRAINT "PricingEntryHistory_pricingEntryId_fkey" FOREIGN KEY ("pricingEntryId") REFERENCES "PricingEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
