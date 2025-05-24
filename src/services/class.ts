import { prisma } from '@/lib/db';

export async function getAllClasses() {
  return prisma.class.findMany({
    include: {
      academicYear: true
    }
  });
}
