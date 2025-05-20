/*
  Warnings:

  - You are about to drop the column `salary` on the `Job` table. All the data in the column will be lost.
  - Added the required column `experience` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hybrid` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remote` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "salary",
ADD COLUMN     "experience" TEXT NOT NULL,
ADD COLUMN     "hybrid" BOOLEAN NOT NULL,
ADD COLUMN     "remote" BOOLEAN NOT NULL;
