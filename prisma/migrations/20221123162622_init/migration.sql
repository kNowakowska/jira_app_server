-- CreateEnum
CREATE TYPE "BoardColumn" AS ENUM ('TO_DO', 'IN_PROGRESS', 'READY_FOR_TESTING', 'TESTING', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('HIGHEST', 'MEDIUM', 'LOWEST');

-- CreateTable
CREATE TABLE "User" (
    "identifier" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstname" VARCHAR(255) NOT NULL,
    "surname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "isArchived" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Board" (
    "identifier" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shortcut" VARCHAR(3) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "ownerId" UUID NOT NULL,
    "isArchived" BOOLEAN NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Task" (
    "identifier" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "taskNumber" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "creationDate" DATE,
    "reporterId" UUID NOT NULL,
    "assignedUserId" UUID NOT NULL,
    "boardColumn" "BoardColumn" NOT NULL,
    "taskPriority" "TaskPriority",
    "orderInColumn" INTEGER NOT NULL,
    "loggedTime" DOUBLE PRECISION,
    "boardId" UUID NOT NULL,
    "isArchived" BOOLEAN NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Comment" (
    "identifier" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" VARCHAR(2000) NOT NULL,
    "creatorId" UUID NOT NULL,
    "creationDate" DATE,
    "taskId" UUID NOT NULL,
    "isArchived" BOOLEAN NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "_BoardToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Board_shortcut_key" ON "Board"("shortcut");

-- CreateIndex
CREATE UNIQUE INDEX "_BoardToUser_AB_unique" ON "_BoardToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BoardToUser_B_index" ON "_BoardToUser"("B");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToUser" ADD CONSTRAINT "_BoardToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Board"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToUser" ADD CONSTRAINT "_BoardToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;
