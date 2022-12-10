-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedUserId_fkey";

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "assignedUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("identifier") ON DELETE SET NULL ON UPDATE CASCADE;
