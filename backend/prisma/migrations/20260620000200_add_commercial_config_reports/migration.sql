-- AlterTable
ALTER TABLE "RestaurantConfig" ADD COLUMN "openingHours" TEXT;
ALTER TABLE "RestaurantConfig" ADD COLUMN "deliveryFee" DECIMAL(10,2);
ALTER TABLE "RestaurantConfig" ADD COLUMN "paymentMethods" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];