import { Code } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

async function main() {
  // Clear existing data (be careful with this in production)
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.academicYearResult.deleteMany();
  await prisma.result.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.gradeScale.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.academicYear.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@ucsh.edu.mm',
      hashedPassword,
      emailVerified: new Date()
    }
  });

  // Create grade scales
  const gradeScales = [
    { minMark: 80, maxMark: 100, grade: 'A', score: 4.0 },
    { minMark: 75, maxMark: 79, grade: 'A-', score: 3.7 },
    { minMark: 70, maxMark: 74, grade: 'B+', score: 3.3 },
    { minMark: 65, maxMark: 69, grade: 'B', score: 3.0 },
    { minMark: 60, maxMark: 64, grade: 'B-', score: 2.7 },
    { minMark: 55, maxMark: 59, grade: 'C+', score: 2.3 },
    { minMark: 50, maxMark: 54, grade: 'C', score: 2.0 },
    { minMark: 45, maxMark: 49, grade: 'C-', score: 1.7 },
    { minMark: 40, maxMark: 44, grade: 'D', score: 1.0 },
    { minMark: 0, maxMark: 39, grade: 'F', score: 0.0 }
  ];

  for (const scale of gradeScales) {
    await prisma.gradeScale.create({
      data: scale
    });
  }

  // Create academic years
  const currentYear = new Date().getFullYear();
  const academicYears = [
    { yearRange: `${currentYear - 2}-${currentYear - 1}`, isCurrent: false },
    { yearRange: `${currentYear - 1}-${currentYear}`, isCurrent: false },
    { yearRange: `${currentYear}-${currentYear + 1}`, isCurrent: true }
  ];

  for (const [index, year] of academicYears.entries()) {
    const createdYear = await prisma.academicYear.create({
      data: {
        yearRange: year.yearRange,
        isCurrent: year.isCurrent
      }
    });

    // Create semesters for each academic year
    const semesters = ['First Semester', 'Second Semester'];
    for (const [semIndex, semesterName] of semesters.entries()) {
      const isCurrent = year.isCurrent && semIndex === 1; // Make second semester current
      await prisma.semester.create({
        data: {
          semesterName,
          academicYearId: createdYear.id,
          isCurrent
        }
      });
    }
  }

  // Create subjects
  const commonSubjects = [
    {
      id: 'CS101',
      subjectName: 'Introduction to Programming',
      creditHours: 4.0
    },
    { id: 'CS102', subjectName: 'Data Structures', creditHours: 4.0 },
    { id: 'CS103', subjectName: 'Algorithms', creditHours: 3.0 },
    { id: 'CS104', subjectName: 'Database Systems', creditHours: 3.0 },
    { id: 'CS105', subjectName: 'Computer Networks', creditHours: 3.0 },
    { id: 'CS106', subjectName: 'Operating Systems', creditHours: 3.0 },
    { id: 'CS107', subjectName: 'Software Engineering', creditHours: 3.0 },
    { id: 'CS108', subjectName: 'Web Development', creditHours: 3.0 },
    { id: 'CS109', subjectName: 'Mobile Development', creditHours: 3.0 },
    { id: 'CS110', subjectName: 'Artificial Intelligence', creditHours: 3.0 },
    { id: 'MATH101', subjectName: 'Discrete Mathematics', creditHours: 3.0 },
    { id: 'MATH102', subjectName: 'Calculus', creditHours: 3.0 },
    { id: 'ENG101', subjectName: 'Technical Writing', creditHours: 2.0 }
  ];

  for (const subject of commonSubjects) {
    await prisma.subject.create({
      data: {
        ...subject,
        examWeight: 0.6,
        assignWeight: 0.4
      }
    });
  }

  // Get all semesters
  const allSemesters = await prisma.semester.findMany();

  // Create classes for each semester
  for (const semester of allSemesters) {
    const yearNumber = semester.semesterName.includes('First') ? 1 : 2;
    const departmentCodes =
      yearNumber === 1 ? ['CS', 'CT', 'CST'] : ['CS', 'CT'];

    for (const code of departmentCodes) {
      const className = `${faker.word.adjective()} ${yearNumber === 1 ? 'First' : 'Second'} Year (${code})`;
      const createdClass = await prisma.class.create({
        data: {
          className,
          departmentCode: code as Code,
          semesterId: semester.id
        }
      });

      // Assign subjects to class
      const subjectsToAssign = commonSubjects.slice(
        0,
        faker.number.int({ min: 4, max: 6 })
      );
      for (const subject of subjectsToAssign) {
        await prisma.classSubject.create({
          data: {
            classId: createdClass.id,
            subjectId: subject.id
          }
        });
      }
    }
  }

  // Create students
  const students = [];
  for (let i = 0; i < 50; i++) {
    const admissionId = faker.string.numeric(6);
    const student = await prisma.student.create({
      data: {
        studentName: faker.person.fullName(),
        admissionId
      }
    });
    students.push(student);
  }

  // Enroll students in classes
  const classes = await prisma.class.findMany({
    include: {
      semester: true
    }
  });

  const enrolledStudents = new Set<number>();

  for (const cls of classes) {
    // Filter out students already enrolled in this academic year
    const availableStudents = students.filter((student) => {
      const academicYearId = cls.semester.academicYearId;
      return !enrolledStudents.has(student.id);
    });

    // Enroll 10-20 available students in each class
    const studentsToEnroll = faker.helpers
      .shuffle(availableStudents)
      .slice(0, faker.number.int({ min: 10, max: 20 }));

    for (const [index, student] of studentsToEnroll.entries()) {
      const rollNumber = `${cls.semester.semesterName.includes('First') ? '1' : '2'}${cls.departmentCode}-${(index + 1).toString().padStart(2, '0')}`;

      // Only set as active if it's the first semester
      const isActive = cls.semester.semesterName.includes('First');

      const enrollment = await prisma.enrollment.create({
        data: {
          rollNumber,
          studentId: student.id,
          classId: cls.id,
          semesterId: cls.semester.id,
          isActive
        }
      });

      if (isActive) {
        enrolledStudents.add(student.id);
      }

      // Create grades for each subject in the class
      const classSubjects = await prisma.classSubject.findMany({
        where: {
          classId: cls.id
        },
        include: {
          subject: true
        }
      });

      for (const classSubject of classSubjects) {
        const examMark = faker.number.float({
          min: 30,
          max: 100,
          fractionDigits: 1
        });
        const assignMark = faker.number.float({
          min: 30,
          max: 100,
          fractionDigits: 1
        });
        const finalMark = examMark * 0.6 + assignMark * 0.4;

        // Find the appropriate grade
        const gradeScale = gradeScales.find(
          (scale) => finalMark >= scale.minMark && finalMark <= scale.maxMark
        );

        await prisma.grade.create({
          data: {
            enrollmentId: enrollment.id,
            classSubjectId: classSubject.id,
            examMark,
            assignMark,
            finalMark,
            grade: gradeScale?.grade || 'F',
            score: gradeScale?.score || 0.0,
            gp:
              (gradeScale?.score || 0.0) *
              (classSubject.subject?.creditHours || 3.0)
          }
        });
      }

      // Calculate and create result for the enrollment
      const grades = await prisma.grade.findMany({
        where: {
          enrollmentId: enrollment.id
        },
        include: {
          classSubject: {
            include: {
              subject: true
            }
          }
        }
      });

      let totalGp = 0;
      let totalCredits = 0;

      for (const grade of grades) {
        totalGp += grade.gp;
        totalCredits += grade.classSubject.subject.creditHours;
      }

      const gpa = totalCredits > 0 ? totalGp / totalCredits : 0;

      await prisma.result.create({
        data: {
          enrollmentId: enrollment.id,
          gpa,
          totalCredits,
          totalGp
        }
      });
    }
  }

  const secondSemesters = await prisma.semester.findMany({
    where: {
      semesterName: {
        contains: 'Second'
      }
    }
  });

  for (const semester of secondSemesters) {
    await prisma.enrollment.updateMany({
      where: {
        semesterId: semester.id,
        isActive: true
      },
      data: {
        isActive: false
      }
    });
  }

  // Create academic year results
  const academicYearsInDb = await prisma.academicYear.findMany();
  const allClasses = await prisma.class.findMany({
    include: {
      semester: true
    }
  });

  for (const student of students) {
    for (const academicYear of academicYearsInDb) {
      // Find second semester classes for this academic year
      const secondSemester = await prisma.semester.findFirst({
        where: {
          academicYearId: academicYear.id,
          semesterName: {
            contains: 'Second'
          }
        }
      });

      if (secondSemester) {
        // Find the student's enrollment in this semester
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: student.id,
            semesterId: secondSemester.id
          },
          include: {
            result: true,
            class: true
          }
        });

        if (enrollment && enrollment.result) {
          // Create academic year result based on second semester
          await prisma.academicYearResult.create({
            data: {
              studentId: student.id,
              academicYearId: academicYear.id,
              overallGpa: enrollment.result.gpa,
              totalCredits: enrollment.result.totalCredits,
              totalGp: enrollment.result.totalGp,
              status: enrollment.result.gpa >= 2.0 ? 'PASS' : 'FAIL'
            }
          });
        }
      }
    }
  }

  // Update year ranks
  for (const academicYear of academicYearsInDb) {
    const yearResults = await prisma.academicYearResult.findMany({
      where: {
        academicYearId: academicYear.id
      },
      orderBy: {
        overallGpa: 'desc'
      }
    });

    for (let i = 0; i < yearResults.length; i++) {
      await prisma.academicYearResult.update({
        where: {
          id: yearResults[i].id
        },
        data: {
          yearRank: i + 1
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
