-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('quiz', 'theory');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT,
    "type" "QuestionType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'beginner',
    "question" TEXT NOT NULL,
    "optionA" TEXT,
    "optionB" TEXT,
    "optionC" TEXT,
    "optionD" TEXT,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "answer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "wrongAnswers" INTEGER NOT NULL,
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");
CREATE INDEX "Subject_slug_idx" ON "Subject"("slug");
CREATE UNIQUE INDEX "Topic_subjectId_name_key" ON "Topic"("subjectId", "name");
CREATE INDEX "Topic_subjectId_idx" ON "Topic"("subjectId");
CREATE INDEX "Question_subjectId_idx" ON "Question"("subjectId");
CREATE INDEX "Question_topicId_idx" ON "Question"("topicId");
CREATE INDEX "Question_type_idx" ON "Question"("type");
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX "Question_createdAt_idx" ON "Question"("createdAt");
CREATE INDEX "Question_subjectId_type_difficulty_idx" ON "Question"("subjectId", "type", "difficulty");
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");
CREATE INDEX "QuizAttempt_subjectId_idx" ON "QuizAttempt"("subjectId");
CREATE INDEX "QuizAttempt_createdAt_idx" ON "QuizAttempt"("createdAt");
CREATE INDEX "QuizAttempt_userId_createdAt_idx" ON "QuizAttempt"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
