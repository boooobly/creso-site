ALTER TABLE "Order"
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "requestHash" TEXT;

CREATE UNIQUE INDEX "Order_source_idempotencyKey_key"
ON "Order"("source", "idempotencyKey");

CREATE INDEX "Order_source_createdAt_idx"
ON "Order"("source", "createdAt");

CREATE TABLE "NotificationOutbox" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 8,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationOutbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationOutbox_dedupeKey_key"
ON "NotificationOutbox"("dedupeKey");

CREATE INDEX "NotificationOutbox_status_nextAttemptAt_idx"
ON "NotificationOutbox"("status", "nextAttemptAt");

CREATE INDEX "NotificationOutbox_orderId_createdAt_idx"
ON "NotificationOutbox"("orderId", "createdAt");

ALTER TABLE "NotificationOutbox"
ADD CONSTRAINT "NotificationOutbox_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
