-- AlterTable
ALTER TABLE "Board" ALTER COLUMN "isArchived" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "isArchived" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "isArchived" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isArchived" SET DEFAULT false;
