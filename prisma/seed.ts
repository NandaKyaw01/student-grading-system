import { prisma } from '@/lib/db';

async function main() {
  // 1. Create Academic Years
  const academicYear2024 = await prisma.academicYear.create({
    data: {
      year: '2024-2025'
    }
  });

  const academicYear2025 = await prisma.academicYear.create({
    data: { year: '2025-2026' }
  });

  // 2. Create Classes
  const class1 = await prisma.class.create({
    data: {
      className: 'Grade 1',
      academicYearId: academicYear2024.id
    }
  });

  const class2 = await prisma.class.create({
    data: {
      className: 'Grade 2',
      academicYearId: academicYear2025.id
    }
  });

  // 3. Create Students
  await prisma.student.createMany({
    data: [
      {
        name: 'Alice Johnson',
        rollNumber: 'A101',
        classId: class1.id,
        academicYearId: academicYear2024.id
      },
      {
        name: 'Bob Smith',
        rollNumber: 'B102',
        classId: class2.id,
        academicYearId: academicYear2025.id
      }
    ]
  });

  console.log('✅ Seed data inserted successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
