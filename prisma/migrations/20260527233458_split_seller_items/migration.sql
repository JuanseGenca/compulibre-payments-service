/*
  Warnings:

  - You are about to drop the column `sellerId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `sellerId` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "sellerId";

-- AlterTable
ALTER TABLE "TransactionItem" ADD COLUMN     "sellerId" TEXT NOT NULL;
