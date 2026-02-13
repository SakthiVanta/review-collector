-- AlterTable
ALTER TABLE "CustomerReview" ADD COLUMN     "sendSMS" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sendWhatsApp" BOOLEAN NOT NULL DEFAULT false;
