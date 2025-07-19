-- CreateEnum
CREATE TYPE "Status" AS ENUM ('INCOMPLETE', 'PASS', 'FAIL');

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" SERIAL NOT NULL,
    "yearRange" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,
    "semesterName" TEXT NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "className" TEXT NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "creditHours" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "examWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "assignWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubject" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "studentName" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" SERIAL NOT NULL,
    "enrollmentId" INTEGER NOT NULL,
    "classSubjectId" INTEGER NOT NULL,
    "baseMark" DOUBLE PRECISION NOT NULL,
    "examMark" DOUBLE PRECISION NOT NULL,
    "assignMark" DOUBLE PRECISION NOT NULL,
    "finalMark" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "gp" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeScale" (
    "id" SERIAL NOT NULL,
    "minMark" INTEGER NOT NULL,
    "maxMark" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "enrollmentId" INTEGER NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "totalCredits" DOUBLE PRECISION NOT NULL,
    "totalGp" DOUBLE PRECISION NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'FAIL',
    "academicYearResultId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("enrollmentId")
);

-- CreateTable
CREATE TABLE "AcademicYearResult" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,
    "overallGpa" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalCredits" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalGp" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "semesterCount" INTEGER NOT NULL DEFAULT 0,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'INCOMPLETE',
    "yearRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYearResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "hashedPassword" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_yearRange_key" ON "AcademicYear"("yearRange");

-- CreateIndex
CREATE INDEX "AcademicYear_isCurrent_idx" ON "AcademicYear"("isCurrent");

-- CreateIndex
CREATE INDEX "Semester_academicYearId_idx" ON "Semester"("academicYearId");

-- CreateIndex
CREATE INDEX "Semester_isCurrent_idx" ON "Semester"("isCurrent");

-- CreateIndex
CREATE INDEX "Class_semesterId_idx" ON "Class"("semesterId");

-- CreateIndex
CREATE INDEX "Class_departmentCode_idx" ON "Class"("departmentCode");

-- CreateIndex
CREATE INDEX "Subject_subjectName_idx" ON "Subject"("subjectName");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubject_classId_subjectId_key" ON "ClassSubject"("classId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionId_key" ON "Student"("admissionId");

-- CreateIndex
CREATE INDEX "Student_studentName_idx" ON "Student"("studentName");

-- CreateIndex
CREATE INDEX "Student_admissionId_idx" ON "Student"("admissionId");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE INDEX "Enrollment_classId_idx" ON "Enrollment"("classId");

-- CreateIndex
CREATE INDEX "Enrollment_semesterId_idx" ON "Enrollment"("semesterId");

-- CreateIndex
CREATE INDEX "Enrollment_isActive_idx" ON "Enrollment"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_classId_semesterId_studentId_key" ON "Enrollment"("classId", "semesterId", "studentId");

-- CreateIndex
CREATE INDEX "Grade_grade_idx" ON "Grade"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_enrollmentId_classSubjectId_key" ON "Grade"("enrollmentId", "classSubjectId");

-- CreateIndex
CREATE INDEX "GradeScale_grade_idx" ON "GradeScale"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "GradeScale_minMark_grade_key" ON "GradeScale"("minMark", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "GradeScale_grade_score_key" ON "GradeScale"("grade", "score");

-- CreateIndex
CREATE INDEX "Result_gpa_idx" ON "Result"("gpa");

-- CreateIndex
CREATE INDEX "Result_academicYearResultId_idx" ON "Result"("academicYearResultId");

-- CreateIndex
CREATE INDEX "AcademicYearResult_overallGpa_idx" ON "AcademicYearResult"("overallGpa");

-- CreateIndex
CREATE INDEX "AcademicYearResult_isComplete_idx" ON "AcademicYearResult"("isComplete");

-- CreateIndex
CREATE INDEX "AcademicYearResult_status_idx" ON "AcademicYearResult"("status");

-- CreateIndex
CREATE INDEX "AcademicYearResult_yearRank_idx" ON "AcademicYearResult"("yearRank");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYearResult_studentId_academicYearId_key" ON "AcademicYearResult"("studentId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_academicYearResultId_fkey" FOREIGN KEY ("academicYearResultId") REFERENCES "AcademicYearResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYearResult" ADD CONSTRAINT "AcademicYearResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYearResult" ADD CONSTRAINT "AcademicYearResult_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
