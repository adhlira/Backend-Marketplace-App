/*
  Warnings:

  - You are about to drop the `color_product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_size` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `color_product` DROP FOREIGN KEY `color_product_color_id_fkey`;

-- DropForeignKey
ALTER TABLE `color_product` DROP FOREIGN KEY `color_product_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `product_size` DROP FOREIGN KEY `product_size_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `product_size` DROP FOREIGN KEY `product_size_size_id_fkey`;

-- DropTable
DROP TABLE `color_product`;

-- DropTable
DROP TABLE `product_size`;

-- CreateTable
CREATE TABLE `detail_product` (
    `product_id` INTEGER NOT NULL,
    `size_id` INTEGER NOT NULL,
    `color_id` INTEGER NOT NULL,
    `stock` INTEGER NOT NULL,

    PRIMARY KEY (`product_id`, `size_id`, `color_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detail_product` ADD CONSTRAINT `detail_product_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_product` ADD CONSTRAINT `detail_product_size_id_fkey` FOREIGN KEY (`size_id`) REFERENCES `sizes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_product` ADD CONSTRAINT `detail_product_color_id_fkey` FOREIGN KEY (`color_id`) REFERENCES `colors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
