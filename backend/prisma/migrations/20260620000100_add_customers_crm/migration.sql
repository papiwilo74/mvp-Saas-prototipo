-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_restaurantId_phone_key" ON "Customer"("restaurantId", "phone");
CREATE INDEX "Customer_restaurantId_idx" ON "Customer"("restaurantId");
CREATE INDEX "Customer_restaurantId_email_idx" ON "Customer"("restaurantId", "email");
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill customers from existing orders with a phone number.
WITH grouped_customers AS (
    SELECT
        o."restaurantId",
        nullif(o."customerPhone", '') AS phone,
        max(o."customerName") AS name,
        max(nullif(o."customerEmail", '')) AS email,
        max(nullif(o."customerAddress", '')) AS address,
        min(o."createdAt") AS first_order_at
    FROM "Order" o
    WHERE nullif(o."customerPhone", '') IS NOT NULL
    GROUP BY o."restaurantId", nullif(o."customerPhone", '')
)
INSERT INTO "Customer" ("id", "name", "phone", "email", "address", "restaurantId", "createdAt", "updatedAt")
SELECT
    concat('crm_', md5(gc."restaurantId" || ':' || gc.phone)),
    gc.name,
    gc.phone,
    gc.email,
    gc.address,
    gc."restaurantId",
    gc.first_order_at,
    CURRENT_TIMESTAMP
FROM grouped_customers gc;

UPDATE "Order" o
SET "customerId" = c."id"
FROM "Customer" c
WHERE c."restaurantId" = o."restaurantId"
  AND c."phone" = nullif(o."customerPhone", '')
  AND o."customerId" IS NULL;