-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'ERROR');

-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('BRONCE', 'PLATA', 'ORO', 'DIAMANTE');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'WOMPI';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tier" "LoyaltyTier" NOT NULL DEFAULT 'BRONCE';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "pointsRedeemed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wompiTransactionId" TEXT;

-- AlterTable
ALTER TABLE "RestaurantConfig" ADD COLUMN     "loyaltyProgram" JSONB,
ADD COLUMN     "wompiPrivateKey" TEXT,
ADD COLUMN     "wompiPublicKey" TEXT;

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "wompiId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountInCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "reference" TEXT NOT NULL,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_wompiId_key" ON "PaymentTransaction"("wompiId");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
