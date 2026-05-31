/*
  Warnings:

  - The `status` column on the `Payout` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'REVIEWING', 'CLOSED');

-- AlterTable
ALTER TABLE "Account" ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("clerk_user_id");

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "status",
ADD COLUMN     "status" "PayoutStatus" NOT NULL DEFAULT 'PROCESSING';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);
