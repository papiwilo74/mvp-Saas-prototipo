-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tableNumber" INTEGER;

-- AlterTable
ALTER TABLE "RestaurantConfig" ADD COLUMN     "googleMapsApiKey" TEXT,
ADD COLUMN     "whatsappPhoneNumberId" TEXT,
ADD COLUMN     "whatsappToken" TEXT;
