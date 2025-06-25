import { Semester } from '@/generated/prisma';
import { getSortingStateParser } from '@/lib/parsers';
import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';
import { z } from 'zod';

export const classSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  isCurrent: parseAsString,
  academicYearId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  sort: getSortingStateParser<Semester>().withDefault([
    { id: 'academicYearId', desc: false }
  ])
};

export const semesterSearchParamsCache =
  createSearchParamsCache(classSearchParams);
export const classSerialize = createSerializer(classSearchParams);

export type GetSemesterSchema = Awaited<
  ReturnType<typeof semesterSearchParamsCache.parse>
>;
