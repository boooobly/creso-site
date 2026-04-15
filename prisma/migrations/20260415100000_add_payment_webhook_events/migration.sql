CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "payloadJson" JSONB NOT NULL,

    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentWebhookEvent_eventId_key" ON "PaymentWebhookEvent"("eventId");
CREATE INDEX "PaymentWebhookEvent_provider_receivedAt_idx" ON "PaymentWebhookEvent"("provider", "receivedAt");
CREATE INDEX "PaymentWebhookEvent_orderNumber_receivedAt_idx" ON "PaymentWebhookEvent"("orderNumber", "receivedAt");
