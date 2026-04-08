/*
  Warnings:

  - The primary key for the `_ArticleTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `article` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_ArticleTag" DROP CONSTRAINT "_ArticleTag_A_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_article_id_fkey";

-- AlterTable
ALTER TABLE "_ArticleTag" DROP CONSTRAINT "_ArticleTag_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_ArticleTag_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "article" DROP CONSTRAINT "article_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "slug" DROP NOT NULL,
ADD CONSTRAINT "article_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "article_id_seq";

-- AlterTable
ALTER TABLE "comment" ALTER COLUMN "article_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleTag" ADD CONSTRAINT "_ArticleTag_A_fkey" FOREIGN KEY ("A") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
