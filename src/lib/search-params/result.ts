import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { Result, Status } from '@/generated/prisma';
import { z } from 'zod';

export const resultSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  academicYearId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  semesterId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  classId: parseAsArrayOf(z.coerce.number()).withDefault([]),
  status: parseAsArrayOf(z.nativeEnum(Status)).withDefault([]),
  createdAt: parseAsString,
  sort: getSortingStateParser<Result>()
};

export const resultSearchParamsCache =
  createSearchParamsCache(resultSearchParams);
export const resultSerialize = createSerializer(resultSearchParams);

export type GetResultSchema = Awaited<
  ReturnType<typeof resultSearchParamsCache.parse>
>;
