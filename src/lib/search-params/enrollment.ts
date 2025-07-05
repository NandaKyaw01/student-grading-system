import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { Enrollment } from '@/generated/prisma';
import { z } from 'zod';

export const enrollmentSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  isActive: parseAsBoolean,
  academicYearId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  semesterId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  classId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  departmentCode: parseAsArrayOf(z.string()).withDefault([]),
  createdAt: parseAsString,
  sort: getSortingStateParser<Enrollment>()
};

export const enrollmentSearchParamsCache = createSearchParamsCache(
  enrollmentSearchParams
);
export const enrollmentSerialize = createSerializer(enrollmentSearchParams);

export type GetEnrollmentSchema = Awaited<
  ReturnType<typeof enrollmentSearchParamsCache.parse>
>;
