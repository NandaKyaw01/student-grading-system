import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - uncomment if needed)
  // await prisma.user.deleteMany();
  // await prisma.classSubject.deleteMany();
  // await prisma.gradeScale.deleteMany();
  // await prisma.subject.deleteMany();
  // await prisma.class.deleteMany();
  // await prisma.semester.deleteMany();
  // await prisma.academicYear.deleteMany();

  // Seed AcademicYear
  console.log('📚 Seeding Academic Years...');
  const academicYears = await prisma.academicYear.createMany({
    data: [
      {
        yearRange: '2024-2025',
        isCurrent: true
      },
      {
        yearRange: '2025-2026',
        isCurrent: false
      }
    ]
  });
  console.log(`✅ Created ${academicYears.count} academic year(s)`);

  // Seed Semester
  console.log('📅 Seeding Semesters...');
  const semesters = await prisma.semester.createMany({
    data: [
      {
        semesterName: 'First Semester',
        academicYearId: 1,
        isCurrent: false
      },
      {
        semesterName: 'Second Semester',
        academicYearId: 1,
        isCurrent: true
      },
      {
        semesterName: 'First Semester',
        academicYearId: 2,
        isCurrent: false
      },
      {
        semesterName: 'Second Semester',
        academicYearId: 2,
        isCurrent: false
      }
    ]
  });
  console.log(`✅ Created ${semesters.count} semester(s)`);

  // Seed Class
  console.log('🏫 Seeding Classes...');
  const classes = await prisma.class.createMany({
    data: [
      {
        className: 'First Year',
        departmentCode: '1101 CST',
        semesterId: 1
      },
      {
        className: 'Second Year',
        departmentCode: '1102 CS',
        semesterId: 1
      },
      {
        className: 'Second Year',
        departmentCode: '1103 CT',
        semesterId: 1
      },
      {
        className: 'Third Year',
        departmentCode: '1104 CS',
        semesterId: 1
      },
      {
        className: 'Third Year',
        departmentCode: '1105 CT',
        semesterId: 1
      },
      {
        className: 'Fourth Year',
        departmentCode: '1106 CS',
        semesterId: 1
      },
      {
        className: 'Fourth Year',
        departmentCode: '1107 CT',
        semesterId: 1
      },
      {
        className: 'Fifth Year',
        departmentCode: '1108 CS',
        semesterId: 1
      },
      {
        className: 'Fifth Year',
        departmentCode: '1109 CT',
        semesterId: 1
      },
      {
        className: 'First Year',
        departmentCode: '1201 CST',
        semesterId: 2
      },
      {
        className: 'Second Year',
        departmentCode: '1202 CS',
        semesterId: 2
      },
      {
        className: 'Second Year',
        departmentCode: '1203 CT',
        semesterId: 2
      },
      {
        className: 'Third Year',
        departmentCode: '1204 CS',
        semesterId: 2
      },
      {
        className: 'Third Year',
        departmentCode: '1205 CT',
        semesterId: 2
      },
      {
        className: 'Fourth Year',
        departmentCode: '1206 CS',
        semesterId: 2
      },
      {
        className: 'Fourth Year',
        departmentCode: '1207 CT',
        semesterId: 2
      },
      {
        className: 'Fifth Year',
        departmentCode: '1208 CS',
        semesterId: 2
      },
      {
        className: 'Fifth Year',
        departmentCode: '1209 CT',
        semesterId: 2
      },
      {
        className: 'First Year',
        departmentCode: '1301 CST',
        semesterId: 3
      },
      {
        className: 'Second Year',
        departmentCode: '1302 CS',
        semesterId: 3
      },
      {
        className: 'Second Year',
        departmentCode: '1303 CT',
        semesterId: 3
      },
      {
        className: 'Third Year',
        departmentCode: '1304 CS',
        semesterId: 3
      },
      {
        className: 'Third Year',
        departmentCode: '1305 CT',
        semesterId: 3
      },
      {
        className: 'Fourth Year',
        departmentCode: '1306 CS',
        semesterId: 3
      },
      {
        className: 'Fourth Year',
        departmentCode: '1307 CT',
        semesterId: 3
      },
      {
        className: 'Fifth Year',
        departmentCode: '1308 CS',
        semesterId: 3
      },
      {
        className: 'Fifth Year',
        departmentCode: '1309 CT',
        semesterId: 3
      },
      {
        className: 'First Year',
        departmentCode: '1401 CST',
        semesterId: 4
      },
      {
        className: 'Second Year',
        departmentCode: '1402 CS',
        semesterId: 4
      },
      {
        className: 'Second Year',
        departmentCode: '1403 CT',
        semesterId: 4
      },
      {
        className: 'Third Year',
        departmentCode: '1404 CS',
        semesterId: 4
      },
      {
        className: 'Third Year',
        departmentCode: '1405 CT',
        semesterId: 4
      },
      {
        className: 'Fourth Year',
        departmentCode: '1406 CS',
        semesterId: 4
      },
      {
        className: 'Fourth Year',
        departmentCode: '1407 CT',
        semesterId: 4
      },
      {
        className: 'Fifth Year',
        departmentCode: '1408 CS',
        semesterId: 4
      },
      {
        className: 'Fifth Year',
        departmentCode: '1409 CT',
        semesterId: 4
      }
    ]
  });
  console.log(`✅ Created ${classes.count} class(es)`);

  // Seed Subject
  console.log('📖 Seeding Subjects...');
  const subjects = await prisma.subject.createMany({
    data: [
      {
        id: 'M-1201',
        subjectName: 'Myanmar',
        creditHours: 3.0,
        examWeight: 0.6,
        assignWeight: 0.4
      },
      {
        id: 'E-1201',
        subjectName: 'English',
        creditHours: 3.0,
        examWeight: 0.6,
        assignWeight: 0.4
      },
      {
        id: 'P-1201',
        subjectName: 'Physics',
        creditHours: 3.0,
        examWeight: 0.6,
        assignWeight: 0.4
      },
      {
        id: 'CST-1211',
        subjectName: 'C++',
        creditHours: 3.0,
        examWeight: 0.5,
        assignWeight: 0.5
      },
      {
        id: 'CST-1242',
        subjectName: 'Maths',
        creditHours: 3.0,
        examWeight: 0.6,
        assignWeight: 0.4
      }
    ]
  });
  console.log(`✅ Created ${subjects.count} subject(s)`);

  // Seed ClassSubject
  console.log('🔗 Seeding Class-Subject relationships...');
  const classSubjects = await prisma.classSubject.createMany({
    data: [
      {
        classId: 1,
        subjectId: 'M-1201'
      },
      {
        classId: 1,
        subjectId: 'E-1201'
      },
      {
        classId: 1,
        subjectId: 'P-1201'
      },
      {
        classId: 1,
        subjectId: 'CST-1211'
      },
      {
        classId: 1,
        subjectId: 'CST-1242'
      }
    ]
  });
  console.log(
    `✅ Created ${classSubjects.count} class-subject relationship(s)`
  );

  // Seed GradeScale
  console.log('📊 Seeding Grade Scales...');
  const gradeScales = await prisma.gradeScale.createMany({
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
    ]
  });
  console.log(`✅ Created ${gradeScales.count} grade scale(s)`);

  // Seed User with bcrypt hashed password
  console.log('👤 Seeding Users...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@ucsh.edu.mm',
      hashedPassword: hashedPassword
    }
  });
  console.log(`✅ Created user: ${user.email}`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
