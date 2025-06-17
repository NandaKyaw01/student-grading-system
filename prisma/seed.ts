import { prisma } from '@/lib/db';
import { faker } from '@faker-js/faker/locale/en';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function main() {
  // Clear existing data
  await prisma.$transaction([
    prisma.result.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.classSubject.deleteMany(),
    prisma.student.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.class.deleteMany(),
    prisma.semester.deleteMany(),
    prisma.academicYear.deleteMany(),
    prisma.gradeScale.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.user.deleteMany()
  ]);

  // Create Grade Scale
  const gradeScales = [
    { minMark: 90, maxMark: 100, grade: 'A+', score: 4.0 },
    { minMark: 85, maxMark: 89, grade: 'A', score: 4.0 },
    { minMark: 80, maxMark: 84, grade: 'A-', score: 3.7 },
    { minMark: 77, maxMark: 79, grade: 'B+', score: 3.3 },
    { minMark: 73, maxMark: 76, grade: 'B', score: 3.0 },
    { minMark: 70, maxMark: 72, grade: 'B-', score: 2.7 },
    { minMark: 67, maxMark: 69, grade: 'C+', score: 2.3 },
    { minMark: 63, maxMark: 66, grade: 'C', score: 2.0 },
    { minMark: 60, maxMark: 62, grade: 'C-', score: 1.7 },
    { minMark: 50, maxMark: 59, grade: 'D', score: 1.0 },
    { minMark: 0, maxMark: 49, grade: 'F', score: 0.0 }
  ];

  await Promise.all(
    gradeScales.map((scale) => prisma.gradeScale.create({ data: scale }))
  );

  // Create Academic Year (2024-2025)
  const academicYear = await prisma.academicYear.create({
    data: {
      yearRange: '2024-2025',
      isCurrent: true
    }
  });

  // Create Semesters
  const semesters = [
    await prisma.semester.create({
      data: {
        semesterName: '1st Semester',
        academicYearId: academicYear.id,
        isCurrent: true
      }
    }),
    await prisma.semester.create({
      data: {
        semesterName: '2nd Semester',
        academicYearId: academicYear.id,
        isCurrent: false
      }
    })
  ];

  // Create Subjects with proper exam/assign weights
  const subjects = [
    {
      id: 'M-101',
      subjectName: 'Mathematics',
      creditHours: 4.0,
      examWeight: 0.7,
      assignWeight: 0.3
    },
    {
      id: 'P-102',
      subjectName: 'Physics',
      creditHours: 3.0,
      examWeight: 0.6,
      assignWeight: 0.4
    },
    {
      id: 'C-103',
      subjectName: 'Chemistry',
      creditHours: 3.0,
      examWeight: 0.6,
      assignWeight: 0.4
    },
    {
      id: 'CS-201',
      subjectName: 'Programming Fundamentals',
      creditHours: 3.0,
      examWeight: 0.5,
      assignWeight: 0.5
    },
    {
      id: 'CS-202',
      subjectName: 'Data Structures',
      creditHours: 3.0,
      examWeight: 0.6,
      assignWeight: 0.4
    },
    {
      id: 'CS-203',
      subjectName: 'Algorithms',
      creditHours: 3.0,
      examWeight: 0.7,
      assignWeight: 0.3
    },
    {
      id: 'CT-301',
      subjectName: 'Networking',
      creditHours: 3.0,
      examWeight: 0.6,
      assignWeight: 0.4
    },
    {
      id: 'CT-302',
      subjectName: 'Database Systems',
      creditHours: 3.0,
      examWeight: 0.5,
      assignWeight: 0.5
    },
    {
      id: 'CST-401',
      subjectName: 'Web Development',
      creditHours: 3.0,
      examWeight: 0.4,
      assignWeight: 0.6
    },
    {
      id: 'CST-402',
      subjectName: 'Mobile Development',
      creditHours: 3.0,
      examWeight: 0.4,
      assignWeight: 0.6
    }
  ];

  await Promise.all(
    subjects.map((subject) => prisma.subject.create({ data: subject }))
  );

  // Create Classes for each year level
  const yearLevels = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
  const classes = [];

  for (const semester of semesters) {
    for (const [index, yearLevel] of yearLevels.entries()) {
      // First Year only has CST
      if (index === 0) {
        classes.push(
          await prisma.class.create({
            data: {
              className: `${yearLevel} CST`,
              departmentCode: 'CST',
              semesterId: semester.id
            }
          })
        );
      } else {
        // Other years have CS and CT
        classes.push(
          await prisma.class.create({
            data: {
              className: `${yearLevel} CS`,
              departmentCode: 'CS',
              semesterId: semester.id
            }
          }),
          await prisma.class.create({
            data: {
              className: `${yearLevel} CT`,
              departmentCode: 'CT',
              semesterId: semester.id
            }
          })
        );
      }
    }
  }

  // Create Class-Subject relationships
  const classSubjects = [];
  for (const cls of classes) {
    const subjectCount = faker.number.int({ min: 4, max: 6 });
    const selectedSubjects = faker.helpers.arrayElements(
      subjects,
      subjectCount
    );

    for (const subject of selectedSubjects) {
      classSubjects.push(
        await prisma.classSubject.create({
          data: {
            classId: cls.id,
            subjectId: subject.id
          }
        })
      );
    }
  }

  // Create Students (50 students)
  const students = [];
  for (let i = 0; i < 50; i++) {
    students.push(
      await prisma.student.create({
        data: {
          studentName: faker.person.fullName()
        }
      })
    );
  }

  // Create Enrollments in current semester
  const currentSemester = semesters.find((s) => s.isCurrent);
  if (!currentSemester) throw new Error('Current semester not found');

  const currentClasses = classes.filter(
    (c) => c.semesterId === currentSemester.id
  );

  const enrollments = [];
  for (const student of students) {
    const cls = faker.helpers.arrayElement(currentClasses);
    enrollments.push(
      await prisma.enrollment.create({
        data: {
          rollNumber: `R${faker.string.numeric(5)}`,
          studentId: student.id,
          classId: cls.id,
          semesterId: currentSemester.id,
          isActive: true
        }
      })
    );
  }

  // Create Grades for each enrollment
  for (const enrollment of enrollments) {
    const classSubjectsForClass = classSubjects.filter(
      (cs) => cs.classId === enrollment.classId
    );

    for (const classSubject of classSubjectsForClass) {
      const subject = subjects.find((s) => s.id === classSubject.subjectId);
      if (!subject) continue;

      const examMark = parseFloat(
        faker.number.float({ min: 0, max: 100, fractionDigits: 1 }).toFixed(1)
      );
      const assignMark = parseFloat(
        faker.number.float({ min: 0, max: 100, fractionDigits: 1 }).toFixed(1)
      );
      const finalMark =
        examMark * subject.examWeight + assignMark * subject.assignWeight;

      const gradeScale = gradeScales.find(
        (gs) => finalMark >= gs.minMark && finalMark <= gs.maxMark
      );

      if (gradeScale) {
        await prisma.grade.create({
          data: {
            enrollmentId: enrollment.id,
            classSubjectId: classSubject.id,
            examMark,
            assignMark,
            finalMark,
            grade: gradeScale.grade,
            score: gradeScale.score,
            gp: gradeScale.score * subject.creditHours
          }
        });
      }
    }
  }

  // Create Results with GPA calculation
  for (const enrollment of enrollments) {
    const grades = await prisma.grade.findMany({
      where: { enrollmentId: enrollment.id },
      include: { classSubject: { include: { subject: true } } }
    });

    let totalGP = 0;
    let totalCredits = 0;

    for (const grade of grades) {
      totalGP += grade.gp;
      totalCredits += grade.classSubject.subject.creditHours;
    }

    const gpa = totalCredits > 0 ? totalGP / totalCredits : 0;

    await prisma.result.create({
      data: {
        enrollmentId: enrollment.id,
        gpa,
        totalCredits
      }
    });
  }

  // Create Users (Admin and Student)
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  const studentPassword = await bcrypt.hash('student123', SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: 'admin@ucsh.edu.mm',
      hashedPassword: adminPassword,
      accounts: {
        create: {
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: 'admin'
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      email: 'student@school.edu',
      hashedPassword: studentPassword,
      accounts: {
        create: {
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: 'student'
        }
      }
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
