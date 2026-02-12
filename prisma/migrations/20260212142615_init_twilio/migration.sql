/*
  Warnings:

  - Added the required column `customerEmail` to the `CustomerReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `CustomerReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `CustomerReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopEmail` to the `CustomerReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopName` to the `CustomerReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomerReview" ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL,
ADD COLUMN     "shopEmail" TEXT NOT NULL,
ADD COLUMN     "shopName" TEXT NOT NULL;
