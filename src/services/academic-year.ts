// services/academicYearService.ts
import { prisma } from '@/lib/db';

export async function getAllAcademicYears() {
  return prisma.academicYear.findMany();
}
