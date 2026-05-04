-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "pending_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "available_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "external_order_reference" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sellerId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "destination_cbu" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_clerk_user_id_key" ON "Account"("clerk_user_id");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
