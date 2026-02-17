-- CreateEnum
CREATE TYPE "ExecutionMode" AS ENUM ('SYNC', 'ASYNC');

-- AlterTable
ALTER TABLE "Capability" ADD COLUMN     "executionMode" "ExecutionMode" NOT NULL DEFAULT 'SYNC',
ADD COLUMN     "retryable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timeoutMs" INTEGER;
