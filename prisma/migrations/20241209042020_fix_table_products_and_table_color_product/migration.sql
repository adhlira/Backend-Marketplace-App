/*
  Warnings:

  - You are about to drop the column `quantity` on the `products` table. All the data in the column will be lost.
  - Added the required column `stock` to the `color_product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `color_product` ADD COLUMN `stock` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `quantity`;
