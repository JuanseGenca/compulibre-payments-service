/*
  Warnings:

  - Added the required column `buyerAddress` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerCodigoPostal` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "buyerAddress" TEXT NOT NULL,
ADD COLUMN     "buyerCodigoPostal" INTEGER NOT NULL;
