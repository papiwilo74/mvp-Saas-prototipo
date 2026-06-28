-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "deliveryFeeApplied" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryZoneName" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledFor" TIMESTAMP(3),
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "comboItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isCombo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stock" INTEGER,
ADD COLUMN     "trackStock" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RestaurantConfig" ADD COLUMN     "acceptsScheduledOrders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "businessHours" JSONB,
ADD COLUMN     "coupons" JSONB,
ADD COLUMN     "deliveryZones" JSONB,
ADD COLUMN     "leadTimeMinutes" INTEGER NOT NULL DEFAULT 30;

-- CreateIndex
CREATE INDEX "Order_scheduledFor_idx" ON "Order"("scheduledFor");
