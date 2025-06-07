'use server';

import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';
import { getErrorMessage } from '@/lib/handle-error';
import {
  CreateStudentInput,
  UpdateStudentInput
} from '@/lib/zod-schemas/student-schema';

export async function createStudent(input: CreateStudentInput) {
  try {
    const student = await prisma.student.create({
      data: {
        studentName: input.name
      }
    });

    revalidateTag('students');

    return {
      data: student,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

export async function updateStudent(input: UpdateStudentInput) {
  try {
    const student = await prisma.student.update({
      where: { id: input.id },
      data: {
        studentName: input.name
      }
    });

    revalidateTag('students');
    revalidateTag(`student-${input.id}`);

    return {
      data: student,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

export async function deleteStudent(id: number) {
  try {
    await prisma.student.delete({
      where: { id }
    });

    revalidateTag('students');

    return {
      data: true,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

export async function deleteStudents(ids: number[]) {
  try {
    await prisma.student.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    revalidateTag('students');

    return {
      data: true,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}
