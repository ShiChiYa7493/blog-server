-- AlterTable
ALTER TABLE "gallery_image" ADD COLUMN     "category_id" TEXT;

-- CreateTable
CREATE TABLE "gallery_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gallery_category_name_key" ON "gallery_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "gallery_category_slug_key" ON "gallery_category"("slug");

-- AddForeignKey
ALTER TABLE "gallery_image" ADD CONSTRAINT "gallery_image_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "gallery_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
