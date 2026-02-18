-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
ADD COLUMN "paymentProvider" TEXT,
ADD COLUMN "paymentRef" TEXT,
ADD COLUMN "paidAmount" INTEGER,
ADD COLUMN "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Order_paymentRef_idx" ON "Order"("paymentRef");
