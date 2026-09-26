/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `OrderConfirmation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrderConfirmation_orderId_key" ON "OrderConfirmation"("orderId");
