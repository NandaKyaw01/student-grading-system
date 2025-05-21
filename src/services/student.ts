// services/studentService.ts
import { prisma } from '@/lib/prisma';

export async function getAllStudents() {
  return prisma.student.findMany({
    include: {
      class: true,
      academicYear: true
    }
  });
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      academicYear: true
    }
  });
}
