/*
  Warnings:

  - You are about to drop the column `conductorId` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the `conductores` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_conductorId_fkey";

-- AlterTable
ALTER TABLE "reservas" DROP COLUMN "conductorId";

-- DropTable
DROP TABLE "conductores";
