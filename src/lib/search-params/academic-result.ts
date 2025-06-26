import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { Result } from '@/generated/prisma';
import { z } from 'zod';

export const academicResultSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  academicYearId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  semesterId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  classId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  createdAt: parseAsString,
  sort: getSortingStateParser<Result>()
};

export const academicResultSearchParamsCache = createSearchParamsCache(
  academicResultSearchParams
);
export const resultSerialize = createSerializer(academicResultSearchParams);

export type GetAcademicResultSchema = Awaited<
  ReturnType<typeof academicResultSearchParamsCache.parse>
>;
