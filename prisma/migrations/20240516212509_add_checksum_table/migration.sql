-- CreateTable
CREATE TABLE "file_checksum" (
    "study_slug" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "geo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_checksum_pkey" PRIMARY KEY ("study_slug")
);
