/*
  Warnings:

  - The primary key for the `image_product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `image_product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `image_product` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`product_id`);
