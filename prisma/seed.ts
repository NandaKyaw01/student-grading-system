import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

async function main() {
  // Clear existing data (use with caution in production)
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.result.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.gradeScale.deleteMany();

  // 1. Seed Grade Scale
  await prisma.gradeScale.createMany({
    data: [
      { minMark: 0, maxMark: 39, grade: 'F', score: 0 },
      { minMark: 40, maxMark: 49, grade: 'D', score: 1 },
      { minMark: 50, maxMark: 54, grade: 'C', score: 2 },
      { minMark: 55, maxMark: 59, grade: 'C+', score: 2.33 },
      { minMark: 60, maxMark: 64, grade: 'B-', score: 2.67 },
      { minMark: 65, maxMark: 69, grade: 'B', score: 3 },
      { minMark: 70, maxMark: 74, grade: 'B+', score: 3.33 },
      { minMark: 75, maxMark: 79, grade: 'A-', score: 3.67 },
      { minMark: 80, maxMark: 89, grade: 'A', score: 3.8 },
      { minMark: 90, maxMark: 100, grade: 'A+', score: 4 }
    ]
  });

  // 2. Seed Academic Years
  const currentYear = await prisma.academicYear.create({
    data: {
      yearRange: '2024-2025',
      isCurrent: true
    }
  });

  const previousYear = await prisma.academicYear.create({
    data: {
      yearRange: '2023-2024',
      isCurrent: false
    }
  });

  // 3. Seed Semesters
  const firstSemester = await prisma.semester.create({
    data: {
      semesterName: '1st Semester',
      academicYearId: currentYear.id,
      isCurrent: true
    }
  });

  const secondSemester = await prisma.semester.create({
    data: {
      semesterName: '2nd Semester',
      academicYearId: currentYear.id,
      isCurrent: false
    }
  });

  // 4. Seed Classes
  const firstYearCS = await prisma.class.create({
    data: {
      className: 'First Year CS',
      departmentCode: 'CS',
      semesterId: firstSemester.id
    }
  });

  const secondYearCT = await prisma.class.create({
    data: {
      className: 'Second Year CT',
      departmentCode: 'CT',
      semesterId: firstSemester.id
    }
  });

  // 5. Seed Subjects
  await prisma.subject.createMany({
    data: [
      {
        id: 'CS101',
        subjectName: 'Programming Fundamentals',
        creditHours: 3.0,
        examWeight: 0.6,
        assignWeight: 0.4
      },
      {
        id: 'MATH101',
        subjectName: 'Discrete Mathematics',
        creditHours: 3.0,
        examWeight: 0.7,
        assignWeight: 0.3
      },
      {
        id: 'ENG101',
        subjectName: 'Technical English',
        creditHours: 2.0,
        examWeight: 0.5,
        assignWeight: 0.5
      },
      {
        id: 'CT201',
        subjectName: 'Data Structures',
        creditHours: 4.0,
        examWeight: 0.6,
        assignWeight: 0.4
      }
    ]
  });

  // 6. Link Subjects to Classes
  await prisma.classSubject.createMany({
    data: [
      { classId: firstYearCS.id, subjectId: 'CS101' },
      { classId: firstYearCS.id, subjectId: 'MATH101' },
      { classId: firstYearCS.id, subjectId: 'ENG101' },
      { classId: secondYearCT.id, subjectId: 'CT201' }
    ]
  });

  // 7. Seed Students
  const students = await prisma.student.createMany({
    data: [
      { studentName: 'Aung Aung' },
      { studentName: 'Hla Hla' },
      { studentName: 'Zaw Zaw' }
    ]
  });

  // 8. Enroll Students
  const studentRecords = await prisma.student.findMany();
  await prisma.enrollment.createMany({
    data: [
      {
        rollNumber: 'CS-001',
        studentId: studentRecords[0].id,
        classId: firstYearCS.id,
        semesterId: firstSemester.id
      },
      {
        rollNumber: 'CS-002',
        studentId: studentRecords[1].id,
        classId: firstYearCS.id,
        semesterId: firstSemester.id
      },
      {
        rollNumber: 'CT-001',
        studentId: studentRecords[2].id,
        classId: secondYearCT.id,
        semesterId: firstSemester.id
      }
    ]
  });

  // 9. Seed Sample Grades
  const enrollments = await prisma.enrollment.findMany();
  const classSubjects = await prisma.classSubject.findMany();

  // Helper function to calculate grade
  const calculateGrade = async (mark: number) => {
    return await prisma.gradeScale.findFirst({
      where: {
        minMark: { lte: mark },
        maxMark: { gte: mark }
      }
    });
  };

  // Create grades for each student
  for (const enrollment of enrollments) {
    const relevantSubjects = classSubjects.filter(
      (cs) => cs.classId === enrollment.classId
    );

    for (const subject of relevantSubjects) {
      const examMark = Math.floor(Math.random() * 30) + 50; // Random between 50-80
      const assignMark = Math.floor(Math.random() * 30) + 50;
      const subjectDetails = await prisma.subject.findUnique({
        where: { id: subject.subjectId }
      });

      if (!subjectDetails) continue;

      const finalMark =
        examMark * subjectDetails.examWeight +
        assignMark * subjectDetails.assignWeight;
      const gradeInfo = await calculateGrade(finalMark);

      await prisma.grade.create({
        data: {
          studentId: enrollment.studentId,
          subjectId: subject.subjectId,
          semesterId: enrollment.semesterId,
          examMark,
          assignMark,
          finalMark,
          grade: gradeInfo?.grade || 'F',
          score: gradeInfo?.score || 0,
          gp: (gradeInfo?.score || 0) * subjectDetails.creditHours
        }
      });
    }
  }

  // 10. Calculate Semester Results
  const calculateResults = async (studentId: number, semesterId: number) => {
    const grades = await prisma.grade.findMany({
      where: { studentId, semesterId },
      include: { subject: true }
    });

    const totalGp = grades.reduce((sum, grade) => sum + grade.gp, 0);
    const totalCredits = grades.reduce(
      (sum, grade) => sum + grade.subject.creditHours,
      0
    );
    const gpa = totalCredits > 0 ? totalGp / totalCredits : 0;

    return prisma.result.upsert({
      where: { studentId_semesterId: { studentId, semesterId } },
      create: { studentId, semesterId, gpa, totalCredits },
      update: { gpa, totalCredits }
    });
  };

  for (const student of studentRecords) {
    await calculateResults(student.id, firstSemester.id);
  }

  // 11. Seed Admin User
  const adminEmail = 'admin@ucsh.com';
  const hashedPassword = await bcrypt.hash('admin', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      hashedPassword,
      name: 'Admin'
    }
  });
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
