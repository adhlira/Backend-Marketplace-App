/*
  Warnings:

  - Added the required column `color_id` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_id` to the `cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cart` ADD COLUMN `color_id` INTEGER NOT NULL,
    ADD COLUMN `size_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_size_id_fkey` FOREIGN KEY (`size_id`) REFERENCES `sizes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
