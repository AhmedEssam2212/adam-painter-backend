/*
  Warnings:

  - You are about to drop the column `painterId` on the `availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `bookings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "availabilities" DROP CONSTRAINT "availabilities_painterId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_customerId_fkey";

-- DropIndex
DROP INDEX "availabilities_painterId_idx";

-- DropIndex
DROP INDEX "bookings_customerId_idx";

-- AlterTable
ALTER TABLE "availabilities" DROP COLUMN "painterId";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "customerId";
