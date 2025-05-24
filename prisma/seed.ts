import { prisma } from '@/lib/db';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const academicYearsData = [
  '2021-2022',
  '2022-2023',
  '2023-2024',
  '2024-2025',
  '2025-2026'
];

const classNames = [
  'First Year',
  'Second Year',
  'Third Year',
  'Fourth Year',
  'Fifth Year'
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Academic Years
  const academicYears = await Promise.all(
    academicYearsData.map((year) =>
      prisma.academicYear.upsert({
        where: { year },
        update: {},
        create: { year }
      })
    )
  );

  // 2. Create Classes and associate with Academic Years
  const classes = await Promise.all(
    classNames.map((className, index) =>
      prisma.class.upsert({
        where: { className },
        update: {},
        create: {
          className,
          academicYearId: academicYears[index].id
        }
      })
    )
  );

  // 3. Create Admin User
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

  // 4. Create 50 Students
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const students: any[] = [];
  for (let i = 0; i < 50; i++) {
    const classIndex = i % 5; // Distribute across 5 classes
    const year = academicYears[classIndex];
    const classItem = classes[classIndex];

    students.push({
      name: faker.person.fullName(),
      rollNumber: `${classIndex + 1}CS-${i + 1}`,
      academicYearId: year.id,
      classId: classItem.id
    });
  }

  await prisma.student.createMany({
    data: students
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
