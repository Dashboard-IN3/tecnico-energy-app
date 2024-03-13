/*
  Warnings:

  - Added the required column `key_field` to the `study` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_field` to the `study` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "study" ADD COLUMN     "highlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "key_field" TEXT NOT NULL,
ADD COLUMN     "name_field" TEXT NOT NULL;
