import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { Student } from '@/types/prisma';

export const studentSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  academicYearId: parseAsString,
  classId: parseAsString,
  sort: getSortingStateParser<Student>().withDefault([
    { id: 'createdAt', desc: true }
  ])
};

export const studentSearchParamsCache =
  createSearchParamsCache(studentSearchParams);
export const studentSerialize = createSerializer(studentSearchParams);

export type GetStudentSchema = Awaited<
  ReturnType<typeof studentSearchParamsCache.parse>
>;
