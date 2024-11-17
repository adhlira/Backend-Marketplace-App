/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `products_user_id_key` ON `products`(`user_id`);
