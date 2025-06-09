import {
  createSearchParamsCache,
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { Result } from '@/generated/prisma';

export const resultSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(''),
  semesterId: parseAsInteger,
  studentId: parseAsInteger,
  sort: getSortingStateParser<Result>().withDefault([{ id: 'gpa', desc: true }])
};

export const resultSearchParamsCache =
  createSearchParamsCache(resultSearchParams);
export const resultSerialize = createSerializer(resultSearchParams);

export type GetResultSchema = Awaited<
  ReturnType<typeof resultSearchParamsCache.parse>
>;
