-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Desc" TEXT NOT NULL,
    "Owner" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "URL" TEXT NOT NULL,
    "Title" TEXT,
    "Action" TEXT,
    "Auth" TEXT
);

-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "DataTime" TEXT NOT NULL,
    "PageId" INTEGER NOT NULL,
    CONSTRAINT "Report_PageId_fkey" FOREIGN KEY ("PageId") REFERENCES "Page" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Page_1" ON "Page"("id");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Report_1" ON "Report"("id");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Report_2" ON "Report"("DataTime", "PageId");
Pragma writable_schema=0;
