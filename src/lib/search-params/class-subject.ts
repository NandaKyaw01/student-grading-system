import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { Class } from '@/generated/prisma';
import { getSortingStateParser } from '@/lib/parsers';
import { z } from 'zod';

export const classSubjectSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  departmentCode: parseAsArrayOf(z.string()).withDefault([]),
  academicYearId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  semesterId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  sort: getSortingStateParser<Class>()
};

export const classSubjectSearchParamsCache = createSearchParamsCache(
  classSubjectSearchParams
);
export const classSerialize = createSerializer(classSubjectSearchParams);

export type GetClassSchema = Awaited<
  ReturnType<typeof classSubjectSearchParamsCache.parse>
>;
