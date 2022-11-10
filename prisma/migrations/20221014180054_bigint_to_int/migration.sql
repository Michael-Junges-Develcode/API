/*
  Warnings:

  - You are about to alter the column `id` on the `Comments` table. The data in that column will be cast from `BigInt` to `Int`. This cast may fail. Please make sure the data in the column can be cast.
  - You are about to alter the column `postsId` on the `Comments` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `Posts` table. The data in that column will be cast from `BigInt` to `Int`. This cast may fail. Please make sure the data in the column can be cast.

*/
-- RedefineTables
CREATE TABLE "_prisma_new_Comments" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "comment" STRING NOT NULL,
    "usersId" STRING,
    "postsId" INT4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);
INSERT INTO "_prisma_new_Comments" ("comment","createdAt","id","postsId","usersId") SELECT "comment","createdAt","id","postsId","usersId" FROM "Comments";
DROP TABLE "Comments" CASCADE;
ALTER TABLE "_prisma_new_Comments" RENAME TO "Comments";
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_postsId_fkey" FOREIGN KEY ("postsId") REFERENCES "Posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE TABLE "_prisma_new_Posts" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "content" STRING NOT NULL,
    "authorId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);
INSERT INTO "_prisma_new_Posts" ("authorId","content","createdAt","id") SELECT "authorId","content","createdAt","id" FROM "Posts";
DROP TABLE "Posts" CASCADE;
ALTER TABLE "_prisma_new_Posts" RENAME TO "Posts";
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;