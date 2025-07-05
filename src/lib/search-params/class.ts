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

export const classSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  departmentCode: parseAsArrayOf(z.string()).withDefault([]),
  academicYearId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  semesterId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  sort: getSortingStateParser<Class>()
};

export const classSearchParamsCache =
  createSearchParamsCache(classSearchParams);
export const classSerialize = createSerializer(classSearchParams);

export type GetClassSchema = Awaited<
  ReturnType<typeof classSearchParamsCache.parse>
>;
