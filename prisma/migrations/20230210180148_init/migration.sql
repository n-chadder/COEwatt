-- CreateTable
CREATE TABLE "Testm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Testm_id_key" ON "Testm"("id");
