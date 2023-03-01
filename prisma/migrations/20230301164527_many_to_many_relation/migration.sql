/*
  Warnings:

  - You are about to drop the `_BoardToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BoardToUser" DROP CONSTRAINT "_BoardToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_BoardToUser" DROP CONSTRAINT "_BoardToUser_B_fkey";

-- DropTable
DROP TABLE "_BoardToUser";

-- CreateTable
CREATE TABLE "_ContributedBoards" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContributedBoards_AB_unique" ON "_ContributedBoards"("A", "B");

-- CreateIndex
CREATE INDEX "_ContributedBoards_B_index" ON "_ContributedBoards"("B");

-- AddForeignKey
ALTER TABLE "_ContributedBoards" ADD CONSTRAINT "_ContributedBoards_A_fkey" FOREIGN KEY ("A") REFERENCES "Board"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContributedBoards" ADD CONSTRAINT "_ContributedBoards_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;
