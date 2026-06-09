-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'NEQUI', 'CARD');

-- CreateTable
CREATE TABLE "RestaurantConfig" (
    "id" TEXT NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#ea580c',
    "secondaryColor" TEXT NOT NULL DEFAULT '#141414',
    "phone" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "email" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantConfig_pkey" PRIMARY KEY ("id")
);

-- AlterEnum
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING (
  CASE
    WHEN "status"::text IN ('CONFIRMED', 'PREPARING') THEN 'PREPARING'
    WHEN "status"::text = 'READY' THEN 'ON_THE_WAY'
    WHEN "status"::text = 'DELIVERED' THEN 'DELIVERED'
    WHEN "status"::text = 'CANCELLED' THEN 'CANCELLED'
    ELSE 'PENDING'
  END
)::"OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
DROP TYPE "OrderStatus_old";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantConfig_restaurantId_key" ON "RestaurantConfig"("restaurantId");

-- AddForeignKey
ALTER TABLE "RestaurantConfig" ADD CONSTRAINT "RestaurantConfig_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
