CREATE TABLE "BagetPageLoadDiagnostics" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "totalDurationMs" INTEGER NOT NULL,
    "loadPublicBagetCatalogMs" INTEGER NOT NULL,
    "getPageContentMapMs" INTEGER NOT NULL,
    "getBaguetteExtrasPricingConfigMs" INTEGER NOT NULL,
    "catalogSource" TEXT NOT NULL,
    "bagetItemsCount" INTEGER NOT NULL,
    "snapshotExists" BOOLEAN NOT NULL,
    "snapshotSyncedAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BagetPageLoadDiagnostics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BagetPageLoadDiagnostics_sourceKey_key" ON "BagetPageLoadDiagnostics"("sourceKey");
