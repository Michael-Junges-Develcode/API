-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "bannerUrl" STRING;
ALTER TABLE "Users" ADD COLUMN     "bio" STRING;
ALTER TABLE "Users" ADD COLUMN     "photoUrl" STRING;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_postsId_fkey" FOREIGN KEY ("postsId") REFERENCES "Posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
