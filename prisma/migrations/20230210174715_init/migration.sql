/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Application_1" ON "Application"("id");
Pragma writable_schema=0;
