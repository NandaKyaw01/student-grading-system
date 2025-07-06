import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

async function main() {
  // Seed AcademicYears
  // await prisma.academicYear.createMany({
  //   data: [
  //     {
  //       id: 1,
  //       yearRange: '2024-2025',
  //       isCurrent: true
  //     }
  //   ],
  //   skipDuplicates: true
  // });

  // // Seed Semesters
  // await prisma.semester.createMany({
  //   data: [
  //     {
  //       id: 1,
  //       semesterName: 'First Semester',
  //       academicYearId: 1,
  //       isCurrent: false
  //     },
  //     {
  //       id: 2,
  //       semesterName: 'Second Semester',
  //       academicYearId: 1,
  //       isCurrent: false
  //     }
  //   ],
  //   skipDuplicates: true
  // });

  // // Seed Classes
  // await prisma.class.createMany({
  //   data: [
  //     {
  //       id: 1,
  //       className: 'First Year',
  //       departmentCode: 'CST',
  //       semesterId: 1
  //     },
  //     {
  //       id: 2,
  //       className: 'Second Year',
  //       departmentCode: 'CS',
  //       semesterId: 1
  //     },
  //     {
  //       id: 3,
  //       className: 'Second Year',
  //       departmentCode: 'CT',
  //       semesterId: 1
  //     },
  //     {
  //       id: 4,
  //       className: 'Third Year',
  //       departmentCode: 'CS',
  //       semesterId: 1
  //     },
  //     {
  //       id: 5,
  //       className: 'Third Year',
  //       departmentCode: 'CT',
  //       semesterId: 1
  //     },
  //     {
  //       id: 6,
  //       className: 'Fourth Year',
  //       departmentCode: 'CS',
  //       semesterId: 1
  //     },
  //     {
  //       id: 7,
  //       className: 'Fourth Year',
  //       departmentCode: 'CT',
  //       semesterId: 1
  //     },
  //     {
  //       id: 8,
  //       className: 'Fifth Year',
  //       departmentCode: 'CS',
  //       semesterId: 1
  //     },
  //     {
  //       id: 9,
  //       className: 'Fifth Year',
  //       departmentCode: 'CT',
  //       semesterId: 1
  //     }
  //   ],
  //   skipDuplicates: true
  // });

  // // Seed Subjects
  // await prisma.subject.createMany({
  //   data: [
  //     {
  //       id: 'M-1201',
  //       subjectName: 'Myanmar',
  //       creditHours: 3.0,
  //       examWeight: 0.6,
  //       assignWeight: 0.4
  //     },
  //     {
  //       id: 'E-1201',
  //       subjectName: 'English',
  //       creditHours: 3.0,
  //       examWeight: 0.6,
  //       assignWeight: 0.4
  //     },
  //     {
  //       id: 'P-1201',
  //       subjectName: 'Physics',
  //       creditHours: 3.0,
  //       examWeight: 0.6,
  //       assignWeight: 0.4
  //     },
  //     {
  //       id: 'CST-1211',
  //       subjectName: 'C++',
  //       creditHours: 3.0,
  //       examWeight: 0.5,
  //       assignWeight: 0.5
  //     },
  //     {
  //       id: 'CST-1242',
  //       subjectName: 'Maths',
  //       creditHours: 3.0,
  //       examWeight: 0.6,
  //       assignWeight: 0.4
  //     }
  //   ],
  //   skipDuplicates: true
  // });

  // // Seed ClassSubjects
  // await prisma.classSubject.createMany({
  //   data: [
  //     {
  //       id: 1,
  //       classId: 1,
  //       subjectId: 'M-1201'
  //     },
  //     {
  //       id: 2,
  //       classId: 1,
  //       subjectId: 'E-1201'
  //     },
  //     {
  //       id: 3,
  //       classId: 1,
  //       subjectId: 'P-1201'
  //     },
  //     {
  //       id: 4,
  //       classId: 1,
  //       subjectId: 'CST-1211'
  //     },
  //     {
  //       id: 5,
  //       classId: 1,
  //       subjectId: 'CST-1242'
  //     }
  //   ],
  //   skipDuplicates: true
  // });

  // // Seed Students
  // await prisma.student.createMany({
  //   data: [
  //     {
  //       id: 1,
  //       studentName: 'John Doe',
  //       admissionId: '202201'
  //     },
  //     {
  //       id: 2,
  //       studentName: 'Jane Smith',
  //       admissionId: '202202'
  //     },
  //     {
  //       id: 3,
  //       studentName: 'Robert Johnson',
  //       admissionId: '202203'
  //     }
  //   ],
  //   skipDuplicates: true
  // });

  // Seed GradeScales
  await prisma.gradeScale.createMany({
    data: [
      {
        minMark: 0,
        maxMark: 39,
        grade: 'F',
        score: 0
      },
      {
        minMark: 40,
        maxMark: 49,
        grade: 'D',
        score: 1
      },
      {
        minMark: 50,
        maxMark: 54,
        grade: 'C',
        score: 2
      },
      {
        minMark: 55,
        maxMark: 59,
        grade: 'C+',
        score: 2.33
      },
      {
        minMark: 60,
        maxMark: 64,
        grade: 'B-',
        score: 2.67
      },
      {
        minMark: 65,
        maxMark: 69,
        grade: 'B',
        score: 3
      },
      {
        minMark: 70,
        maxMark: 74,
        grade: 'B+',
        score: 3.33
      },
      {
        minMark: 75,
        maxMark: 79,
        grade: 'A-',
        score: 3.67
      },
      {
        minMark: 80,
        maxMark: 89,
        grade: 'A',
        score: 3.8
      },
      {
        minMark: 90,
        maxMark: 100,
        grade: 'A+',
        score: 4
      }
    ],
    skipDuplicates: true
  });

  // const hashedPassword = await bcrypt.hash('admin123', 10);
  // await prisma.user.create({
  //   data: {
  //     name: 'Admin',
  //     email: 'admin@ucsh.edu.mm',
  //     hashedPassword,
  //     emailVerified: new Date()
  //   }
  // });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
