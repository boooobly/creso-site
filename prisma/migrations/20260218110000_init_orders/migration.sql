-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "customerName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "comment" TEXT,
    "total" INTEGER NOT NULL,
    "prepayRequired" BOOLEAN NOT NULL DEFAULT false,
    "prepayAmount" INTEGER,
    "payloadJson" JSONB NOT NULL,
    "quoteJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");
