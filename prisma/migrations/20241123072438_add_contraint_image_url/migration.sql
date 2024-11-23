/*
  Warnings:

  - The primary key for the `image_product` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `image_product` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`product_id`, `image_url`);
