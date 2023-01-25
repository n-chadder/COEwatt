-- CreateTable
CREATE TABLE "AppElement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "elementName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AppElementRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "RoleId" INTEGER NOT NULL,
    "AppElementId" INTEGER NOT NULL,
    CONSTRAINT "AppElementRole_AppElementId_fkey" FOREIGN KEY ("AppElementId") REFERENCES "AppElement" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "AppElementRole_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "Role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Desc" TEXT NOT NULL,
    "Owner" INTEGER NOT NULL,
    CONSTRAINT "Application_Owner_fkey" FOREIGN KEY ("Owner") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "AppVerId" INTEGER NOT NULL,
    "URL" TEXT NOT NULL,
    "Title" TEXT,
    "Action" TEXT,
    "Auth" TEXT,
    CONSTRAINT "Page_AppVerId_fkey" FOREIGN KEY ("AppVerId") REFERENCES "Version" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userName" TEXT NOT NULL,
    "roles" TEXT NOT NULL,
    "expiry" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "RoleId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,
    CONSTRAINT "UserRole_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES "Role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "UserRole_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Version" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "AppId" INTEGER NOT NULL,
    "Version" TEXT NOT NULL,
    CONSTRAINT "Version_AppId_fkey" FOREIGN KEY ("AppId") REFERENCES "Application" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
CREATE UNIQUE INDEX "sqlite_autoindex_AppElementRole_1" ON "AppElementRole"("id");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_AppElementRole_2" ON "AppElementRole"("RoleId", "AppElementId");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Page_1" ON "Page"("id");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Page_2" ON "Page"("AppVerId", "URL");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Role_1" ON "Role"("name");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Session" ON "Session"("userName");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_User_2" ON "User"("firstName", "lastName", "email");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Report_1" ON "Report"("id");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Report_2" ON "Report"("DataTime", "PageId");
Pragma writable_schema=0;
