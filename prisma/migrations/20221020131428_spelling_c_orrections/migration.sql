/*
  Warnings:

  - You are about to drop the column `usersId` on the `Comments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_usersId_fkey";

-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "usersId";
ALTER TABLE "Comments" ADD COLUMN     "authorId" STRING;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
