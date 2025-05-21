import { prisma } from '@/lib/prisma';

export async function getAllClasses() {
  return prisma.class.findMany({
    include: {
      academicYear: true
    }
  });
}
