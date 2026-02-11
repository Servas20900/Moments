-- CreateEnum
CREATE TYPE "CategoriaExtra" AS ENUM ('SIN_ALCOHOL', 'PREMIUM_ALCOHOL');

-- AlterTable
ALTER TABLE "extras" ADD COLUMN     "categoria" "CategoriaExtra" NOT NULL DEFAULT 'SIN_ALCOHOL';
