// services/academicYearService.ts
import { prisma } from '@/lib/prisma';

export async function getAllAcademicYears() {
  return prisma.academicYear.findMany();
}
