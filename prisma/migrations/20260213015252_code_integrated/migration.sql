-- CreateTable
CREATE TABLE "ShortLink" (
    "id" TEXT NOT NULL,
    "shortCode" VARCHAR(10) NOT NULL,
    "reviewText" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "shopName" TEXT,
    "productName" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ShortLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_shortCode_key" ON "ShortLink"("shortCode");

-- CreateIndex
CREATE INDEX "ShortLink_shortCode_idx" ON "ShortLink"("shortCode");
