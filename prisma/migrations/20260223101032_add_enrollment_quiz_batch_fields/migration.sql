/*
  Warnings:

  - A unique constraint covering the columns `[join_code]` on the table `batches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[join_code]` on the table `quizzes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subject` to the `batches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING_ADMIN', 'PENDING_INSTRUCTOR', 'ACTIVE', 'REJECTED');

-- AlterEnum
ALTER TYPE "QuizAccessType" ADD VALUE 'BATCH_ONLY';

-- AlterTable
ALTER TABLE "batch_students" ADD COLUMN     "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invited_by" TEXT,
ADD COLUMN     "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING_ADMIN',
ALTER COLUMN "enrolled_at" DROP NOT NULL,
ALTER COLUMN "enrolled_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "batches" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'amber',
ADD COLUMN     "join_code" TEXT,
ADD COLUMN     "subject" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "questions" ALTER COLUMN "points" SET DEFAULT 4;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "correct_points" DOUBLE PRECISION NOT NULL DEFAULT 4,
ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "join_code" TEXT,
ADD COLUMN     "pass_score" DOUBLE PRECISION,
ADD COLUMN     "subject" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "wrong_points" DOUBLE PRECISION NOT NULL DEFAULT -1,
ALTER COLUMN "show_results_immediately" SET DEFAULT true;

-- CreateTable
CREATE TABLE "quiz_batches" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_batches_quiz_id_idx" ON "quiz_batches"("quiz_id");

-- CreateIndex
CREATE INDEX "quiz_batches_batch_id_idx" ON "quiz_batches"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_batches_quiz_id_batch_id_key" ON "quiz_batches"("quiz_id", "batch_id");

-- CreateIndex
CREATE INDEX "batch_students_status_idx" ON "batch_students"("status");

-- CreateIndex
CREATE UNIQUE INDEX "batches_join_code_key" ON "batches"("join_code");

-- CreateIndex
CREATE INDEX "batches_join_code_idx" ON "batches"("join_code");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_join_code_key" ON "quizzes"("join_code");

-- CreateIndex
CREATE INDEX "quizzes_join_code_idx" ON "quizzes"("join_code");

-- AddForeignKey
ALTER TABLE "quiz_batches" ADD CONSTRAINT "quiz_batches_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_batches" ADD CONSTRAINT "quiz_batches_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
