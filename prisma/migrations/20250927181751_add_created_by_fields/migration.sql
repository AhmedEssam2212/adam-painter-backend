/*
  Warnings:

  - Added the required column `createdBy` to the `availabilities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add columns as nullable first
ALTER TABLE "availabilities" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "bookings" ADD COLUMN "createdBy" TEXT;

-- Step 2: Update existing records to set createdBy = painterId for availabilities
UPDATE "availabilities" SET "createdBy" = "painterId" WHERE "createdBy" IS NULL;

-- Step 3: Update existing records to set createdBy = customerId for bookings
UPDATE "bookings" SET "createdBy" = "customerId" WHERE "createdBy" IS NULL;

-- Step 4: Make columns NOT NULL after data is populated
ALTER TABLE "availabilities" ALTER COLUMN "createdBy" SET NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "createdBy" SET NOT NULL;

-- CreateIndex
CREATE INDEX "availabilities_createdBy_idx" ON "availabilities"("createdBy");

-- CreateIndex
CREATE INDEX "bookings_createdBy_idx" ON "bookings"("createdBy");

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
